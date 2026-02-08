import {
  Controller,
  Patch,
  ParseUUIDPipe,
  Param,
  Get,
  Post,
  Body,
  Request,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListingsService } from './listing.service';
import {
  CreateBusinessDto,
  SearchBusinessDto,
  UpdateBusinessDto,
} from './dto/listings.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ServicesService } from '../services/services.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CheckPermission } from '../capability/decorators/check-permission.decorator';
import { ActionType } from '../capability/capability.service';
import { CapabilitiesGuard } from '../capability/guards/capabilities.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('listings')
@UseGuards(JwtAuthGuard, CapabilitiesGuard) // Ensure Guards are applied
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly servicesService: ServicesService,
  ) { }

  @Public()
  @Get('search')
  search(@Query() searchQuery: SearchBusinessDto) {
    return this.listingsService.search(searchQuery);
  }

  @Public()
  @Get('recent')
  recent(@Query('limit') limit?: number) {
    return this.listingsService.findRecent(limit ? Number(limit) : 6);
  }

  @Get('mine')
  findAllForUser(@Request() req, @Query() pagination: PaginationDto) {
    const userId = req.user.id;
    return this.listingsService.findAllForUser(
      userId,
      pagination.page,
      pagination.limit,
    );
  }

  @Post()
  @CheckPermission(ActionType.CREATE_LISTING)
  create(@Body() createBusinessDto: CreateBusinessDto, @Request() req) {
    const userId = req.user.id;
    return this.listingsService.create(createBusinessDto, userId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.listingsService.findOnePublic(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.listingsService.update(id, updateBusinessDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.id;
    return this.listingsService.remove(id, userId);
  }

  @Public()
  @Get(':businessId/services')
  findAllServicesForBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.findAllForBusiness(businessId, paginationDto);
  }
}
