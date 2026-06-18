import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { UpdateVisibilitySettingsDto } from './dto/update-visibility-settings.dto';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  @Get(':businessId')
  getSettings(@Param('businessId') businessId: string) {
    return this.visibilityService.getOrCreateSettings(businessId);
  }

  @Patch(':businessId')
  updateSettings(
    @Param('businessId') businessId: string,
    @Body() updateDto: UpdateVisibilitySettingsDto,
  ) {
    return this.visibilityService.updateSettings(businessId, updateDto);
  }
}
