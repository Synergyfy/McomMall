import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Shipping')
@ApiBearerAuth()
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-label/:orderId')
  @ApiOperation({ summary: 'Generate shipping label for an order' })
  async generateLabel(@Param('orderId') orderId: string) {
    return this.shippingService.generateLabel(orderId);
  }
}
