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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Tier } from './entities/tier.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Tier')
@ApiBearerAuth()
@Controller('tiers')
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new tier (Admin only)',
    description: 'Creates a new subscription tier with specific configuration for quotas (listings, products, etc.) and feature flags. Only Admins can perform this action.'
  })
  @ApiResponse({ status: 201, description: 'The tier has been successfully created.', type: Tier })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({ status: 409, description: 'Conflict. Tier with this name already exists.' })
  create(@Body() createTierDto: CreateTierDto) {
    return this.tierService.create(createTierDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all tiers',
    description: 'Retrieves a list of all available subscription tiers.'
  })
  @ApiResponse({ status: 200, description: 'Return all tiers.', type: [Tier] })
  findAll() {
    return this.tierService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get a tier by ID',
    description: 'Retrieves details of a specific tier by its unique ID.'
  })
  @ApiResponse({ status: 200, description: 'Return the tier details.', type: Tier })
  @ApiResponse({ status: 404, description: 'Tier not found.' })
  findOne(@Param('id') id: string) {
    return this.tierService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a tier (Admin only)',
    description: 'Updates an existing tier configuration. Only Admins can perform this action.'
  })
  @ApiResponse({ status: 200, description: 'The tier has been successfully updated.', type: Tier })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({ status: 404, description: 'Tier not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Tier with this name already exists.' })
  update(@Param('id') id: string, @Body() updateTierDto: UpdateTierDto) {
    return this.tierService.update(id, updateTierDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a tier (Admin only)',
    description: 'Deletes a tier. Only Admins can perform this action.'
  })
  @ApiResponse({ status: 200, description: 'The tier has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({ status: 404, description: 'Tier not found.' })
  remove(@Param('id') id: string) {
    return this.tierService.remove(id);
  }
}
