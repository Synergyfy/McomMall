import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RotatorsService } from './rotators.service';
import { CreateRotatorDto } from './dto/create-rotator.dto';
import { UpdateRotatorDto } from './dto/update-rotator.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Rotators')
@ApiBearerAuth()
@Controller('rotators')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RotatorsController {
  constructor(private readonly rotatorsService: RotatorsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new rotator campaign' })
  async create(
    @CurrentUser() user: User,
    @Body() createRotatorDto: CreateRotatorDto,
  ) {
    return this.rotatorsService.create(user.id, createRotatorDto);
  }

  @Get('my-rotators')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Get all rotator campaigns for the current business merchant',
  })
  async findAllMyRotators(@CurrentUser() user: User) {
    return this.rotatorsService.findAllForBusiness(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rotator campaign by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rotatorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update an existing rotator campaign' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRotatorDto: UpdateRotatorDto,
  ) {
    return this.rotatorsService.update(id, updateRotatorDto);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Duplicate an existing rotator campaign' })
  async duplicate(@Param('id', ParseUUIDPipe) id: string) {
    return this.rotatorsService.duplicate(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete a rotator campaign' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rotatorsService.remove(id);
  }
}
