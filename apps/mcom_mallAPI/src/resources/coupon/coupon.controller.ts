import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponStatus } from './coupon.enum';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Coupon } from './entities/coupon.entity';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Create a new Coupon',
    description:
      'Enforces tier-based capabilities for businesses. Admins can create platform coupons. Owners can create business coupons.',
  })
  @ApiResponse({ status: 201, type: Coupon })
  create(
    @Body() createCouponDto: CreateCouponDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.create(createCouponDto, req.user);
  }

  @Get('list')
  @ApiOperation({
    summary: 'List all Coupons (Paginated)',
    description: 'Public endpoint.',
  })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.couponService.findAll(pagination);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('mine')
  @ApiOperation({
    summary: 'List Coupons owned by the current user',
    description:
      'Returns a paginated list of coupons created by the authenticated owner.',
  })
  findMine(
    @Query() pagination: PaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.findAllForUser(req.user, pagination);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('validate')
  @ApiOperation({
    summary: 'Validate a Coupon code',
    description:
      'Checks expiry, usage limits, stacking rules, and hyperlocal restrictions.',
  })
  @ApiResponse({ status: 200, type: Coupon })
  validate(
    @Body() validateDto: ValidateCouponDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.validateCoupon(
      validateDto.code,
      req.user,
      validateDto.existingCouponCode,
      validateDto.subtotal,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('save')
  @ApiOperation({
    summary: 'Save a Coupon',
    description:
      'Allows a customer to save a discovered coupon to their digital wallet/saved offers list.',
  })
  saveCoupon(@Body('code') code: string, @Req() req: AuthenticatedRequest) {
    return this.couponService.saveCoupon(code, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('remove-saved')
  @ApiOperation({
    summary: 'Remove a Saved Coupon',
    description: 'Allows a customer to remove a coupon from their saved list.',
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
    description: 'List all coupons saved by the customer.',
  })
  getSavedCoupons(@Req() req: AuthenticatedRequest) {
    return this.couponService.getSavedCoupons(req.user);
  }

  @Get('my-coupons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List coupon products purchased by the current customer',
  })
  getMyPurchasedCoupons(@Req() req: AuthenticatedRequest) {
    return this.couponService.findPurchasedCouponsForUser(req.user.id);
  }

  @Post('initiate-purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an MCOM Pay charge for a coupon purchase' })
  initiatePurchase(
    @Req() req: AuthenticatedRequest,
    @Body()
    dto: { couponProductId: string; amount: number; paymentMethod: string },
  ) {
    return this.couponService.initiateCouponPurchase(dto, req.user.id);
  }

  @Post('verify-purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment and issue the purchased coupon' })
  verifyPurchase(
    @Req() req: AuthenticatedRequest,
    @Body()
    dto: {
      paymentProvider: string;
      transactionId: string;
      purchaseDetails: { couponProductId: string; amount: number };
    },
  ) {
    return this.couponService.verifyAndCompleteCouponPurchase(dto, req.user.id);
  }

  @Post(':code/initiate-reload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an MCOM Pay charge for a coupon reload' })
  initiateReload(
    @Req() req: AuthenticatedRequest,
    @Param('code') code: string,
    @Body() dto: { amount: number; paymentMethod: string },
  ) {
    return this.couponService.initiateCouponReload(code, dto, req.user.id);
  }

  @Post(':code/verify-reload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment and apply the coupon reload' })
  verifyReload(
    @Req() req: AuthenticatedRequest,
    @Param('code') code: string,
    @Body()
    dto: { amount: number; paymentProvider: string; transactionId: string },
  ) {
    return this.couponService.verifyAndCompleteCouponReload(
      code,
      dto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon owned by the current merchant' })
  findOneForUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.couponService.findOneForUser(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon owned by the current merchant' })
  updateForUser(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.updateForUser(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or pause a coupon' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: CouponStatus,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponService.updateStatusForUser(id, status, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon owned by the current merchant' })
  removeForUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.couponService.removeForUser(id, req.user);
  }

  @Public()
  @Get('detail/:code')
  @ApiOperation({
    summary: 'Get details of a specific Coupon by code',
    description: 'Public endpoint.',
  })
  @ApiResponse({ status: 200, type: Coupon })
  findOne(@Param('code') code: string) {
    return this.couponService.findCouponByCode(code);
  }

}
