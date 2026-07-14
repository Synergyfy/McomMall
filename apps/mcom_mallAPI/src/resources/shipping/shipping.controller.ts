import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Order } from '../order/entities/order.entity';

@ApiTags('Shipping')
@ApiBearerAuth()
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-label/:orderId')
  @ApiOperation({
    summary: 'Generate shipping label for an order',
    description:
      'Calls Royal Mail (for UK) or ShipStation to generate a label and tracking number. Updates the order status. Roles: OWNER, ADMIN.',
  })
  @ApiResponse({
    status: 201,
    type: Order,
    description: 'The updated order with label and tracking information.',
  })
  async generateLabel(@Param('orderId') orderId: string) {
    return this.shippingService.generateLabel(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('track/sync')
  @ApiOperation({
    summary: 'Manually sync Royal Mail tracking statuses',
    description:
      'Triggers a background process to fetch real-time tracking updates from Royal Mail for all active shipments. Roles: ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking status sync initiated successfully.',
  })
  async syncTracking() {
    await this.shippingService.pollTrackingUpdates();
    return { message: 'Tracking status sync initiated' };
  }
}
