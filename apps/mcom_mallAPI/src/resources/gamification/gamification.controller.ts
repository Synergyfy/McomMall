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
import { GamificationService } from './gamification.service';
import { CreateGamificationDto } from './dto/create-gamification.dto';
import { UpdateGamificationDto } from './dto/update-gamification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new gamification campaign' })
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateGamificationDto,
  ) {
    return this.gamificationService.create(user.id, createDto);
  }

  @Get('my-games')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get all gamification campaigns for the current business merchant' })
  async findAllMyGames(@CurrentUser() user: User) {
    return this.gamificationService.findAllForBusiness(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a gamification campaign by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gamificationService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update an existing gamification campaign' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateGamificationDto,
  ) {
    return this.gamificationService.update(id, updateDto);
  }

  @Post(':id/play')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Simulate playing a game' })
  async simulatePlay(@Param('id', ParseUUIDPipe) id: string) {
    return this.gamificationService.simulatePlay(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete a gamification campaign' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gamificationService.remove(id);
  }
}
