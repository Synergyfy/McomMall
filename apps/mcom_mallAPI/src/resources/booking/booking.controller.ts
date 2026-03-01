import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Put,
  Param,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BlockSlotDto } from './dto/block-slot.dto';
import { PriceModifierDto } from './dto/price-modifier.dto';
import { InitiateBookingPaymentDto } from './dto/initiate-booking-payment.dto';
import { VerifyBookingPaymentDto } from './dto/verify-booking-payment.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('check-availability')
  checkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    return this.bookingService.checkAvailability(checkAvailabilityDto);
  }

  @Get('available-slots')
  getAvailableTimeSlots(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.getAvailableTimeSlots(serviceId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingService.create(createBookingDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('business')
  findAllForBusiness(@Request() req, @Query('days') days: number) {
    return this.bookingService.findAllForBusiness(req.user.id, days);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customer')
  findAllForCustomer(@Request() req, @Query('days') days: number) {
    return this.bookingService.findAllForCustomer(req.user.id, days);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.bookingService.approve(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/decline')
  decline(@Param('id') id: string, @Request() req) {
    return this.bookingService.decline(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.bookingService.cancel(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('block-slot')
  blockSlot(@Body() blockSlotDto: BlockSlotDto, @Request() req) {
    return this.bookingService.blockSlot(blockSlotDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('price-modifier')
  setPriceModifier(@Body() priceModifierDto: PriceModifierDto, @Request() req) {
    return this.bookingService.setPriceModifier(priceModifierDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('initiate-payment')
  initiatePayment(
    @Body() initiateBookingPaymentDto: InitiateBookingPaymentDto,
    @Request() req,
  ) {
    return this.bookingService.initiatePayment(
      initiateBookingPaymentDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-payment')
  verifyPayment(
    @Body() verifyBookingPaymentDto: VerifyBookingPaymentDto,
    @Request() req,
  ) {
    return this.bookingService.verifyPayment(
      verifyBookingPaymentDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/complete')
  complete(@Param('id') id: string, @Request() req) {
    return this.bookingService.completeBooking(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard) // Assuming admin only in real app, keeping simple for this scope
  @Post(':id/refund')
  refund(@Param('id') id: string, @Request() req) {
    return this.bookingService.refundBooking(id, req.user.id);
  }
}
