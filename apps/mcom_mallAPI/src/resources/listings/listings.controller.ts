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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('Listings')
@Controller('listings')
@UseGuards(JwtAuthGuard, CapabilitiesGuard) // Ensure Guards are applied
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search businesses based on query text, category, location, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of businesses matching the search criteria.',
    example: {
      items: [
        {
          id: 'b6e5b220-4a8b-4c3a-8d2a-1c5d9e5f5a2b',
          businessName: 'Tech Solutions Ltd',
          shortDescription: 'Leading provider of tech solutions',
          listingType: ['SERVICE'],
          location: { city: 'London', postcode: 'EC1A 1BB' },
        },
      ],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
  search(@Query() searchQuery: SearchBusinessDto) {
    return this.listingsService.search(searchQuery);
  }

  @Public()
  @Get('recent')
  @ApiOperation({ summary: 'Get recently created businesses' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit the number of results (default 6)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of recently created businesses.',
    example: [
      {
        id: 'c8d2a1b9-5f2e-4b3a-9c7d-8e4f1a2b3c4d',
        businessName: 'New Café',
        createdAt: '2023-11-01T12:00:00Z',
      },
    ],
  })
  recent(@Query('limit') limit?: number) {
    return this.listingsService.findRecent(limit ? Number(limit) : 6);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get all businesses created by the current user' })
  @ApiResponse({
    status: 200,
    description: "Returns a paginated list of user's businesses.",
    example: {
      items: [
        {
          id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          businessName: 'My Personal Shop',
          status: 'PUBLISHED',
        },
      ],
      meta: {
        totalItems: 5,
        itemCount: 5,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
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
  @ApiOperation({ summary: 'Create a new business listing' })
  @ApiBody({
    type: CreateBusinessDto,
    examples: {
      example1: {
        summary: 'Full Business Creation Example',
        value: {
          listingType: ['RETAIL', 'SERVICE'],
          businessName: 'Golden Bakery',
          legalName: 'Golden Bakery Ltd.',
          shortDescription: 'Freshly baked goods every day.',
          about: 'We use traditional recipes passed down through generations.',
          website: 'https://goldenbakery.com',
          businessPhone: '+442012345678',
          businessEmail: 'info@goldenbakery.com',
          location: {
            postcode: 'W1D 1AN',
            addressLine1: '123 Baker Street',
            city: 'London',
            showPublicly: true,
            deliveryRadiusKm: 5,
            serviceModel: 'HYBRID',
          },
          sectorId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          categoryId: 'e390f1ee-6c54-4b01-90e6-d701748f0852',
          subCategoryId: 'f490f1ee-6c54-4b01-90e6-d701748f0853',
          businessHours: [
            { dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '18:00' },
            { dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '18:00' },
          ],
          socialLinks: [
            {
              platform: 'Instagram',
              url: 'https://instagram.com/goldenbakery',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The business has been successfully created.',
    example: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      businessName: 'Golden Bakery',
      slug: 'golden-bakery',
      status: 'DRAFT',
      createdAt: '2023-11-15T10:00:00Z',
    },
  })
  create(@Body() createBusinessDto: CreateBusinessDto, @Request() req) {
    const userId = req.user.id;
    return this.listingsService.create(createBusinessDto, userId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a business by ID' })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the business details.',
    example: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      businessName: 'Golden Bakery',
      shortDescription: 'Freshly baked goods every day.',
      location: {
        addressLine1: '123 Baker Street',
        city: 'London',
      },
      products: [],
      services: [],
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.listingsService.findOnePublic(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing business' })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiBody({
    type: UpdateBusinessDto,
    examples: {
      example1: {
        summary: 'Update Business Phone',
        value: {
          businessPhone: '+447999888777',
          shortDescription: 'Updated description for our bakery.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The business has been successfully updated.',
    example: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      businessPhone: '+447999888777',
      updatedAt: '2023-11-16T10:00:00Z',
    },
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.listingsService.update(id, updateBusinessDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business' })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiResponse({
    status: 200,
    description: 'The business has been successfully deleted.',
    example: {
      message: 'Business deleted successfully',
    },
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.id;
    return this.listingsService.remove(id, userId);
  }

  @Public()
  @Get(':businessId/services')
  @ApiOperation({ summary: 'Get all services for a specific business' })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of services for the business.',
    example: {
      items: [
        {
          id: 's1s2s3s4-5555-6666-7777-88889999aaaa',
          name: 'Bread Baking Workshop',
          price: 45.0,
        },
      ],
      meta: {
        totalItems: 3,
        itemCount: 3,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
  findAllServicesForBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.findAllForBusiness(businessId, paginationDto);
  }
}
