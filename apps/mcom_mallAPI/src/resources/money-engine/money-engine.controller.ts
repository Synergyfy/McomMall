import { Body, Controller, Get, Patch, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { MoneyEngineService } from './money-engine.service';
import {
  CreateRewardDefinitionDto,
  PurchaseVoucherDto,
  CashbackInjectionDto,
  SpendDto,
  UserVoucherResponseDto,
  TransferDto,
  MoneyEngineAnalyticsDto,
  VoucherAdminResponseDto,
  UpdateRewardDefinitionDto,
  BusinessStatsResponseDto,
  CustomerMoneyStatsDto
} from './dto/dtos';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RewardDefinition, VisualType, FunctionalType, ScopeType } from './entities/reward-definition.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Money Engine (Voucher System)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('money-engine')
export class MoneyEngineController {
  constructor(private readonly moneyEngineService: MoneyEngineService) {}

  // --- DISCOVERY ENDPOINTS ---

  @Get('definitions/public')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN) // Anyone can see what's for sale
  @ApiOperation({
    summary: 'List Available Vouchers (Public)',
    description: 'Returns a list of all active voucher types available for purchase by customers.'
  })
  @ApiResponse({
    status: 200,
    description: 'Public definitions retrieved successfully.',
    type: [RewardDefinition]
  })
  async getPublicDefinitions(@Query() pagination: PaginationQueryDto) {
    return this.moneyEngineService.getPublicDefinitions(pagination);
  }

  @Get('definitions/shop/:shopId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'List Accepted Vouchers for a Shop',
    description: 'Returns a list of all voucher types that can be spent at a specific shop. Includes global vouchers (ANY_SHOP) and specific ones authorized for this shop.'
  })
  @ApiResponse({
    status: 200,
    description: 'Shop-specific definitions retrieved successfully.',
    type: [RewardDefinition]
  })
  async getShopDefinitions(@Param('shopId') shopId: string, @Query() pagination: PaginationQueryDto) {
      return this.moneyEngineService.getDefinitionsForShop(shopId, pagination);
  }

  @Get('definitions/owner/me')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'List Accepted Vouchers for All My Shops',
    description: 'Returns all voucher types that the logged-in owner can accept across any of their businesses.'
  })
  @ApiResponse({
    status: 200,
    description: 'Owner-wide definitions retrieved successfully.',
    type: [RewardDefinition]
  })
  async getOwnerDefinitions(@CurrentUser() user: User, @Query() pagination: PaginationQueryDto) {
      return this.moneyEngineService.getDefinitionsForOwner(user.id, pagination);
  }

  // --- ADMIN ENDPOINTS ---

  @Post('definitions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new Reward Definition (Admin Only)',
    description: 'Defines the rules for a voucher type, including split ratio (Real vs Reward), scope, and visual type. Only Admins can create these definitions.'
  })
  @ApiBody({ type: CreateRewardDefinitionDto })
  @ApiResponse({
    status: 201,
    description: 'Definition created successfully.',
    type: RewardDefinition
  })
  async createDefinition(@Body() dto: CreateRewardDefinitionDto) {
    return this.moneyEngineService.createRewardDefinition(dto);
  }

  @Patch('definitions/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update Reward Definition (Admin Only)',
    description: 'Update existing reward definitions, e.g., to turn off a campaign (isActive: false).'
  })
  @ApiResponse({
    status: 200,
    description: 'Definition updated successfully.',
    type: RewardDefinition
  })
  async updateDefinition(@Param('id') id: string, @Body() dto: UpdateRewardDefinitionDto) {
      return this.moneyEngineService.updateRewardDefinition(id, dto);
  }

  @Get('admin/analytics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get Money Engine Analytics (Admin Only)',
    description: 'Retrieves platform-wide financial metrics including active voucher counts, total real money deposited, rewards minted, and network utilization efficiency. Includes 30-day growth trends.'
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully.',
    type: MoneyEngineAnalyticsDto
  })
  async getAnalytics() {
    return this.moneyEngineService.getAdminAnalytics();
  }

  @Get('admin/vouchers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'List All Vouchers (Admin Only)',
    description: 'Provides a paginated master list of every voucher/coupon issued on the network. Useful for auditing and support.'
  })
  @ApiResponse({
    status: 200,
    description: 'Master list of vouchers retrieved successfully.'
  })
  async getAllVouchers(@Query() pagination: PaginationQueryDto) {
    const { data, count } = await this.moneyEngineService.getAllVouchers(pagination);
    return {
        data: data.map(v => ({
            ...this.mapToResponse(v),
            ownerEmail: v.owner?.email,
            realBalance: v.realBalance,
            rewardBalance: v.rewardBalance,
            createdAt: v.created_at
        })),
        count
    };
  }

  @Get('admin/definitions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'List All Reward Definitions (Admin Only)',
    description: 'Returns all voucher configuration templates (definitions) existing on the platform.'
  })
  @ApiResponse({
    status: 200,
    description: 'Reward definitions retrieved successfully.',
    type: [RewardDefinition]
  })
  async getAllDefinitions(@Query() pagination: PaginationQueryDto) {
    return this.moneyEngineService.getAllDefinitions(pagination);
  }

  // --- USER ENDPOINTS ---

  @Post('purchase')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Purchase a Voucher (Minting)',
    description: 'Enables a customer to pay "Real Money" and acquire a voucher. The platform automatically mints additional "Reward Money" based on the definition\'s split ratio.'
  })
  @ApiBody({ type: PurchaseVoucherDto })
  @ApiResponse({
    status: 201,
    description: 'Voucher purchased and minted successfully.',
    type: UserVoucherResponseDto
  })
  async purchaseVoucher(@CurrentUser() user: User, @Body() dto: PurchaseVoucherDto) {
    const voucher = await this.moneyEngineService.purchaseVoucher(user.id, dto);
    return this.mapToResponse(voucher);
  }

  @Get('me/stats')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get My Money Stats',
    description: 'Retrieves aggregated statistics for the logged-in customer, including total active balance, real/reward breakdown, and lifetime rewards received from businesses.'
  })
  @ApiResponse({
    status: 200,
    description: 'Customer money statistics retrieved successfully.',
    type: CustomerMoneyStatsDto
  })
  async getMyStats(@CurrentUser() user: User) {
    return this.moneyEngineService.getCustomerStats(user.id);
  }

  @Get('me')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get My Vouchers',
    description: 'Retrieves all active vouchers owned by the logged-in customer.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of personal vouchers retrieved successfully.'
  })
  async getMyVouchers(@CurrentUser() user: User, @Query() pagination: PaginationQueryDto) {
    const { data, count } = await this.moneyEngineService.getUserVouchers(user.id, pagination);
    return {
        data: data.map(v => this.mapToResponse(v)),
        count
    };
  }

  // --- BUSINESS ENDPOINTS ---

  @Post('cashback')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Inject Cashback (Business Owner Only)',
    description: 'Allows a business owner to reward a customer by injecting "Reward Money" directly into their voucher balance.'
  })
  @ApiBody({ type: CashbackInjectionDto })
  @ApiResponse({
    status: 201,
    description: 'Cashback reward injected successfully.',
    type: UserVoucherResponseDto
  })
  async injectCashback(@Body() dto: CashbackInjectionDto) {
    const voucher = await this.moneyEngineService.injectCashback(dto);
    return this.mapToResponse(voucher);
  }

  @Get('business/stats')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Get Business Stats (Business Owner Only)',
    description: 'See how many vouchers have been used in your shop, total spend, and cashback given.'
  })
    @ApiResponse({
        status: 200,
        description: 'Business stats retrieved.',
        type: BusinessStatsResponseDto
    })
    async getBusinessStats(@CurrentUser() user: User) { 
        return this.moneyEngineService.getBusinessStatsForUser(user.id);
    }  
  // Revised Business Stats to be more robust
  @Get('business/:shopId/stats')
  @Roles(UserRole.OWNER)
  @ApiOperation({
      summary: 'Get Specific Shop Stats',
      description: 'Get stats for a specific shop owned by the user.'
  })
  async getShopStats(@Param('shopId') shopId: string) {
      return this.moneyEngineService.getBusinessStats(shopId);
  }

  // --- SHARED / SYSTEM ENDPOINTS ---

  @Post('spend')
  @Roles(UserRole.CUSTOMER) // Or POS
  @ApiOperation({
    summary: 'Spend Voucher Funds',
    description: 'Deducts funds from a voucher when a customer makes a purchase at an authorized shop. Logic follows the definition\'s burn strategy.'
  })
  @ApiBody({ type: SpendDto })
  @ApiResponse({
    status: 201,
    description: 'Voucher funds deducted successfully.',
    type: UserVoucherResponseDto
  })
  async spend(@Body() dto: SpendDto) {
    const voucher = await this.moneyEngineService.spend(dto);
    return this.mapToResponse(voucher);
  }
  
  // --- PEER TRANSFER ---

  @Post('transfer')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Peer-to-Peer Transfer',
    description: 'Allows a customer to transfer a portion of their voucher balance to another customer\'s voucher. The Real/Reward ratio is preserved.'
  })
  @ApiBody({ type: TransferDto })
  @ApiResponse({
    status: 201,
    description: 'Balance transfer completed successfully.'
  })
  async transfer(@Body() dto: TransferDto) {
    await this.moneyEngineService.transfer(dto.fromVoucherId, dto.toVoucherId, dto.amount);
    return { success: true, message: 'Transfer completed' };
  }

  // Helper to hide internal state
  private mapToResponse(voucher: UserVoucher): UserVoucherResponseDto {
    return {
      id: voucher.id,
      code: voucher.code,
      totalBalance: voucher.totalBalance,
      state: voucher.state,
      definition: {
        name: voucher.definition?.name,
        description: voucher.definition?.description,
        visualType: voucher.definition?.visualType
      }
    };
  }
}