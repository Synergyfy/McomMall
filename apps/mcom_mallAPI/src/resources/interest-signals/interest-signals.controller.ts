import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InterestSignalsService } from './interest-signals.service';
import { CreateInterestSignalDto } from './dto/create-interest-signal.dto';

@Controller('interest-signals')
export class InterestSignalsController {
  constructor(
    private readonly interestSignalsService: InterestSignalsService,
  ) {}

  @Post(':businessId')
  submitSignal(
    @Param('businessId') businessId: string,
    @Body() createDto: CreateInterestSignalDto,
  ) {
    return this.interestSignalsService.submitSignal(businessId, createDto);
  }

  @Get(':businessId')
  getMetrics(@Param('businessId') businessId: string) {
    return this.interestSignalsService.getMetrics(businessId);
  }
}
