import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ServiceAuthGuard } from '../service-mesh/guards/service-auth.guard';
import { ServiceScopesGuard } from '../service-mesh/guards/service-scopes.guard';
import { RequireServiceScopes } from '../service-mesh/decorators/require-service-scopes.decorator';
import { SERVICE_SCOPE_MALL_READ } from '../service-mesh/constants';
import { AuthenticatedServiceRequest } from '../service-mesh/interfaces/authenticated-service-request.interface';
import { PartnerFeatureFlagsService } from '../partner-instruments/partner-feature-flags.service';
import { PartnerCatalogService } from './partner-catalog.service';
import { PartnerRateLimitGuard } from '../partner-instruments/guards/partner-rate-limit.guard';

/**
 * Read-only mall catalog exposed to ecosystem partners (e.g. MCOM Rewards) so
 * they can target mall products/services when configuring rewards.
 *
 * Auth: RS256 service token (audience = "mcom-mall"), scope `mall:read`.
 */
@ApiTags('Mall Partner Catalog')
@ApiSecurity('mcom-service-token')
@Controller('partner/catalog')
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard, PartnerRateLimitGuard)
export class PartnerCatalogController {
  constructor(
    private readonly catalog: PartnerCatalogService,
    private readonly flags: PartnerFeatureFlagsService,
  ) {}

  @Get('business')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({
    summary: 'Resolve a mall business and its catalogue by MCOM user id or email',
  })
  @ApiQuery({ name: 'mcomUserId', required: false })
  @ApiQuery({ name: 'email', required: false })
  getBusiness(
    @Query('mcomUserId') mcomUserId?: string,
    @Query('email') email?: string,
  ) {
    return this.catalog.getBusiness({ mcomUserId, email });
  }

  @Get('business/:businessId/products')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'List products for a mall business' })
  listProducts(@Param('businessId') businessId: string) {
    return this.catalog.listProducts(businessId);
  }

  @Get('business/:businessId/services')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'List services for a mall business' })
  listServices(@Param('businessId') businessId: string) {
    return this.catalog.listServices(businessId);
  }

  // ─── Global (platform-admin) browse ─────────────────────────────────────

  @Get('listings')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'Paginated, searchable listings (platform callers)' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'status', required: false })
  listListings(
    @Query() query: Record<string, string>,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    this.assertGlobalCatalog(req);
    return this.catalog.listListingsPaginated(query);
  }

  @Get('listings/:id')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'Listing plus products and services' })
  getListing(
    @Param('id') id: string,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    this.assertGlobalCatalog(req);
    return this.catalog.getListingDetail(id);
  }

  @Get('products')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'Paginated products (platform callers)' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'status', required: false })
  listAllProducts(
    @Query() query: Record<string, string>,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    this.assertGlobalCatalog(req);
    return this.catalog.listProductsPaginated(query);
  }

  @Get('services')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'Paginated services (platform callers)' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'status', required: false })
  listAllServices(
    @Query() query: Record<string, string>,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    this.assertGlobalCatalog(req);
    return this.catalog.listServicesPaginated(query);
  }

  private assertGlobalCatalog(req: AuthenticatedServiceRequest): void {
    if (!this.flags.isGlobalCatalogEnabled()) {
      throw new ServiceUnavailableException(
        'FEATURE_DISABLED: partner global catalogue is not enabled.',
      );
    }
    if (!this.isPlatform(req)) {
      throw new ForbiddenException(
        'CROSS_TENANT_SCOPE: global catalogue browse requires a platform/admin caller.',
      );
    }
  }

  private isPlatform(req: AuthenticatedServiceRequest): boolean {
    return this.flags.isPlatformCaller({
      callerAppId: req.serviceCaller?.callerAppId,
      payload: req.serviceCaller?.payload as any,
    });
  }
}
