import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  BundledServiceDto,
  ConfigurableAddonDto,
} from './dto/create-service.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ServiceSearchDto } from './dto/service-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { Service } from './entities/service.entity';
import { SearchServiceDto } from './dto/search-service.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search services by term' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of services matching the search term.',
    type: [Service],
  })
  async search(@Query() searchServiceDto: SearchServiceDto) {
    return this.servicesService.search(searchServiceDto);
  }

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Get all public services with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of public services.',
  })
  async findAllPublic(
    @Query() searchDto: ServiceSearchDto,
  ): Promise<PageDto<Service>> {
    return this.servicesService.findAllPublic(searchDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: 201,
    description: 'The service has been successfully created.',
    type: Service,
    example: {
      id: 'uuid-123',
      name: 'Professional House Cleaning',
      description: 'Complete professional cleaning',
      pricingModel: 'fixed',
      fixedPrice: 100,
      businessId: 'biz-uuid-123',
      category: 'Home Services',
      status: 'published',
    },
  })
  create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    return this.servicesService.create(createServiceDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all services owned by the current user' })
  @ApiResponse({
    status: 200,
    description: 'A list of services belonging to the user.',
  })
  findAllForUser(@Request() req) {
    return this.servicesService.findAllForUser(req.user.id);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Get all services for a specific user' })
  findAllForSpecificUser(@Param('userId') userId: string) {
    return this.servicesService.findAllForUser(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single service by ID' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'The service details.',
    type: Service,
  })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Public()
  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all services for a specific business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: 200,
    description: 'A list of services for the business.',
  })
  findAllForBusiness(
    @Param('businessId') businessId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.servicesService.findAllForBusiness(businessId, paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'The updated service.',
    type: Service,
  })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req,
  ) {
    return this.servicesService.update(id, updateServiceDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully deleted.',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bundled-services')
  @ApiOperation({ summary: 'Add a bundled service to an existing service' })
  @ApiParam({ name: 'id', description: 'Parent Service ID' })
  @ApiResponse({
    status: 201,
    description: 'The bundled service has been added.',
  })
  addBundledService(
    @Param('id') serviceId: string,
    @Body() dto: BundledServiceDto,
    @Request() req,
  ) {
    return this.servicesService.addBundledService(serviceId, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':serviceId/bundled-services/:id')
  @ApiOperation({ summary: 'Remove a bundled service' })
  @ApiParam({ name: 'serviceId', description: 'Parent Service ID' })
  @ApiParam({ name: 'id', description: 'Bundled Service ID' })
  @ApiResponse({
    status: 200,
    description: 'The bundled service has been removed.',
  })
  removeBundledService(
    @Param('serviceId') serviceId: string,
    @Param('id') bundledServiceId: string,
    @Request() req,
  ) {
    return this.servicesService.removeBundledService(
      serviceId,
      bundledServiceId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/addons')
  @ApiOperation({ summary: 'Add a configurable addon to an existing service' })
  @ApiParam({ name: 'id', description: 'Parent Service ID' })
  @ApiResponse({
    status: 201,
    description: 'The addon has been added.',
  })
  addConfigurableAddon(
    @Param('id') serviceId: string,
    @Body() dto: ConfigurableAddonDto,
    @Request() req,
  ) {
    return this.servicesService.addConfigurableAddon(
      serviceId,
      dto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':serviceId/addons/:id')
  @ApiOperation({ summary: 'Remove a configurable addon' })
  @ApiParam({ name: 'serviceId', description: 'Parent Service ID' })
  @ApiParam({ name: 'id', description: 'Addon ID' })
  @ApiResponse({
    status: 200,
    description: 'The addon has been removed.',
  })
  removeConfigurableAddon(
    @Param('serviceId') serviceId: string,
    @Param('id') addonId: string,
    @Request() req,
  ) {
    return this.servicesService.removeConfigurableAddon(
      serviceId,
      addonId,
      req.user.id,
    );
  }
}
