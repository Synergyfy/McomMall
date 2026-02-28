import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { UserRole } from '../../common/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
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
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Checkout process',
    description: 'Processes cart or direct purchase. Roles: CUSTOMER, OWNER.',
  })
  @ApiResponse({ status: 201, type: Order })
  checkout(@Body() createCheckoutDto: CreateCheckoutDto, @Req() req) {
    const userId = req.user.id;
    return this.orderService.checkout(userId, createCheckoutDto);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a direct order',
    description: 'Roles: CUSTOMER, OWNER.',
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
      'Returns orders for the authenticated user. If OWNER, returns orders for their business products.',
  })
  @ApiResponse({ status: 200, type: PageDto<Order> })
  getOrders(@Req() req, @Query() pagination: PaginationQueryDto) {
    const user = req.user;
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
}
