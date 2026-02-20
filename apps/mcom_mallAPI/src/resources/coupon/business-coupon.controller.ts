import {
    Controller,
    Get,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CouponStatsDto } from './dto/coupon-stats.dto';
import { CouponChartDataDto } from './dto/coupon-chart-data.dto';
import { CouponTransactionHistoryDto } from './dto/coupon-transaction-history.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { AuthenticatedRequest } from '../../common/types';

@ApiTags('Business Coupons Analytics')
@ApiBearerAuth()
@Controller('business/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class BusinessCouponController {
    constructor(
        private readonly couponService: CouponService,
    ) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard stats for coupons' })
    @ApiOkResponse({
        description: 'Dashboard statistics for the merchant\'s coupons',
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
}
