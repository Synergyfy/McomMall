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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add')
  addItemToCart(@Req() req, @Body() addItemToCartDto: AddItemToCartDto) {
    return this.cartService.addItemToCart(req.user.id, addItemToCartDto);
  }

  @Patch('update')
  updateItemQuantity(@Req() req, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateItemQuantity(req.user.id, updateCartItemDto);
  }

  @Delete('remove/:productId')
  removeItemFromCart(@Req() req, @Param('productId') productId: string) {
    return this.cartService.removeItemFromCart(req.user.id, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
