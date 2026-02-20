import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { ListingsService } from '../listings/listing.service';
import { ErrorFactory } from '../../common/errors/error.factory';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProductSearchDto } from './dto/product-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { Product } from './entities/product.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly listingsService: ListingsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    type: Product,
    example: {
      id: 'uuid-123',
      title: 'Premium T-Shirt',
      price: 25.0,
      salePrice: 20.0,
      productType: 'physical',
      sku: 'TSHIRT-001',
      category: 'Clothing',
      attributes: [
        { name: 'Color', options: [{ name: 'Red', priceModifier: 0 }] }
      ],
      variations: [
        {
          id: 'v-uuid-1',
          combination: { Color: 'Red' },
          sku: 'TSHIRT-001-RED',
          price: 25.0,
          salePrice: 20.0,
          stock: 100,
          available: true
        }
      ],
      useVariantPricing: true,
      productStatus: 'published',
      created_at: '2024-03-05T12:00:00Z',
      updated_at: '2024-03-05T12:00:00Z'
    }
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    const { bussinessId, productType } = createProductDto;
    const business = await this.listingsService.findOne(bussinessId, userId);
    if (!business) throw ErrorFactory.businessError();

    return this.productService.create(createProductDto, business);
  }

  @Get('/mine')
  findAllByUser(@Req() req: Request) {
    const userId = req.user['id'];
    return this.productService.findAllByUser(userId);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Get all products for a specific user' })
  findAllBySpecificUser(@Param('userId') userId: string) {
    return this.productService.findAllByUser(userId);
  }

  @Public()
  @Get('public')
  findAllPublic(@Query() searchDto: ProductSearchDto): Promise<PageDto<Product>> {
    return this.productService.findAllPublic(searchDto);
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    return this.productService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user['id'];
    return this.productService.remove(id, userId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('business/:businessId')
  findAllForBusiness(
    @Param('businessId') businessId: string,
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productService.findAllForBusiness(
      businessId,
      paginationDto,
      user,
    );
  }
}
