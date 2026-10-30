import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ServiceAuthGuard } from '../service-mesh/guards/service-auth.guard';
import { ServiceScopesGuard } from '../service-mesh/guards/service-scopes.guard';
import { RequireServiceScopes } from '../service-mesh/decorators/require-service-scopes.decorator';
import {
  SERVICE_SCOPE_MALL_READ,
  SERVICE_SCOPE_MALL_WRITE,
} from '../service-mesh/constants';
import { AuthenticatedServiceRequest } from '../service-mesh/interfaces/authenticated-service-request.interface';
import { GiftCardService } from '../gift-card/gift-card.service';
import { VoucherService } from '../voucher/voucher.service';
import { CouponService } from '../coupon/coupon.service';
import { InstrumentScopeService } from '../partner-instruments/instrument-scope.service';
import { PartnerFeatureFlagsService } from '../partner-instruments/partner-feature-flags.service';
import { PartnerInstrumentStatusService } from '../partner-instruments/partner-instrument-status.service';
import { InstrumentType } from '../partner-instruments/enums';
import { PartnerRateLimitGuard } from '../partner-instruments/guards/partner-rate-limit.guard';
import { isReplayed } from '../partner-instruments/replay';
import {
  CreateCouponInstrumentDto,
  CreateInstrumentDto,
} from './dto/create-instrument.dto';

/** Normalised instrument handle returned to the issuing partner. */
interface PartnerInstrumentResponse {
  type: 'voucher' | 'gift_card' | 'coupon';
  id: string;
  code: string;
  issuanceId?: string | null;
  status?: string;
  scope?: any;
  balance?: number;
  currency?: string;
  expiresAt?: string | null;
}

/**
 * Spend-like instrument creation for ecosystem partners (e.g. MCOM Rewards
 * materialising a voucher/gift-card/coupon reward in mall).
 *
 * Auth: RS256 service token (audience = "mcom-mall"), scope `mall:write`,
 * verified offline via Central's JWKS. The caller identity is derived from the
 * token (`sub`/`act.sub`) — there is no shared API key or IP allowlist.
 */
@ApiTags('Mall Partner Instruments')
@ApiSecurity('mcom-service-token')
@Controller('partner/instruments')
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard, PartnerRateLimitGuard)
export class PartnerInstrumentsController {
  private readonly logger = new Logger(PartnerInstrumentsController.name);

  constructor(
    private readonly giftCardService: GiftCardService,
    private readonly voucherService: VoucherService,
    private readonly couponService: CouponService,
    private readonly scopeService: InstrumentScopeService,
    private readonly flags: PartnerFeatureFlagsService,
    private readonly statusService: PartnerInstrumentStatusService,
  ) {}

  @Post('vouchers')
  @HttpCode(HttpStatus.CREATED)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Issue a voucher reward (partner-initiated)' })
  async createVoucher(
    @Body() dto: CreateInstrumentDto,
    @Req() req: AuthenticatedServiceRequest,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<PartnerInstrumentResponse> {
    this.assertFeatureAccess(dto);
    this.logCaller('voucher', req);
    const voucher = await this.voucherService.createPartnerVoucher({
      ...dto,
      context: this.context(req),
    });
    res?.status(isReplayed(voucher) ? HttpStatus.OK : HttpStatus.CREATED);
    return this.decorate(
      'voucher',
      voucher,
      InstrumentType.VOUCHER,
      Number(voucher.balance),
      voucher.expiresAt ? new Date(voucher.expiresAt).toISOString() : null,
    );
  }

  @Post('gift-cards')
  @HttpCode(HttpStatus.CREATED)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Issue a gift-card reward (partner-initiated)' })
  async createGiftCard(
    @Body() dto: CreateInstrumentDto,
    @Req() req: AuthenticatedServiceRequest,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<PartnerInstrumentResponse> {
    this.assertFeatureAccess(dto);
    this.logCaller('gift card', req);
    const giftCard = await this.giftCardService.createPartnerGiftCard({
      ...dto,
      context: this.context(req),
    });
    res?.status(isReplayed(giftCard) ? HttpStatus.OK : HttpStatus.CREATED);
    return this.decorate(
      'gift_card',
      giftCard,
      InstrumentType.GIFT_CARD,
      Number(giftCard.currentBalance),
      giftCard.expiryDate ? new Date(giftCard.expiryDate).toISOString() : null,
      giftCard.currency,
    );
  }

  @Post('coupons')
  @HttpCode(HttpStatus.CREATED)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Issue a coupon reward (partner-initiated)' })
  async createCoupon(
    @Body() dto: CreateCouponInstrumentDto,
    @Req() req: AuthenticatedServiceRequest,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<PartnerInstrumentResponse> {
    this.assertFeatureAccess(dto);
    this.logCaller('coupon', req);
    const coupon = await this.couponService.createPartnerCoupon({
      ...dto,
      context: this.context(req),
    });
    res?.status(isReplayed(coupon) ? HttpStatus.OK : HttpStatus.CREATED);
    return this.decorate(
      'coupon',
      coupon,
      InstrumentType.COUPON,
      Number(coupon.discountValue),
      coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : null,
    );
  }

  @Get(':kind/:code')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({
    summary: 'Read instrument status, balance, expiry, scope, and issuance',
  })
  getInstrument(
    @Param('kind') kind: string,
    @Param('code') code: string,
  ) {
    return this.statusService.getStatus(kind, code);
  }

  @Post(':kind/:code/revoke')
  @HttpCode(HttpStatus.OK)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Revoke the unused balance of an instrument' })
  revokeInstrument(
    @Param('kind') kind: string,
    @Param('code') code: string,
    @Body() body: { note?: string } = {},
  ) {
    return this.statusService.revoke(kind, code, body?.note);
  }

  private async decorate(
    type: PartnerInstrumentResponse['type'],
    entity: any,
    instrumentType: InstrumentType,
    balance: number,
    expiresAt: string | null,
    currency = 'GBP',
  ): Promise<PartnerInstrumentResponse> {
    const scope = await this.scopeService.getScope(instrumentType, entity.id);
    return {
      type,
      id: entity.id,
      code: entity.code,
      issuanceId: entity.issuanceId ?? null,
      status:
        instrumentType === InstrumentType.GIFT_CARD
          ? entity.isActive === false
            ? 'revoked'
            : balance > 0
              ? 'active'
              : 'redeemed'
          : instrumentType === InstrumentType.VOUCHER
            ? entity.status
            : entity.status,
      scope: this.scopeService.toResponse(scope),
      balance: Math.round(balance * 100) / 100,
      currency,
      expiresAt,
    };
  }

  private assertFeatureAccess(dto: {
    templateId?: string;
    scope?: unknown;
    businessId?: string;
  }): void {
    if (!this.flags.isMeshEnabled()) {
      throw new ServiceUnavailableException(
        'FEATURE_DISABLED: MCOM Rewards integration is disabled.',
      );
    }
    if (dto.templateId && !this.flags.isTemplatesEnabled()) {
      throw new ServiceUnavailableException(
        'FEATURE_DISABLED: partner template-aware issuance is not enabled.',
      );
    }
    if (dto.scope && !this.flags.isScopedInstrumentsEnabled()) {
      throw new ServiceUnavailableException(
        'FEATURE_DISABLED: partner scoped instruments are not enabled.',
      );
    }
    if (dto.businessId && !this.flags.isScopedInstrumentsEnabled()) {
      throw new ServiceUnavailableException(
        'FEATURE_DISABLED: partner business-bound instruments are not enabled.',
      );
    }
  }

  private context(req: AuthenticatedServiceRequest): {
    callerAppId?: string;
    isPlatformCaller: boolean;
    businessId?: string | null;
    scopeEnabled: boolean;
  } {
    return {
      callerAppId: req.serviceCaller?.callerAppId,
      isPlatformCaller: this.flags.isPlatformCaller({
        callerAppId: req.serviceCaller?.callerAppId,
        payload: req.serviceCaller?.payload as any,
      }),
      businessId: (req.serviceCaller?.payload as any)?.businessId ?? null,
      scopeEnabled: this.flags.isScopedInstrumentsEnabled(),
    };
  }

  private logCaller(kind: string, req: AuthenticatedServiceRequest): void {
    this.logger.log(
      `Issuing ${kind} for caller "${req.serviceCaller?.callerAppId ?? 'unknown'}"`,
    );
  }
}
