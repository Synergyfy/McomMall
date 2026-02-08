import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { ApplicableOffersDto } from './dto/applicable-offers.dto';
import { Request } from 'express';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('initiate')
  initiateCheckout(
    @Req() req: Request,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    const userId = req.user.id;
    return this.checkoutService.initiateCheckout(userId, createCheckoutDto);
  }

  @Post('complete')
  completeCheckout(
    @Req() req: Request,
    @Body() completeCheckoutDto: CompleteCheckoutDto,
  ) {
    const userId = req.user.id;
    return this.checkoutService.completeCheckout(userId, completeCheckoutDto);
  }

  @Post('applicable-offers')
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
