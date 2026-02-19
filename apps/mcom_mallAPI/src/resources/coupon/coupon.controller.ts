import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/types';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupons')
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCouponDto: CreateCouponDto) {
    // TODO: Add Role Guard (Admin or Business Owner)
    return this.couponService.create(createCouponDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validate(
    @Body('code') code: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.validateCoupon(code, req.user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('my-redemptions')
  // findUserRedemptions(@Req() req: AuthenticatedRequest) {
  //   return this.couponService.findUserRedemptions(req.user.id);
  // }
}