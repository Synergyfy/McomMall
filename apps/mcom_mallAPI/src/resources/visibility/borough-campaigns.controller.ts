import { Controller, Get } from '@nestjs/common';
import { BoroughCampaignsService } from './borough-campaigns.service';

@Controller('borough-campaigns')
export class BoroughCampaignsController {
  constructor(private readonly campaignsService: BoroughCampaignsService) {}

  @Get()
  findAll() {
    return this.campaignsService.findAll();
  }
}
