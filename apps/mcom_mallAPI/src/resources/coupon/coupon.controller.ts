import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/types';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Coupon } from './entities/coupon.entity';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Create a new Coupon',
    description: 'Enforces tier-based capabilities for businesses. Admins can create platform coupons. Owners can create business coupons.'
  })
  @ApiResponse({ status: 201, type: Coupon })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Public()
  @Get('list')
  @ApiOperation({ summary: 'List all Coupons (Paginated)', description: 'Public endpoint.' })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.couponService.findAll(pagination);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('validate')
  @ApiOperation({
    summary: 'Validate a Coupon code',
    description: 'Checks expiry, usage limits, stacking rules, and hyperlocal restrictions.'
  })
  @ApiResponse({ status: 200, type: Coupon })
  validate(
    @Body('code') code: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.validateCoupon(code, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('save')
  @ApiOperation({
    summary: 'Save a Coupon',
    description: 'Allows a customer to save a discovered coupon to their digital wallet/saved offers list.'
  })
  saveCoupon(
    @Body('code') code: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.saveCoupon(code, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('remove-saved')
  @ApiOperation({
    summary: 'Remove a Saved Coupon',
    description: 'Allows a customer to remove a coupon from their saved list.'
  })
  removeSavedCoupon(
    @Body('code') code: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.removeSavedCoupon(code, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('saved')
  @ApiOperation({
    summary: 'Get Saved Coupons',
    description: 'List all coupons saved by the customer.'
  })
  getSavedCoupons(@Req() req: AuthenticatedRequest) {
    return this.couponService.getSavedCoupons(req.user);
  }

  @Public()
  @Get('detail/:code')
  @ApiOperation({ summary: 'Get details of a specific Coupon by code', description: 'Public endpoint.' })
  @ApiResponse({ status: 200, type: Coupon })
  findOne(@Param('code') code: string) {
    return this.couponService.findCouponByCode(code);
  }

  @Public()
  @Get('products/detail/:id')
  @ApiOperation({ summary: 'Get details of a specific Coupon product (template)', description: 'Public endpoint.' })
  @ApiResponse({ status: 200, type: Coupon })
  getProductDetail(@Param('id') id: string) {
    return this.couponService.findProductById(id);
  }
}
