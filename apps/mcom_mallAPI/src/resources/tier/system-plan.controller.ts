import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TierService } from './tier.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { McomSolutionAuthGuard } from '../../common/guards/mcom-solution-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Tier } from './entities/tier.entity';

@ApiTags('MCOM Solution - Plans')
@Public()
@Controller('system/plans')
@UseGuards(McomSolutionAuthGuard)
export class SystemPlanController {
  constructor(private readonly tierService: TierService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a plan (MCOM Solution Admin)',
    description: 'Creates a new subscription plan. Only authorized MCOM Solution requests can perform this action.',
  })
  @ApiResponse({ status: 201, description: 'Plan created successfully.', type: Tier })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing API key.' })
  @ApiResponse({ status: 409, description: 'Conflict. Plan with this name already exists.' })
  create(@Body() createTierDto: CreateTierDto) {
    return this.tierService.create(createTierDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all plans',
    description: 'Retrieves a list of all available subscription plans.',
  })
  @ApiResponse({ status: 200, description: 'Return all plans.', type: [Tier] })
  findAll() {
    return this.tierService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a plan by ID',
    description: 'Retrieves details of a specific plan by its unique ID.',
  })
  @ApiResponse({ status: 200, description: 'Return the plan details.', type: Tier })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  findOne(@Param('id') id: string) {
    return this.tierService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a plan (MCOM Solution Admin)',
    description: 'Updates an existing plan. Only authorized MCOM Solution requests can perform this action.',
  })
  @ApiResponse({ status: 200, description: 'Plan updated successfully.', type: Tier })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing API key.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Plan with this name already exists.' })
  update(@Param('id') id: string, @Body() updateTierDto: UpdateTierDto) {
    return this.tierService.update(id, updateTierDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a plan (MCOM Solution Admin)',
    description: 'Deletes a plan. Only authorized MCOM Solution requests can perform this action.',
  })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing API key.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  remove(@Param('id') id: string) {
    return this.tierService.remove(id);
  }
}
