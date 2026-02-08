import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    const wishlist = await this.wishlistService.create(
      createWishlistDto,
      userId,
    );
    return wishlist;
  }

  @Get()
  async findAll(@Req() req: Request) {
    const userId = req.user.id;
    const wishlists = await this.wishlistService.findAll(userId);
    return wishlists;
  }

  @Delete(':productId')
  async remove(@Param('productId') productId: string, @Req() req: Request) {
    const userId = req.user.id;
    return await this.wishlistService.remove(productId, userId);
  }
}
