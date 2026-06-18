import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BoroughCampaignsService } from './borough-campaigns.service';
import { ParticipateCampaignDto } from './dto/participate-campaign.dto';

@Controller('borough-campaigns')
export class BoroughCampaignsController {
  constructor(private readonly campaignsService: BoroughCampaignsService) {}

  @Get()
  findAll() {
    return this.campaignsService.findAll();
  }

  @Post(':id/participate')
  participate(
    @Param('id') id: string,
    @Body() participateDto: ParticipateCampaignDto,
  ) {
    return this.campaignsService.participate(id, participateDto.businessId);
  }
}
