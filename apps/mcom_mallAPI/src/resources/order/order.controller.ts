import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Body,
  Query,
  Patch,
  Param,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../common/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { OrderService } from './order.service';
import { WalletRefundReconcileService } from './wallet-refund-reconcile.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Order } from './entities/order.entity';
import { PageDto } from '../../common/dto/page.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly walletRefundReconcileService: WalletRefundReconcileService,
  ) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Checkout process',
    description:
      'Processes cart or direct purchase. Calculates shipping fees for Royal Mail if applicable. Roles: CUSTOMER, OWNER.',
  })
  @ApiResponse({
    status: 201,
    type: Order,
    description: 'The created order object with shipping details.',
  })
  checkout(@Body() createCheckoutDto: CreateCheckoutDto, @Req() req) {
    const userId = req.user.id;
    return this.orderService.checkout(userId, createCheckoutDto);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a direct order',
    description:
      'Directly creates an order for products. Roles: CUSTOMER, OWNER.',
  })
  @ApiResponse({ status: 201, type: Order })
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const userId = req.user.id;
    return this.orderService.createOrder(createOrderDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get order history (Paginated)',
    description:
      'Returns orders based on role. If ADMIN, returns all platform orders. If OWNER, returns orders for their products. If CUSTOMER, returns their own purchase history.',
  })
  @ApiResponse({
    status: 200,
    type: PageDto,
    description:
      'Paginated list of orders including tracking and shipping info.',
  })
  getOrders(@Req() req, @Query() pagination: PaginationQueryDto) {
    const user = req.user;
    if (user.role === UserRole.ADMIN) {
      return this.orderService.getOrdersForAdmin(pagination);
    }
    if (user.role === UserRole.OWNER) {
      return this.orderService.getOrdersForOwner(user.id, pagination);
    }
    return this.orderService.getOrdersForCustomer(user.id, pagination);
  }

  @Get('stats')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Get owner sales statistics',
    description: 'Roles: OWNER only.',
  })
  getSalesStats(@Req() req) {
    const userId = req.user.id;
    return this.orderService.getSalesStatsForOwner(userId);
  }

  @Patch(':id/tracking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update Royal Mail tracking number / carrier for an order',
    description: 'Roles: OWNER (own orders), ADMIN.',
  })
  updateTracking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderTrackingDto,
    @Req() req,
  ) {
    return this.orderService.updateOrderTracking(id, dto, {
      id: req.user.id,
      role: req.user.role,
    });
  }

  @Post('reconcile-wallet-refunds')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Trigger reconciliation of pending failed wallet refunds',
    description:
      'Processes pending failed refund records and credits user central wallets. Role: ADMIN.',
  })
  async reconcileRefunds() {
    await this.walletRefundReconcileService.reconcilePending();
    return { success: true, message: 'Reconciliation process completed.' };
  }

  @Get('reconcile-wallet-refunds/process')
  @Public()
  @ApiOperation({
    summary: 'Process pending failed wallet refunds via scheduled cron trigger',
  })
  async processScheduledRefundReconcile(@Query('secret') secret: string) {
    const CRON_SECRET = process.env.CRON_SECRET;
    if (!CRON_SECRET) {
      throw new UnauthorizedException('CRON_SECRET is not configured');
    }
    if (secret !== CRON_SECRET) {
      throw new UnauthorizedException('Invalid secret');
    }
    await this.walletRefundReconcileService.reconcilePending();
    return { success: true, message: 'Reconciliation process completed.' };
  }
}
