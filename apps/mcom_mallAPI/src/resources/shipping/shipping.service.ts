import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Business } from '../listings/entities/listing.entity';
import { ShippingStatus } from './enums/shipping-status.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly shipStationApiUrl = 'https://ssapi.shipstation.com';

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly eventEmitter: EventEmitter2,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('ORDER_PAID')
  async handleOrderPaidEvent(payload: { orderId: string }) {
    this.logger.log(`Processing shipping for paid order: ${payload.orderId}`);
    try {
      await this.generateLabel(payload.orderId);
    } catch (error) {
      this.logger.error(
        `Failed to generate label for order ${payload.orderId}: ${error.message}`,
        error.stack,
      );
      // Logic to retry or flag for manual review
    }
  }

  /**
   * Step 1: Pre-Shipment Fraud Check
   * Checks if the order total is safe based on user trust score.
   */
  private async checkFraudRisk(order: Order): Promise<void> {
    const user = order.user;
    const riskThreshold = 500; // Example: Orders > £500 need high trust
    const minTrustScore = 80;

    if (
      Number(order.total) > riskThreshold &&
      user.trustScore < minTrustScore
    ) {
      this.logger.warn(
        `Fraud Risk: Order ${order.id} total ${order.total} exceeds threshold for user ${user.id} (Trust: ${user.trustScore})`,
      );
      throw new BadRequestException(
        'Order flagged for manual review due to risk assessment.',
      );
    }
  }

  /**
   * Step 2: Payload Construction
   * Maps DB entities to ShipStation API structure.
   */
  private createShipmentPayload(order: Order, business: Business) {
    if (!business.location) {
      throw new BadRequestException(
        'Business location is missing for shipping.',
      );
    }

    const storeId = this.configService.get<string>('SHIPSTATION_STORE_ID');

    return {
      orderNumber: order.id,
      orderKey: order.id,
      orderDate: order.created_at,
      paymentDate: order.created_at,
      shipByDate: new Date().toISOString(),
      orderStatus: 'awaiting_shipment',
      customerUsername: order.user.email,
      customerEmail: order.user.email,
      billTo: {
        name: order.user.name,
        // Assuming billing address is same as shipping or handled elsewhere
        street1: '123 Customer St', // Replace with actual Order billing address
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'GB',
      },
      shipTo: {
        name: order.user.name,
        // Replace with actual Order shipping address relation
        street1: '123 Customer St',
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'GB',
      },
      items: order.items.map((item) => ({
        sku: item.product.sku,
        name: item.product.title, // Assuming product has title
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      advancedOptions: {
        storeId: storeId, // Central ID
        customField1: business.businessName, // For tracking
      },
      // Ship From (Sender)
      shipFrom: {
        name: business.businessName,
        company: business.legalName || business.businessName,
        street1: business.location.addressLine1,
        street2: business.location.addressLine2,
        city: business.location.city,
        state: business.location.state,
        postalCode: business.location.postcode,
        country: business.location.countryCode,
        phone: business.businessPhone,
      },
      carrierCode: order.carrierCode || 'stamps_com', // Default or from order
      serviceCode: 'usps_priority_mail', // This should be passed from frontend/order
      weight: {
        value: 10, // Calculate from items
        units: 'ounces',
      },
    };
  }

  /**
   * Main Method: Generate Label
   * Orchestrates the flow: Fraud Check -> Payload -> API -> DB Update -> Event
   */
  async generateLabel(orderId: string): Promise<Order> {
    // 1. Fetch Order with necessary relations
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'user',
        'items',
        'items.product',
        'business',
        'business.location',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (!order.business) {
      throw new BadRequestException(
        `Order ${orderId} is not linked to a business.`,
      );
    }

    // 2. Run Fraud Check
    await this.checkFraudRisk(order);

    // 3. Construct Payload
    const payload = this.createShipmentPayload(order, order.business);
    this.logger.log(`Generated ShipStation Payload for Order ${orderId}`);

    // 4. Call ShipStation API
    const apiKey = this.configService.get<string>('SHIPSTATION_API_KEY');
    const apiSecret = this.configService.get<string>('SHIPSTATION_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'ShipStation API credentials not configured',
      );
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    try {
      // First create the order in ShipStation
      const createOrderResponse = await lastValueFrom(
        this.httpService.post(
          `${this.shipStationApiUrl}/orders/createorder`,
          payload,
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(
        `Order created in ShipStation: ${createOrderResponse.data.orderId}`,
      );

      // Then generate the label for the created order
      // Note: In a real flow, you might separate creation and label generation.
      // Here we assume immediate generation for "Order-to-Label" flow.
      // ShipStation actually requires "shipments/createlabel" for immediate label without order record,
      // OR "orders/createorder" then "shipments/createlabel" referencing the order.
      // To keep it stateless and fast, "shipments/createlabel" is often preferred if we don't need SS as a CMS.
      // However, creating the order first allows better tracking in SS dashboard.
      // Let's use shipments/createlabel directly with full payload for speed/statelessness as requested.

      const labelResponse = await lastValueFrom(
        this.httpService.post(
          `${this.shipStationApiUrl}/shipments/createlabel`,
          payload,
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const shipmentData = labelResponse.data;

      // 5. Update Order
      order.shippingStatus = ShippingStatus.LABEL_GENERATED;
      order.actualShippingCost = shipmentData.shipmentCost;
      order.trackingNumber = shipmentData.trackingNumber;
      order.labelUrl = shipmentData.labelData; // Or labelDownloadUrl depending on response format
      order.carrierCode = shipmentData.carrierCode;

      const savedOrder = await this.orderRepository.save(order);

      // 6. Trigger Event (Output)
      this.eventEmitter.emit('ORDER_LABEL_GENERATED', {
        orderId: savedOrder.id,
        labelUrl: savedOrder.labelUrl,
        vendorEmail: order.business.businessEmail,
      });

      return savedOrder;
    } catch (error) {
      this.logger.error(
        `ShipStation API Error: ${error.response?.data?.ExceptionMessage || error.message}`,
        error.response?.data,
      );
      throw new InternalServerErrorException(
        'Failed to generate shipping label via ShipStation',
      );
    }
  }

  /**
   * Financial Reconciliation Logic
   * Calculates the profit/loss on shipping for a given order.
   */
  calculateShippingDeduction(order: Order): number {
    const collected = Number(order.estimatedShippingFee || 0);
    const cost = Number(order.actualShippingCost || 0);
    // If collected > cost, we made profit (positive)
    // If collected < cost, we deduct the difference (negative)
    return collected - cost;
  }
}
