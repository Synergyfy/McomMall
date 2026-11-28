import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/role.enum';
import { User } from '../users/entities/user.entity';
import {
  CreateTakeadsOfferDto,
  RejectTakeadsOfferDto,
  ReviewTakeadsCouponDto,
  ResolveTakeadsLinkDto,
  ReviewTakeadsMerchantDto,
  SyncTakeadsDto,
  UpdateTakeadsOfferDto,
} from './dto/takeads-offer.dto';
import {
  TakeadsCouponQueryDto,
  TakeadsMerchantQueryDto,
  TakeadsOfferQueryDto,
  TakeadsReportQueryDto,
} from './dto/takeads-query.dto';
import { TakeadsAdminService } from './takeads-admin.service';
import { TakeadsSyncService } from './takeads-sync.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/takeads')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class TakeadsAdminController {
  constructor(
    private readonly adminService: TakeadsAdminService,
    private readonly syncService: TakeadsSyncService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get TakeAds integration overview' })
  overview() {
    return this.adminService.getOverview();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get TakeAds connection settings (no secrets)' })
  settings() {
    return this.adminService.getSettings();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Trigger a TakeAds sync' })
  sync(@Body() dto: SyncTakeadsDto) {
    if (dto.type === 'all') return this.syncService.syncAll();
    if (dto.type === 'merchants') return this.syncService.syncMerchants();
    if (dto.type === 'coupons') return this.syncService.syncCoupons();
    return this.syncService.syncReports();
  }

  @Get('sync-runs')
  @ApiOperation({ summary: 'List recent TakeAds sync runs' })
  syncRuns() {
    return this.adminService.listSyncRuns();
  }

  @Get('merchants')
  @ApiOperation({ summary: 'List imported TakeAds merchants' })
  merchants(@Query() query: TakeadsMerchantQueryDto) {
    return this.adminService.listMerchants(query);
  }

  @Get('merchants/:id')
  @ApiOperation({ summary: 'Get a TakeAds merchant' })
  merchant(@Param('id') id: string) {
    return this.adminService.getMerchant(id);
  }

  @Patch('merchants/:id/review')
  @ApiOperation({ summary: 'Review and map a TakeAds merchant' })
  reviewMerchant(
    @Param('id') id: string,
    @Body() dto: ReviewTakeadsMerchantDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.reviewMerchant(id, dto, user?.id);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List imported TakeAds coupons' })
  coupons(@Query() query: TakeadsCouponQueryDto) {
    return this.adminService.listCoupons(query);
  }

  @Get('coupons/:id')
  @ApiOperation({ summary: 'Get a TakeAds coupon' })
  coupon(@Param('id') id: string) {
    return this.adminService.getCoupon(id);
  }

  @Patch('coupons/:id/review')
  @ApiOperation({ summary: 'Review and publish/unpublish a TakeAds coupon' })
  reviewCoupon(
    @Param('id') id: string,
    @Body() dto: ReviewTakeadsCouponDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.reviewCoupon(id, dto, user?.id);
  }

  @Get('offers')
  @ApiOperation({ summary: 'List TakeAds offers' })
  offers(@Query() query: TakeadsOfferQueryDto) {
    return this.adminService.listOffers(query);
  }

  @Post('offers')
  @ApiOperation({ summary: 'Create a TakeAds offer' })
  createOffer(
    @Body() dto: CreateTakeadsOfferDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.createOffer(dto, user?.id);
  }

  @Post('offers/resolve-url')
  @ApiOperation({
    summary: 'Resolve a product URL before creating an affiliate offer',
  })
  resolveUrl(@Body() dto: ResolveTakeadsLinkDto) {
    return this.syncService.resolveUrl(dto);
  }

  @Get('offers/:id/preview')
  @ApiOperation({ summary: 'Preview an offer before it is published' })
  preview(@Param('id') id: string) {
    return this.adminService.getOfferPreview(id);
  }

  @Get('offers/:id')
  @ApiOperation({ summary: 'Get a TakeAds offer' })
  offer(@Param('id') id: string) {
    return this.adminService.getOffer(id);
  }

  @Patch('offers/:id')
  @ApiOperation({ summary: 'Update a TakeAds offer presentation' })
  updateOffer(@Param('id') id: string, @Body() dto: UpdateTakeadsOfferDto) {
    return this.adminService.updateOffer(id, dto);
  }

  @Post('offers/:id/resolve')
  @ApiOperation({ summary: 'Resolve the affiliate tracking link for an offer' })
  resolveOffer(@Param('id') id: string) {
    return this.adminService.resolveOffer(id);
  }

  @Patch('offers/:id/approve')
  @ApiOperation({ summary: 'Approve a TakeAds offer' })
  approveOffer(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.approveOffer(id, user?.id);
  }

  @Patch('offers/:id/reject')
  @ApiOperation({ summary: 'Reject a TakeAds offer' })
  rejectOffer(
    @Param('id') id: string,
    @Body() dto: RejectTakeadsOfferDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.rejectOffer(id, dto, user?.id);
  }

  @Patch('offers/:id/publish')
  @ApiOperation({ summary: 'Publish an approved TakeAds offer' })
  publishOffer(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.publishOffer(id, user?.id);
  }

  @Patch('offers/:id/pause')
  @ApiOperation({ summary: 'Pause a TakeAds offer' })
  pauseOffer(@Param('id') id: string) {
    return this.adminService.pauseOffer(id);
  }

  @Patch('offers/:id/withdraw')
  @ApiOperation({ summary: 'Withdraw a TakeAds offer' })
  withdrawOffer(@Param('id') id: string) {
    return this.adminService.withdrawOffer(id);
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get MCOM vs TakeAds performance summary' })
  reportsSummary(@Query() query: TakeadsReportQueryDto) {
    return this.adminService.getReportsSummary(query);
  }

  @Get('reports/mcom-clicks')
  @ApiOperation({ summary: 'List MCOM-recorded outbound clicks' })
  mcomClicks(@Query() query: TakeadsReportQueryDto) {
    return this.adminService.listMcomClicks(query);
  }

  @Get('reports/takeads-clicks')
  @ApiOperation({ summary: 'List TakeAds click aggregates' })
  takeadsClicks(@Query() query: TakeadsReportQueryDto) {
    return this.adminService.listTakeadsClicks(query);
  }

  @Get('reports/actions')
  @ApiOperation({ summary: 'List TakeAds actions' })
  actions(@Query() query: TakeadsReportQueryDto) {
    return this.adminService.listActions(query);
  }

  @Get('reports/products')
  @ApiOperation({ summary: 'Per-offer affiliate performance' })
  productPerformance(@Query() query: TakeadsReportQueryDto) {
    return this.adminService.getProductPerformance(query);
  }

  @Post('reports/sync')
  @ApiOperation({ summary: 'Trigger a TakeAds report sync' })
  syncReports() {
    return this.syncService.syncReports();
  }
}
