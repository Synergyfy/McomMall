import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
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
import { BoroughsService } from './boroughs.service';
import { Borough } from './entities/borough.entity';
import { CreateBoroughDto } from './dto/create-borough.dto';
import { UpdateBoroughDto } from './dto/update-borough.dto';

@ApiTags('Boroughs')
@ApiBearerAuth()
@Controller('boroughs')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class BoroughsController {
  constructor(private readonly boroughsService: BoroughsService) {}

  @Post()
  @ApiOperation({ summary: 'Onboard a new borough (Admin only)' })
  @ApiCreatedResponse({ description: 'Borough created', type: Borough })
  @ApiConflictResponse({ description: 'Borough name already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateBoroughDto): Promise<Borough> {
    return this.boroughsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all boroughs (Admin only)' })
  @ApiOkResponse({ description: 'Borough list', type: [Borough] })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  findAll(): Promise<Borough[]> {
    return this.boroughsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get borough counts (Admin only)' })
  @ApiOkResponse({ description: 'Borough statistics' })
  getStats(): Promise<{ total: number; active: number; inactive: number }> {
    return this.boroughsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a borough with its campaigns (Admin only)' })
  @ApiOkResponse({ description: 'Borough detail', type: Borough })
  @ApiNotFoundResponse({ description: 'Borough with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Borough> {
    return this.boroughsService.findOne(id);
  }

  @Get(':id/campaigns')
  @ApiOperation({ summary: 'List campaigns linked to a borough (Admin only)' })
  @ApiOkResponse({ description: 'Borough campaigns' })
  @ApiNotFoundResponse({ description: 'Borough with specified ID was not found' })
  getCampaigns(@Param('id', ParseUUIDPipe) id: string) {
    return this.boroughsService.getCampaigns(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a borough (Admin only)' })
  @ApiOkResponse({ description: 'Borough updated', type: Borough })
  @ApiNotFoundResponse({ description: 'Borough with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoroughDto,
  ): Promise<Borough> {
    return this.boroughsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a borough (Admin only)' })
  @ApiOkResponse({ description: 'Borough removed' })
  @ApiNotFoundResponse({ description: 'Borough with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.boroughsService.remove(id);
  }
}
