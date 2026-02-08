import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponProductService } from './coupon-product.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InitiateCouponPurchaseDto } from './dto/initiate-coupon-purchase.dto';
import { VerifyCouponPurchaseDto } from './dto/verify-coupon-purchase.dto';
import { AuthenticatedRequest } from '../../common/types';
import { CouponProductSearchDto } from './dto/coupon-product-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { CouponProduct } from './entities/coupon-product.entity';
import { Query } from '@nestjs/common';

@Controller('coupons')
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly couponProductService: CouponProductService,
  ) {}

  @Public()
  @Get('products/business/:businessId')
  findCouponProductsByBusiness(@Param('businessId') businessId: string) {
    return this.couponProductService.findCouponProductsByBusiness(businessId);
  }

  @Public()
  @Get('products/public')
  findAllPublicProducts(@Query() searchDto: CouponProductSearchDto): Promise<PageDto<CouponProduct>> {
    return this.couponProductService.findAllPublic(searchDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('initiate-purchase')
  initiatePurchase(@Body() initiatePurchaseDto: InitiateCouponPurchaseDto) {
    return this.couponService.initiateCouponPurchase(initiatePurchaseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-purchase')
  verifyPurchase(
    @Body() verifyPurchaseDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.verifyAndCompletePurchase(
      verifyPurchaseDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':code/initiate-reload')
  initiateReload(
    @Param('code') code: string,
    @Body() initiateReloadDto: any,
  ) {
    return this.couponService.initiateCouponReload(code, initiateReloadDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':code/verify-reload')
  verifyReload(
    @Param('code') code: string,
    @Body() verifyReloadDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.verifyAndCompleteReload(
      code,
      verifyReloadDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-coupons')
  findUserCoupons(@Req() req: AuthenticatedRequest) {
    return this.couponService.findUserCoupons(req.user.id);
  }

  @Get(':code')
  findCouponByCode(@Param('code') code: string) {
    return this.couponService.findCouponByCode(code);
  }
}