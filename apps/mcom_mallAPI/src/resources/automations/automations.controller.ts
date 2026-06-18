import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  create(@Body() createDto: CreateAutomationDto) {
    return this.automationsService.create(createDto);
  }

  @Get()
  findAll(@Query('businessId') businessId: string) {
    return this.automationsService.findAllByBusiness(businessId);
  }

  @Get('summary')
  getDashboardSummary(@Query('businessId') businessId: string) {
    return this.automationsService.getDashboardSummary(businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.automationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAutomationDto,
  ) {
    return this.automationsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.automationsService.remove(id);
  }
}
