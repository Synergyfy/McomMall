import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
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
  ) {}

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

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @Get('my-redemptions')
  // findUserRedemptions(@Req() req: AuthenticatedRequest) {
  //   return this.couponService.findUserRedemptions(req.user.id);
  // }
}