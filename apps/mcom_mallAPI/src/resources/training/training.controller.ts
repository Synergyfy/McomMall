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
import { TrainingService } from './training.service';
import { TrainingKind, TrainingModule } from './entities/training-module.entity';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';

@ApiTags('Training')
@ApiBearerAuth()
@Controller('training')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a training module (Admin only)' })
  @ApiCreatedResponse({ description: 'Module created', type: TrainingModule })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateTrainingModuleDto): Promise<TrainingModule> {
    return this.trainingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List training modules with optional filters (Admin only)' })
  @ApiOkResponse({ description: 'Module list', type: [TrainingModule] })
  findAll(
    @Query('kind') kind?: TrainingKind,
    @Query('search') search?: string,
  ): Promise<TrainingModule[]> {
    return this.trainingService.findAll(kind, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training module (Admin only)' })
  @ApiOkResponse({ description: 'Module detail', type: TrainingModule })
  @ApiNotFoundResponse({ description: 'Training module with specified ID was not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TrainingModule> {
    return this.trainingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a training module (Admin only)' })
  @ApiOkResponse({ description: 'Module updated', type: TrainingModule })
  @ApiNotFoundResponse({ description: 'Training module with specified ID was not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrainingModuleDto,
  ): Promise<TrainingModule> {
    return this.trainingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training module (Admin only)' })
  @ApiOkResponse({ description: 'Module removed' })
  @ApiNotFoundResponse({ description: 'Training module with specified ID was not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.trainingService.remove(id);
  }
}
