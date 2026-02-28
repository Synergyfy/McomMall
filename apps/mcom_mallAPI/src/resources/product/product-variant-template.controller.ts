import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductVariantTemplateService } from './product-variant-template.service';
import { CreateProductVariantTemplateDto } from './dto/create-product-variant-template.dto';
import { UpdateProductVariantTemplateDto } from './dto/update-product-variant-template.dto';
import { ProductVariantTemplateSearchDto } from './dto/product-variant-template-search.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';

@ApiTags('Product Variant Templates')
@ApiBearerAuth()
@Controller('product-variant-template')
export class ProductVariantTemplateController {
  constructor(
    private readonly templateService: ProductVariantTemplateService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new variant template (Admin only)' })
  create(@Body() createDto: CreateProductVariantTemplateDto) {
    return this.templateService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all variant templates with pagination and search',
  })
  findAll(@Query() searchDto: ProductVariantTemplateSearchDto) {
    return this.templateService.findAllPaginated(searchDto);
  }

  @Get('filter')
  @ApiOperation({
    summary: 'Fetch templates by product type and category (Paginated)',
  })
  findByFilter(@Query() searchDto: ProductVariantTemplateSearchDto) {
    return this.templateService.findAllPaginated(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific variant template' })
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a variant template (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductVariantTemplateDto,
  ) {
    return this.templateService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a variant template (Admin only)' })
  remove(@Param('id') id: string) {
    return this.templateService.remove(id);
  }
}
