import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { ApplicableOffersDto } from './dto/applicable-offers.dto';
import { Request } from 'express';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Checkout')
@ApiBearerAuth()
@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate checkout session', description: 'Calculates subtotal, applies coupons/gift cards, and returns payment intent if required.' })
  initiateCheckout(
    @Req() req: Request,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    const userId = req.user.id;
    return this.checkoutService.initiateCheckout(userId, createCheckoutDto);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete checkout session', description: 'Verifies payment and finalizes the order, redeeming all applied coupons/vouchers.' })
  completeCheckout(
    @Req() req: Request,
    @Body() completeCheckoutDto: CompleteCheckoutDto,
  ) {
    const userId = req.user.id;
    return this.checkoutService.completeCheckout(userId, completeCheckoutDto);
  }

  @Post('applicable-offers')
  @ApiOperation({ summary: 'Get applicable offers for items', description: 'Checks for active loyalty offers based on user points and cart items.' })
  getApplicableOffers(
    @Req() req: Request,
    @Body() applicableOffersDto: ApplicableOffersDto,
  ) {
    const userId = req.user.id;
    return this.checkoutService.getApplicableOffers(
      userId,
      applicableOffersDto,
    );
  }
}
