import { Controller, Get, Query } from '@nestjs/common';
import { HighStreetService } from './high-street.service';

@Controller('high-street')
export class HighStreetController {
  constructor(private readonly highStreetService: HighStreetService) {}

  @Get('readiness')
  getNeighborhoodVitality(@Query('borough') borough: string) {
    return this.highStreetService.getNeighborhoodVitality(borough);
  }
}
