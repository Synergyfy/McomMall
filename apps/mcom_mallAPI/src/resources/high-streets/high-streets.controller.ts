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
import { HighStreetsService } from './high-streets.service';
import { HighStreet } from './entities/high-street.entity';
import { CreateHighStreetDto } from './dto/create-high-street.dto';
import { UpdateHighStreetDto } from './dto/update-high-street.dto';

@ApiTags('HighStreets')
@ApiBearerAuth()
@Controller('high-streets')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class HighStreetsController {
  constructor(private readonly highStreetsService: HighStreetsService) {}

  @Post()
  @ApiOperation({ summary: 'Activate a new high street (Admin only)' })
  @ApiCreatedResponse({ description: 'High street created', type: HighStreet })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateHighStreetDto): Promise<HighStreet> {
    return this.highStreetsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List high streets with optional filters (Admin only)' })
  @ApiOkResponse({ description: 'High street list', type: [HighStreet] })
  findAll(
    @Query('status') status?: string,
    @Query('boroughId') boroughId?: string,
  ): Promise<HighStreet[]> {
    return this.highStreetsService.findAll(status, boroughId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get high street counts (Admin only)' })
  @ApiOkResponse({ description: 'High street statistics' })
  getStats(): Promise<{ total: number; active: number; pending: number }> {
    return this.highStreetsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a high street (Admin only)' })
  @ApiOkResponse({ description: 'High street detail', type: HighStreet })
  @ApiNotFoundResponse({ description: 'High street with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<HighStreet> {
    return this.highStreetsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a high street (Admin only)' })
  @ApiOkResponse({ description: 'High street updated', type: HighStreet })
  @ApiNotFoundResponse({ description: 'High street with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHighStreetDto,
  ): Promise<HighStreet> {
    return this.highStreetsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a high street (Admin only)' })
  @ApiOkResponse({ description: 'High street removed' })
  @ApiNotFoundResponse({ description: 'High street with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.highStreetsService.remove(id);
  }
}
