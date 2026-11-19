import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponProductService } from './coupon-product.service';
import { CouponProductSearchDto } from './dto/coupon-product-search.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Coupons (Public Products)')
@Public()
@Controller('coupons/products')
export class CouponProductPublicController {
  constructor(
    private readonly couponProductService: CouponProductService,
  ) {}

  @Get('public')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
  @ApiOperation({ summary: 'List publicly available coupon products' })
  findAll(@Query() searchDto: CouponProductSearchDto) {
    return this.couponProductService.findAllPublic(searchDto);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'List coupon products for a business' })
  findByBusiness(@Param('businessId') businessId: string) {
    return this.couponProductService.findCouponProductsByBusiness(businessId);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Get a public coupon product by ID' })
  findOne(@Param('id') id: string) {
    return this.couponProductService.findPublicById(id);
  }
}
