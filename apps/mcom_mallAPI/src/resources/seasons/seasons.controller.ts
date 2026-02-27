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
import { SeasonsService } from './seasons.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Season } from './entities/season.entity';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new season',
    description:
      'Allows an administrator to define a new season with a specific date range. This season can then be linked to subscription tiers to create seasonal memberships.',
  })
  @ApiResponse({
    status: 201,
    description: 'The season has been successfully created.',
    type: Season,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. Validation failed or start date is after end date.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin role is required.',
  })
  create(@Body() createSeasonDto: CreateSeasonDto) {
    return this.seasonsService.create(createSeasonDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all seasons',
    description: 'Retrieves a list of all configured seasons in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all seasons retrieved successfully.',
    type: [Season],
  })
  findAll() {
    return this.seasonsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a season by ID',
    description:
      'Retrieves the details of a specific season using its unique identifier.',
  })
  @ApiResponse({
    status: 200,
    description: 'Season details retrieved successfully.',
    type: Season,
  })
  @ApiResponse({ status: 404, description: 'Season not found.' })
  findOne(@Param('id') id: string) {
    return this.seasonsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a season',
    description:
      'Allows an administrator to update the details of an existing season. If dates are updated, validation ensures the start date remains before the end date.',
  })
  @ApiResponse({
    status: 200,
    description: 'The season has been successfully updated.',
    type: Season,
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Season not found.' })
  update(@Param('id') id: string, @Body() updateSeasonDto: UpdateSeasonDto) {
    return this.seasonsService.update(id, updateSeasonDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a season',
    description:
      'Permanently removes a season from the system. Note: This might affect tiers that are currently linked to this season.',
  })
  @ApiResponse({
    status: 200,
    description: 'The season has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Season not found.' })
  remove(@Param('id') id: string) {
    return this.seasonsService.remove(id);
  }
}
