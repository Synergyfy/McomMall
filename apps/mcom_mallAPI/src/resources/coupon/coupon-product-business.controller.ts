import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CouponStatsDto } from './dto/coupon-stats.dto';
import { CouponChartDataDto } from './dto/coupon-chart-data.dto';
import { CouponTransactionHistoryDto } from './dto/coupon-transaction-history.dto';
import { CouponProductService } from './coupon-product.service';
import { CreateCouponProductDto } from './dto/create-coupon-product.dto';
import { UpdateCouponProductDto } from './dto/update-coupon-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { AuthenticatedRequest } from '../../common/types';

@ApiTags('CouponProductBusiness')
@ApiBearerAuth()
@Controller('business/coupon-products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class CouponProductBusinessController {
  constructor(
    private readonly couponProductService: CouponProductService,
    private readonly couponService: CouponService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new coupon product' })
  create(
    @Body() createCouponProductDto: CreateCouponProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponProductService.create(createCouponProductDto, req.user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats for coupons' })
  @ApiOkResponse({
    description: "Dashboard statistics for the merchant's coupons",
    type: CouponStatsDto,
  })
  getStats(@Req() req: AuthenticatedRequest) {
    return this.couponService.getOwnerStats(req.user.id);
  }

  @Get('chart-data')
  @ApiOperation({ summary: 'Get monthly sales vs redemptions data for charts' })
  @ApiOkResponse({
    description: 'Monthly chart data showing sales and redemptions',
    type: CouponChartDataDto,
  })
  getChartData(@Req() req: AuthenticatedRequest) {
    return this.couponService.getSalesVsRedemptionsChartData(req.user.id);
  }

  @Get('sales-and-redemptions')
  @ApiOperation({
    summary: 'Get a detailed transaction history for a given time range',
  })
  @ApiOkResponse({
    description: 'List of coupon transactions (sales and redemptions)',
    type: [CouponTransactionHistoryDto],
  })
  getTransactions(
    @Req() req: AuthenticatedRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.couponService.getTransactionHistoryForOwner(
      req.user.id,
      startDate,
      endDate,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all coupon products' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.couponProductService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific coupon product' })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.couponProductService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon product' })
  update(
    @Param('id') id: string,
    @Body() updateCouponProductDto: UpdateCouponProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponProductService.update(
      id,
      updateCouponProductDto,
      req.user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon product' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.couponProductService.remove(id, req.user);
  }
}
