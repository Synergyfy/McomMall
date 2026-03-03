import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginAdminDto } from './dto/admin.dto';
import { AdminDashboardResponseDto } from './dto/dashboard.dto';
import { UserStatsDto, UserQueryDto, PaginatedUsersDto } from './dto/users.dto';
import {
  BusinessStatsDto,
  BusinessQueryDto,
  PaginatedBusinessesDto,
  AdminBusinessListingDto,
} from './dto/businesses.dto';
import {
  ListingStatsDto,
  ListingQueryDto,
  PaginatedListingsDto,
} from './dto/listings.dto';
import { UpdateBusinessAdminDto } from './dto/update-business.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { BusinessStatus } from '../listings/listing.enum';
import { OrderService } from '../order/order.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Order } from '../order/entities/order.entity';
import { PageDto } from 'src/common/dto/page.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly orderService: OrderService,
  ) {}

  @ApiOperation({
    summary: 'Get all orders across the platform',
    description: 'Returns a paginated list of all orders. Roles: ADMIN only.',
  })
  @ApiResponse({ status: 200, type: PageDto, description: 'List of all platform orders.' })
  @Roles(UserRole.ADMIN)
  @Get('orders')
  async getAllOrders(@Query() pagination: PaginationQueryDto) {
    return this.orderService.getOrdersForAdmin(pagination);
  }

  @ApiOperation({ summary: 'Create a new super admin' })
  @ApiResponse({
    status: 201,
    description: 'Super admin created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Public()
  @Post('signup')
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @ApiOperation({ summary: 'Authenticate as super admin' })
  @ApiResponse({
    status: 201,
    description: 'Super admin authenticated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  @Public()
  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully.',
    type: AdminDashboardResponseDto,
  })
  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  async getDashboardData() {
    return this.adminService.getDashboardData();
  }

  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully.',
    type: UserStatsDto,
  })
  @Roles(UserRole.ADMIN)
  @Get('users/stats')
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @ApiOperation({ summary: 'Get paginated list of users with filters' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
    type: PaginatedUsersDto,
  })
  @Roles(UserRole.ADMIN)
  @Get('users')
  async getUsers(@Query() query: UserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @ApiOperation({ summary: 'Get business statistics' })
  @ApiResponse({
    status: 200,
    description: 'Business statistics retrieved successfully.',
    type: BusinessStatsDto,
  })
  @Roles(UserRole.ADMIN)
  @Get('businesses/stats')
  async getBusinessStats() {
    return this.adminService.getBusinessStats();
  }

  @ApiOperation({ summary: 'Get paginated list of businesses with filters' })
  @ApiResponse({
    status: 200,
    description: 'Businesses retrieved successfully.',
    type: PaginatedBusinessesDto,
  })
  @Roles(UserRole.ADMIN)
  @Get('businesses')
  async getBusinesses(@Query() query: BusinessQueryDto) {
    return this.adminService.getBusinesses(query);
  }

  @ApiOperation({ summary: 'Get all listings for a business' })
  @ApiResponse({
    status: 200,
    description: 'Listings retrieved successfully.',
    type: [AdminBusinessListingDto],
  })
  @Roles(UserRole.ADMIN)
  @Get('businesses/:id/listings')
  async getBusinessListings(@Param('id') id: string) {
    return this.adminService.getBusinessListings(id);
  }

  @ApiOperation({ summary: 'Verify or unverify a business' })
  @ApiResponse({
    status: 200,
    description: 'Business verification updated successfully.',
  })
  @Roles(UserRole.ADMIN)
  @Patch('businesses/:id/verify')
  async verifyBusiness(
    @Param('id') id: string,
    @Body('isVerified') isVerified: boolean,
  ) {
    return this.adminService.verifyBusiness(id, isVerified);
  }

  @ApiOperation({ summary: 'Update business status' })
  @ApiResponse({
    status: 200,
    description: 'Business status updated successfully.',
  })
  @Roles(UserRole.ADMIN)
  @Patch('businesses/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BusinessStatus,
  ) {
    return this.adminService.updateBusinessStatus(id, status);
  }

  @ApiOperation({ summary: 'Update business details' })
  @ApiResponse({ status: 200, description: 'Business updated successfully.' })
  @Roles(UserRole.ADMIN)
  @Patch('businesses/:id')
  async updateBusiness(
    @Param('id') id: string,
    @Body() updateBusinessAdminDto: UpdateBusinessAdminDto,
  ) {
    return this.adminService.updateBusiness(id, updateBusinessAdminDto);
  }

  @ApiOperation({ summary: 'Get listing statistics' })
  @ApiResponse({
    status: 200,
    description: 'Listing statistics retrieved successfully.',
    type: ListingStatsDto,
  })
  @Roles(UserRole.ADMIN)
  @Get('listings/stats')
  async getListingStats() {
    return this.adminService.getListingStats();
  }

  @ApiOperation({ summary: 'Get paginated list of listings with filters' })
  @ApiResponse({
    status: 200,
    description: 'Listings retrieved successfully.',
    type: PaginatedListingsDto,
  })
  @Roles(UserRole.ADMIN)
  @Get('listings')
  async getListings(@Query() query: ListingQueryDto) {
    return this.adminService.getListings(query);
  }

  @ApiOperation({ summary: 'Update listing status' })
  @ApiResponse({
    status: 200,
    description: 'Listing status updated successfully.',
  })
  @Roles(UserRole.ADMIN)
  @Patch('listings/:id/status')
  async updateListingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateListingStatus(id, status);
  }

  /*
  @ApiOperation({ summary: 'Toggle listing featured status' })
  @ApiResponse({ status: 200, description: 'Listing featured status updated successfully.' })
  @Roles(UserRole.ADMIN)
  @Patch('listings/:id/featured')
  async toggleListingFeatured(
    @Param('id') id: string,
    @Body('type') type: 'product' | 'service',
    @Body('isFeatured') isFeatured: boolean,
  ) {
    // Feature not currently supported for Business Listings
    throw new BadRequestException('Featured status not supported for listings');
    // return this.adminService.toggleListingFeatured(id, type, isFeatured);
  }
  */
}
