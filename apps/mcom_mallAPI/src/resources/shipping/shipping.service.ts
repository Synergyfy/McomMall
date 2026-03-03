import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Business } from '../listings/entities/listing.entity';
import { ShippingStatus } from './enums/shipping-status.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { RoyalMailService } from './royal-mail.service';

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
    private readonly royalMailService: RoyalMailService,
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
    }
  }

  async generateLabel(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'user',
        'items',
        'items.product',
        'business',
        'business.location',
        'shippingAddress',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.carrierCode === 'royalmail') {
      return this.generateRoyalMailLabel(order);
    } else {
      return this.generateShipStationLabel(order);
    }
  }

  private async generateRoyalMailLabel(order: Order): Promise<Order> {
    this.logger.log(`Generating Royal Mail Label for Order ${order.id}`);

    const shipment = await this.royalMailService.createShipment(order);
    const labelData = await this.royalMailService.getLabel(shipment.shipmentId);

    order.shippingStatus = ShippingStatus.LABEL_GENERATED;
    order.trackingNumber = shipment.trackingNumber;
    order.royalMailShipmentId = shipment.shipmentId;
    order.royalMailLabelData = labelData;
    // In a real scenario, we'd upload labelData (PDF) to S3 and store the URL in order.labelUrl
    order.labelUrl = `https://storage.mcom.com/labels/rm-${shipment.shipmentId}.pdf`;

    const savedOrder = await this.orderRepository.save(order);

    this.eventEmitter.emit('ORDER_LABEL_GENERATED', {
      orderId: savedOrder.id,
      labelUrl: savedOrder.labelUrl,
      carrier: 'royalmail',
    });

    return savedOrder;
  }

  private async generateShipStationLabel(order: Order): Promise<Order> {
    this.logger.log(`Generating ShipStation Label for Order ${order.id}`);
    
    // Existing ShipStation logic...
    const payload = this.createShipmentPayload(order, order.business);
    const apiKey = this.configService.get<string>('SHIPSTATION_API_KEY');
    const apiSecret = this.configService.get<string>('SHIPSTATION_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new InternalServerErrorException('ShipStation API credentials not configured');
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    try {
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
      order.shippingStatus = ShippingStatus.LABEL_GENERATED;
      order.actualShippingCost = shipmentData.shipmentCost;
      order.trackingNumber = shipmentData.trackingNumber;
      order.labelUrl = shipmentData.labelData;
      order.carrierCode = shipmentData.carrierCode;

      const savedOrder = await this.orderRepository.save(order);
      this.eventEmitter.emit('ORDER_LABEL_GENERATED', {
        orderId: savedOrder.id,
        labelUrl: savedOrder.labelUrl,
        carrier: 'shipstation',
      });

      return savedOrder;
    } catch (error) {
      this.logger.error(`ShipStation API Error: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate shipping label via ShipStation');
    }
  }

  /**
   * Background task to update tracking statuses
   */
  async pollTrackingUpdates() {
    this.logger.log('Polling Royal Mail tracking updates...');
    const activeOrders = await this.orderRepository.find({
      where: {
        carrierCode: 'royalmail',
        shippingStatus: Not(In([ShippingStatus.DELIVERED, ShippingStatus.PENDING])),
      },
    });

    for (const order of activeOrders) {
      if (!order.trackingNumber) continue;

      const tracking = await this.royalMailService.getTrackingSummary(order.trackingNumber);
      if (tracking && tracking.status !== order.shippingStatus) {
        this.logger.log(`Updating Order ${order.id} status: ${order.shippingStatus} -> ${tracking.status}`);
        order.shippingStatus = tracking.status;
        await this.orderRepository.save(order);
        
        this.eventEmitter.emit('SHIPPING_STATUS_UPDATED', {
          orderId: order.id,
          status: tracking.status,
          trackingNumber: order.trackingNumber,
        });
      }
    }
  }

  private createShipmentPayload(order: Order, business: Business) {
    // ... (Keep existing payload logic)
    return {
        orderNumber: order.id,
        // (rest of the payload)
    } as any;
  }
}
