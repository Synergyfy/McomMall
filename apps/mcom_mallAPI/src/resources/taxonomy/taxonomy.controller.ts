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
} from '@nestjs/swagger';
import { TaxonomyService } from './taxonomy.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Sector } from './entities/sector.entity';
import { TaxonomyCategory } from './entities/taxonomy-category.entity';
import { TaxonomySubcategory } from './entities/taxonomy-subcategory.entity';
import { UserRole } from '../../common/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Taxonomy')
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  // --- Sectors ---

  @Post('sectors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sector (Admin only)' })
  @ApiResponse({ status: 201, description: 'The sector has been successfully created.', type: Sector })
  createSector(@Body() createSectorDto: CreateSectorDto): Promise<Sector> {
    return this.taxonomyService.createSector(createSectorDto);
  }

  @Patch('sectors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a sector (Admin only)' })
  @ApiResponse({ status: 200, description: 'The sector has been successfully updated.', type: Sector })
  @ApiResponse({ status: 404, description: 'Sector not found.' })
  updateSector(
    @Param('id') id: string,
    @Body() updateSectorDto: UpdateSectorDto,
  ): Promise<Sector> {
    return this.taxonomyService.updateSector(id, updateSectorDto);
  }

  @Delete('sectors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a sector (Admin only)' })
  @ApiResponse({ status: 200, description: 'The sector has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Sector not found.' })
  removeSector(@Param('id') id: string): Promise<void> {
    return this.taxonomyService.removeSector(id);
  }

  @Public()
  @Get('sectors')
  @ApiOperation({ summary: 'Get all sectors' })
  @ApiResponse({ status: 200, description: 'Return all sectors.', type: [Sector] })
  findAllSectors(): Promise<Sector[]> {
    return this.taxonomyService.findAllSectors();
  }

  @Public()
  @Get('sectors/:id')
  @ApiOperation({ summary: 'Get a sector by ID' })
  @ApiResponse({ status: 200, description: 'Return the sector.', type: Sector })
  @ApiResponse({ status: 404, description: 'Sector not found.' })
  findOneSector(@Param('id') id: string): Promise<Sector> {
    return this.taxonomyService.findOneSector(id);
  }

  // --- Categories ---

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'The category has been successfully created.', type: TaxonomyCategory })
  createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<TaxonomyCategory> {
    return this.taxonomyService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'The category has been successfully updated.', type: TaxonomyCategory })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<TaxonomyCategory> {
    return this.taxonomyService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'The category has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  removeCategory(@Param('id') id: string): Promise<void> {
    return this.taxonomyService.removeCategory(id);
  }

  @Public()
  @Get('categories/all')
  @ApiOperation({ summary: 'Get all categories without pagination' })
  @ApiResponse({ status: 200, description: 'Return all categories.', type: [TaxonomyCategory] })
  findAllCategoriesAll(): Promise<TaxonomyCategory[]> {
    return this.taxonomyService.findAllCategoriesAll();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Return all categories.', type: [TaxonomyCategory] })
  findAllCategories(): Promise<TaxonomyCategory[]> {
    return this.taxonomyService.findAllCategories();
  }

  @Public()
  @Get('sectors/:sectorId/categories')
  @ApiOperation({ summary: 'Get categories of a specific sector' })
  @ApiResponse({ status: 200, description: 'Return categories of the sector.', type: [TaxonomyCategory] })
  findCategoriesBySector(@Param('sectorId') sectorId: string): Promise<TaxonomyCategory[]> {
    return this.taxonomyService.findCategoriesBySector(sectorId);
  }

  @Public()
  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Return the category.', type: TaxonomyCategory })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOneCategory(@Param('id') id: string): Promise<TaxonomyCategory> {
    return this.taxonomyService.findOneCategory(id);
  }

  // --- Subcategories ---

  @Post('subcategories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subcategory (Admin only)' })
  @ApiResponse({ status: 201, description: 'The subcategory has been successfully created.', type: TaxonomySubcategory })
  createSubcategory(@Body() createSubcategoryDto: CreateSubcategoryDto): Promise<TaxonomySubcategory> {
    return this.taxonomyService.createSubcategory(createSubcategoryDto);
  }

  @Patch('subcategories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subcategory (Admin only)' })
  @ApiResponse({ status: 200, description: 'The subcategory has been successfully updated.', type: TaxonomySubcategory })
  @ApiResponse({ status: 404, description: 'Subcategory not found.' })
  updateSubcategory(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<TaxonomySubcategory> {
    return this.taxonomyService.updateSubcategory(id, updateSubcategoryDto);
  }

  @Delete('subcategories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subcategory (Admin only)' })
  @ApiResponse({ status: 200, description: 'The subcategory has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Subcategory not found.' })
  removeSubcategory(@Param('id') id: string): Promise<void> {
    return this.taxonomyService.removeSubcategory(id);
  }

  @Public()
  @Get('categories/:categoryId/subcategories')
  @ApiOperation({ summary: 'Get subcategories of a specific category' })
  @ApiResponse({ status: 200, description: 'Return subcategories of the category.', type: [TaxonomySubcategory] })
  findSubcategoriesByCategory(@Param('categoryId') categoryId: string): Promise<TaxonomySubcategory[]> {
    return this.taxonomyService.findSubcategoriesByCategory(categoryId);
  }

  @Public()
  @Get('subcategories/:id')
  @ApiOperation({ summary: 'Get a subcategory by ID' })
  @ApiResponse({ status: 200, description: 'Return the subcategory.', type: TaxonomySubcategory })
  @ApiResponse({ status: 404, description: 'Subcategory not found.' })
  findOneSubcategory(@Param('id') id: string): Promise<TaxonomySubcategory> {
    return this.taxonomyService.findOneSubcategory(id);
  }
}
