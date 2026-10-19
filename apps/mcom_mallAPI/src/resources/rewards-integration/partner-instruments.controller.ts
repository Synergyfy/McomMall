import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ServiceAuthGuard } from '../service-mesh/guards/service-auth.guard';
import { ServiceScopesGuard } from '../service-mesh/guards/service-scopes.guard';
import { RequireServiceScopes } from '../service-mesh/decorators/require-service-scopes.decorator';
import { SERVICE_SCOPE_MALL_WRITE } from '../service-mesh/constants';
import { AuthenticatedServiceRequest } from '../service-mesh/interfaces/authenticated-service-request.interface';
import { GiftCardService } from '../gift-card/gift-card.service';
import { VoucherService } from '../voucher/voucher.service';
import { CouponService } from '../coupon/coupon.service';
import {
  CreateCouponInstrumentDto,
  CreateInstrumentDto,
} from './dto/create-instrument.dto';

/** Normalised instrument handle returned to the issuing partner. */
interface PartnerInstrumentResponse {
  type: 'voucher' | 'gift_card' | 'coupon';
  id: string;
  code: string;
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
@UseGuards(ServiceAuthGuard, ServiceScopesGuard)
export class PartnerInstrumentsController {
  private readonly logger = new Logger(PartnerInstrumentsController.name);

  constructor(
    private readonly giftCardService: GiftCardService,
    private readonly voucherService: VoucherService,
    private readonly couponService: CouponService,
  ) {}

  @Post('vouchers')
  @HttpCode(HttpStatus.CREATED)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Issue a voucher reward (partner-initiated)' })
  async createVoucher(
    @Body() dto: CreateInstrumentDto,
    @Req() req: AuthenticatedServiceRequest,
  ): Promise<PartnerInstrumentResponse> {
    this.logCaller('voucher', req);
    const voucher = await this.voucherService.createPartnerVoucher(dto);
    return { type: 'voucher', id: voucher.id, code: voucher.code };
  }

  @Post('gift-cards')
  @HttpCode(HttpStatus.CREATED)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Issue a gift-card reward (partner-initiated)' })
  async createGiftCard(
    @Body() dto: CreateInstrumentDto,
    @Req() req: AuthenticatedServiceRequest,
  ): Promise<PartnerInstrumentResponse> {
    this.logCaller('gift card', req);
    const giftCard = await this.giftCardService.createPartnerGiftCard(dto);
    return { type: 'gift_card', id: giftCard.id, code: giftCard.code };
  }

  @Post('coupons')
  @HttpCode(HttpStatus.CREATED)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Issue a coupon reward (partner-initiated)' })
  async createCoupon(
    @Body() dto: CreateCouponInstrumentDto,
    @Req() req: AuthenticatedServiceRequest,
  ): Promise<PartnerInstrumentResponse> {
    this.logCaller('coupon', req);
    const coupon = await this.couponService.createPartnerCoupon(dto);
    return { type: 'coupon', id: coupon.id, code: coupon.code };
  }

  private logCaller(kind: string, req: AuthenticatedServiceRequest): void {
    this.logger.log(
      `Issuing ${kind} for caller "${req.serviceCaller?.callerAppId ?? 'unknown'}"`,
    );
  }
}
