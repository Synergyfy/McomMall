import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ServiceAuthGuard } from '../service-mesh/guards/service-auth.guard';
import { ServiceScopesGuard } from '../service-mesh/guards/service-scopes.guard';
import { RequireServiceScopes } from '../service-mesh/decorators/require-service-scopes.decorator';
import { SERVICE_SCOPE_MALL_READ } from '../service-mesh/constants';
import { AuthenticatedServiceRequest } from '../service-mesh/interfaces/authenticated-service-request.interface';
import { PartnerFeatureFlagsService } from '../partner-instruments/partner-feature-flags.service';
import { PartnerTemplatesService, TemplateQuery } from './partner-templates.service';
import { PartnerRateLimitGuard } from '../partner-instruments/guards/partner-rate-limit.guard';

/**
 * Template discovery for ecosystem partners so Rewards can offer a business's
 * gift-card templates, voucher products, and coupon templates in its reward
 * builder.
 *
 * Auth: RS256 service token (audience = `mcom-mall`), scope `mall:read`.
 */
@ApiTags('Mall Partner Templates')
@ApiSecurity('mcom-service-token')
@Controller('partner/templates')
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard, PartnerRateLimitGuard)
export class PartnerTemplatesController {
  constructor(
    private readonly templates: PartnerTemplatesService,
    private readonly flags: PartnerFeatureFlagsService,
  ) {}

  @Get('gift-cards')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'List a business’s gift-card templates' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'mcomUserId', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'includePlatform', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  listGiftCards(
    @Query() query: Record<string, string>,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.templates.list(
      'gift-cards',
      this.toQuery(query),
      this.isPlatform(req),
      this.callerBusinessId(req),
    );
  }

  @Get('vouchers')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'List a business’s voucher products' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'mcomUserId', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'includePlatform', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  listVouchers(
    @Query() query: Record<string, string>,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.templates.list(
      'vouchers',
      this.toQuery(query),
      this.isPlatform(req),
      this.callerBusinessId(req),
    );
  }

  @Get('coupons')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'List a business’s coupon templates' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'mcomUserId', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'includePlatform', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  listCoupons(
    @Query() query: Record<string, string>,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.templates.list(
      'coupons',
      this.toQuery(query),
      this.isPlatform(req),
      this.callerBusinessId(req),
    );
  }

  @Get(':kind/:id')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'Get one template' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'mcomUserId', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'includePlatform', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getOne(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Query() query: Record<string, string>,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.templates.getOne(
      kind as any,
      id,
      this.toQuery(query),
      this.isPlatform(req),
      this.callerBusinessId(req),
    );
  }

  private toQuery(query: Record<string, string>): TemplateQuery {
    return {
      businessId: query.businessId,
      mcomUserId: query.mcomUserId,
      email: query.email,
      includePlatform: query.includePlatform === 'true',
      includeInactive: query.includeInactive === 'true',
    };
  }

  private isPlatform(req: AuthenticatedServiceRequest): boolean {
    return this.flags.isPlatformCaller({
      callerAppId: req.serviceCaller?.callerAppId,
      payload: req.serviceCaller?.payload as any,
    });
  }

  private callerBusinessId(
    req: AuthenticatedServiceRequest,
  ): string | null | undefined {
    return (req.serviceCaller?.payload as any)?.businessId ?? null;
  }
}
