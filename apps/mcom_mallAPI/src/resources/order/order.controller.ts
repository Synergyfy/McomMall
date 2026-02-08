import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import { UserRole } from '../../common/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checkout(@Body() createCheckoutDto: CreateCheckoutDto, @Req() req) {
    const userId = req.user.id;
    return this.orderService.checkout(userId, createCheckoutDto);
  }

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const userId = req.user.id;
    return this.orderService.createOrder(createOrderDto, userId);
  }

  @Get()
  getOrders(@Req() req) {
    const user = req.user;
    if (user.role === UserRole.OWNER) {
      return this.orderService.getOrdersForOwner(user.id);
    }
    return this.orderService.getOrdersForCustomer(user.id);
  }

  @Get('stats')
  @Roles(UserRole.OWNER)
  getSalesStats(@Req() req) {
    const userId = req.user.id;
    return this.orderService.getSalesStatsForOwner(userId);
  }
}
