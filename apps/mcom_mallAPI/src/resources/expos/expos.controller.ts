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
import { ExposService } from './expos.service';
import { Expo, ExpoStatus } from './entities/expo.entity';
import { CreateExpoDto } from './dto/create-expo.dto';
import { UpdateExpoDto } from './dto/update-expo.dto';

@ApiTags('Expos')
@ApiBearerAuth()
@Controller('expos')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class ExposController {
  constructor(private readonly exposService: ExposService) {}

  @Post()
  @ApiOperation({ summary: 'Create an expo (Admin only)' })
  @ApiCreatedResponse({ description: 'Expo created', type: Expo })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateExpoDto): Promise<Expo> {
    return this.exposService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List expos with optional filters (Admin only)' })
  @ApiOkResponse({ description: 'Expo list', type: [Expo] })
  findAll(
    @Query('status') status?: ExpoStatus,
    @Query('boroughId') boroughId?: string,
  ): Promise<Expo[]> {
    return this.exposService.findAll(status, boroughId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get expo counts by status (Admin only)' })
  @ApiOkResponse({ description: 'Expo statistics' })
  getStats() {
    return this.exposService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expo (Admin only)' })
  @ApiOkResponse({ description: 'Expo detail', type: Expo })
  @ApiNotFoundResponse({ description: 'Expo with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Expo> {
    return this.exposService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expo (Admin only)' })
  @ApiOkResponse({ description: 'Expo updated', type: Expo })
  @ApiNotFoundResponse({ description: 'Expo with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpoDto,
  ): Promise<Expo> {
    return this.exposService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expo (Admin only)' })
  @ApiOkResponse({ description: 'Expo removed' })
  @ApiNotFoundResponse({ description: 'Expo with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.exposService.remove(id);
  }
}
