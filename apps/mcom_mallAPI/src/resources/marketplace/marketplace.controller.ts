import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import {
  CreateBannerDto,
  UpdateBannerDto,
  CreateMarketplaceCategoryDto,
  UpdateMarketplaceCategoryDto,
  UpdateSectionDto,
  MarketplacePublicViewDto,
} from './dto/dtos';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  MarketplaceBanner,
  BannerType,
} from './entities/marketplace-banner.entity';
import { MarketplaceCategory } from './entities/marketplace-category.entity';
import {
  MarketplaceSection,
  SectionType,
} from './entities/marketplace-section.entity';
import { Public } from 'src/common/decorators/public.decorator';
import { MarketplaceLocationService } from '../geography/marketplace-location.service';
import { BusinessGeographyService } from '../geography/business-geography.service';
import { LocationFilterDto, ResolveLocationQueryDto } from '../geography/dto/location-filter.dto';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Marketplace Page CMS')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly locationService: MarketplaceLocationService,
    private readonly businessGeography: BusinessGeographyService,
  ) {}

  // ===========================================================================
  // PUBLIC ENDPOINTS
  // ===========================================================================

  @Public()
  @Get('public')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Get Marketplace Page Data',
    description:
      'Returns the fully aggregated configuration for the Marketplace page, including sidebar categories, active hero slides, flash sale settings, and promotional sections. Open to everyone. Optional location params filter the featured listings by seller location.',
  })
  @ApiResponse({
    status: 200,
    type: MarketplacePublicViewDto,
    description: 'Aggregated view returned.',
  })
  async getPublicView(@Query() location: LocationFilterDto) {
    return this.marketplaceService.getPublicView(location);
  }

  @Public()
  @Get('businesses')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Search public businesses',
    description:
      'Paginated business directory for the marketplace Businesses tab. Matches business names and descriptions and accepts the same location filters as the other public listing endpoints.',
  })
  async getPublicBusinesses(
    @Query() location: LocationFilterDto,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.marketplaceService.findPublicBusinesses({
      location,
      page: location.page,
      limit: location.limit,
      search,
      category,
    });
  }

  @Public()
  @Get('locations')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @ApiOperation({
    summary: 'List marketplace location facets',
    description:
      'Returns the City → Borough → High Street → Local Mall tree with a live business count for every node. Cached in-process and safe to call on every marketplace visit.',
  })
  async getLocations() {
    return this.locationService.getFacets();
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('location/resolve')
  @ApiOperation({
    summary: 'Resolve the shopper\'s marketplace location',
    description:
      'Prefers the Central hierarchy assigned to the signed-in user, then a supplied postcode, then browser coordinates. Coordinates outside the UK resolve to the closest city that has businesses.',
  })
  async resolveLocation(
    @Query() query: ResolveLocationQueryDto,
    @CurrentUser() user?: User,
  ) {
    return this.locationService.resolve({
      user: user ?? null,
      postcode: query.postcode ?? null,
      lat: query.lat ?? null,
      lng: query.lng ?? null,
    });
  }

  @Public()
  @Get('location/search')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Search marketplace locations by postcode or place name',
    description:
      'Accepts a UK postcode, outward code or place name. Postcodes always return an outward-code result backed by local business postcodes, even before the Central hierarchy backfill has run.',
  })
  async searchLocation(@Query('q') q?: string) {
    return this.locationService.search(q || '');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('locations/backfill')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Backfill business geographic hierarchy (Admin)',
    description:
      'Resolves Central hierarchy for a batch of UK outcodes and writes it to every business in that outcode. Intended for the initial migration; the scheduled worker does the same automatically.',
  })
  async backfillLocations(@Query('batch') batch?: string) {
    const parsed = Number(batch);
    return this.businessGeography.backfill(
      Number.isFinite(parsed) && parsed > 0 ? parsed : 20,
    );
  }

  // ===========================================================================
  // ADMIN ENDPOINTS - BANNERS
  // ===========================================================================

  @Post('banners')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a Banner (Hero/Sidebar)',
    description:
      'Upload a new slide for the Treasure Hunt carousel or the Right Sidebar. Admin Only.',
  })
  @ApiBody({ type: CreateBannerDto })
  @ApiResponse({ status: 201, type: MarketplaceBanner })
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.marketplaceService.createBanner(dto);
  }

  @Get('banners')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List All Banners (Admin)' })
  @ApiResponse({ status: 200, type: [MarketplaceBanner] })
  async findAllBanners() {
    return this.marketplaceService.findAllBanners();
  }

  @Patch('banners/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update Banner',
    description: 'Change image, order, or active status.',
  })
  @ApiResponse({ status: 200, type: MarketplaceBanner })
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.marketplaceService.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete Banner' })
  async deleteBanner(@Param('id') id: string) {
    return this.marketplaceService.deleteBanner(id);
  }

  // ===========================================================================
  // ADMIN ENDPOINTS - CATEGORIES
  // ===========================================================================

  @Post('categories')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create Sidebar Category',
    description:
      'Add a custom category to the left sidebar. Can link to a real Taxonomy ID.',
  })
  @ApiBody({ type: CreateMarketplaceCategoryDto })
  @ApiResponse({ status: 201, type: MarketplaceCategory })
  async createCategory(@Body() dto: CreateMarketplaceCategoryDto) {
    return this.marketplaceService.createCategory(dto);
  }

  @Get('categories')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List All Sidebar Categories (Admin)' })
  async findAllCategories() {
    return this.marketplaceService.findAllCategories();
  }

  @Patch('categories/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update Category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateMarketplaceCategoryDto,
  ) {
    return this.marketplaceService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete Category' })
  async deleteCategory(@Param('id') id: string) {
    return this.marketplaceService.deleteCategory(id);
  }

  // ===========================================================================
  // ADMIN ENDPOINTS - SECTIONS (Flash Sales, Promos)
  // ===========================================================================

  @Patch('sections/:type')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update Section Config',
    description:
      'Configure sections like Flash Sales (timer, items) or Promo Carousel.',
  })
  @ApiParam({ name: 'type', enum: SectionType })
  @ApiBody({ type: UpdateSectionDto })
  @ApiResponse({ status: 200, type: MarketplaceSection })
  async updateSection(
    @Param('type') type: SectionType,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.marketplaceService.updateSection(type, dto);
  }

  @Get('sections')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List All Section Configs' })
  @ApiResponse({ status: 200, type: [MarketplaceSection] })
  async getAllSections() {
    return this.marketplaceService.getAllSections();
  }
}
