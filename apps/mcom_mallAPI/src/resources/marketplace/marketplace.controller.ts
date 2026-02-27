import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  CreateCategoryDto,
  UpdateCategoryDto,
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

@ApiTags('Marketplace Page CMS')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ===========================================================================
  // PUBLIC ENDPOINTS
  // ===========================================================================

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Get Marketplace Page Data',
    description:
      'Returns the fully aggregated configuration for the Marketplace page, including sidebar categories, active hero slides, flash sale settings, and promotional sections. Open to everyone.',
  })
  @ApiResponse({
    status: 200,
    type: MarketplacePublicViewDto,
    description: 'Aggregated view returned.',
  })
  async getPublicView() {
    return this.marketplaceService.getPublicView();
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
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, type: MarketplaceCategory })
  async createCategory(@Body() dto: CreateCategoryDto) {
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
    @Body() dto: UpdateCategoryDto,
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
