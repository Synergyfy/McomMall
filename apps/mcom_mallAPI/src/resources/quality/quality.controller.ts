import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { QualityService } from './quality.service';
import { MissionStatus, QualityMission } from './entities/quality-mission.entity';
import { CreateQualityMissionDto } from './dto/create-quality-mission.dto';
import { UpdateQualityMissionDto } from './dto/update-quality-mission.dto';

@ApiTags('Quality')
@ApiBearerAuth()
@Controller('quality/missions')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Post()
  @ApiOperation({ summary: 'Assign a mystery shopper mission (Admin only)' })
  @ApiCreatedResponse({ description: 'Mission created', type: QualityMission })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiNotFoundResponse({ description: 'Business with specified ID was not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateQualityMissionDto): Promise<QualityMission> {
    return this.qualityService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List mystery shopper missions (Admin only)' })
  @ApiOkResponse({ description: 'Mission list', type: [QualityMission] })
  findAll(@Query('status') status?: MissionStatus): Promise<QualityMission[]> {
    return this.qualityService.findAll(status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get mission counts and average score (Admin only)' })
  @ApiOkResponse({ description: 'Mission statistics' })
  getStats() {
    return this.qualityService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mission (Admin only)' })
  @ApiOkResponse({ description: 'Mission detail', type: QualityMission })
  @ApiNotFoundResponse({ description: 'Quality mission with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<QualityMission> {
    return this.qualityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a mission (status, score, notes) (Admin only)' })
  @ApiOkResponse({ description: 'Mission updated', type: QualityMission })
  @ApiNotFoundResponse({ description: 'Quality mission or business was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQualityMissionDto,
  ): Promise<QualityMission> {
    return this.qualityService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mission (Admin only)' })
  @ApiOkResponse({ description: 'Mission removed' })
  @ApiNotFoundResponse({ description: 'Quality mission with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.qualityService.remove(id);
  }
}
