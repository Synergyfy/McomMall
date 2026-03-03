import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Order } from '../order/entities/order.entity';
import { ShippingStatus } from './enums/shipping-status.enum';

@Injectable()
export class RoyalMailService {
  private readonly logger = new Logger(RoyalMailService.name);
  private readonly shippingBaseUrl = 'https://api.royalmail.net/shipping/v3';
  private readonly trackingBaseUrl = 'https://api.royalmail.net/tracking/v2';
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get OAuth2 Token from Royal Mail
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('ROYAL_MAIL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('ROYAL_MAIL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Royal Mail API credentials not configured');
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.shippingBaseUrl}/token`,
          {},
          {
            headers: {
              'X-IBM-Client-Id': clientId,
              'X-IBM-Client-Secret': clientSecret,
            },
          },
        ),
      );

      this.accessToken = response.data.xRMGAuthToken;
      // Tokens are usually valid for 4 hours (14400 seconds)
      this.tokenExpiry = Date.now() + (response.data.expires_in || 14400) * 1000 - 60000; // Subtract 1 min for safety
      return this.accessToken;
    } catch (error) {
      this.logger.error(`Failed to get Royal Mail Access Token: ${error.message}`);
      throw new InternalServerErrorException('Royal Mail Authentication Failed');
    }
  }

  /**
   * Create a shipment and get label/tracking info
   */
  async createShipment(order: Order) {
    if (!order.shippingAddress) {
      throw new BadRequestException('Order shipping address is missing');
    }

    const token = await this.getAccessToken();
    const clientId = this.configService.get<string>('ROYAL_MAIL_CLIENT_ID');

    const payload = {
      shipments: [
        {
          import_reference_number: order.id,
          recipient_contact: {
            name: order.shippingAddress.recipientName,
            telephone: order.shippingAddress.phoneNumber,
            email: order.user.email,
          },
          recipient_address: {
            address_line1: order.shippingAddress.addressLine1,
            address_line2: order.shippingAddress.addressLine2,
            city: order.shippingAddress.city,
            postcode: order.shippingAddress.postalCode,
            country_code: 'GB',
          },
          package_details: {
            weight: order.items.reduce((acc, item) => acc + (item.product.weight * item.quantity), 0) || 500, // Default to 500g if missing
            package_count: 1,
          },
          service_selection: {
            service_code: 'TRM24', // Default to Tracked 24, can be dynamic
          },
        },
      ],
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.shippingBaseUrl}/shipments`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-IBM-Client-Id': clientId,
            'Content-Type': 'application/json',
          },
        }),
      );

      const shipmentResult = response.data.shipments[0];
      return {
        shipmentId: shipmentResult.shipment_id,
        trackingNumber: shipmentResult.tracking_number,
      };
    } catch (error) {
      this.logger.error(`Royal Mail Shipment Creation Failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      throw new InternalServerErrorException('Failed to create Royal Mail shipment');
    }
  }

  /**
   * Retrieve Label for a shipment
   */
  async getLabel(shipmentId: string): Promise<string> {
    const token = await this.getAccessToken();
    const clientId = this.configService.get<string>('ROYAL_MAIL_CLIENT_ID');

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.shippingBaseUrl}/labels/${shipmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-IBM-Client-Id': clientId,
          },
        }),
      );

      return response.data.label_data; // Usually base64
    } catch (error) {
      this.logger.error(`Failed to retrieve Royal Mail label: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve shipping label');
    }
  }

  /**
   * Get tracking summary
   */
  async getTrackingSummary(trackingNumber: string) {
    const token = await this.getAccessToken();
    const clientId = this.configService.get<string>('ROYAL_MAIL_CLIENT_ID');

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.trackingBaseUrl}/mailpieces/${trackingNumber}/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-IBM-Client-Id': clientId,
          },
        }),
      );

      const summary = response.data.mailpiece.summary_status;
      return {
        status: this.mapStatus(summary),
        rawStatus: summary,
        lastUpdate: response.data.mailpiece.status_date_time,
      };
    } catch (error) {
      this.logger.error(`Failed to get tracking summary: ${error.message}`);
      return null;
    }
  }

  /**
   * Create a daily manifest (Close Out)
   * This is required by Royal Mail to finalize billing and documentation.
   */
  async createManifest(businessId: string) {
    const token = await this.getAccessToken();
    const clientId = this.configService.get<string>('ROYAL_MAIL_CLIENT_ID');

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.shippingBaseUrl}/manifests`,
          {
            manifest_request: {
              service_occurrence_id: businessId, // Link to the specific business/location
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-IBM-Client-Id': clientId,
            },
          },
        ),
      );

      return {
        manifestId: response.data.manifest_id,
        manifestPdf: response.data.manifest_data, // PDF documentation for the driver
      };
    } catch (error) {
      this.logger.error(`Royal Mail Manifesting Failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate Royal Mail manifest');
    }
  }

  private mapStatus(rmStatus: string): ShippingStatus {
    const status = rmStatus.toLowerCase();
    if (status.includes('delivered')) return ShippingStatus.DELIVERED;
    if (
      status.includes('transit') ||
      status.includes('sorted') ||
      status.includes('accepted') ||
      status.includes('collected')
    ) {
      return ShippingStatus.SHIPPED;
    }
    return ShippingStatus.LABEL_GENERATED;
  }
}
