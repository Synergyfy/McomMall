import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SystemAuthGuard } from '../voucher/system-voucher.controller'; // Reuse the guard
import { IpWhitelistGuard } from '../../common/middleware/ip-whitelist.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('System Integration')
@Public()
@Controller('system/coupons')
@UseGuards(SystemAuthGuard, IpWhitelistGuard)
export class SystemCouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create a coupon from external system (Loyalty API)',
  })
  async createCoupon(
    @Body()
    payload: {
      amount: number;
      recipientEmail: string;
      recipientName?: string;
      message?: string;
      businessName: string;
    },
  ) {
    return this.couponService.createSystemCoupon(payload);
  }
}
