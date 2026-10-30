import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PartnerInstrumentStatusService } from '../partner-instruments/partner-instrument-status.service';

/**
 * Storefront-facing reward validation used by the deep link
 * `/listings/:id?reward=<code>`.
 *
 * Deliberately unauthenticated: the code is already present in the URL and
 * no PII / issuance id is returned. Ownership is enforced when the code is
 * actually consumed at checkout.
 */
@ApiTags('Public Rewards')
@Controller('public/rewards')
@Public()
export class PublicRewardsController {
  constructor(private readonly status: PartnerInstrumentStatusService) {}

  @Get('instruments/:code')
  @ApiOperation({ summary: 'Validate a reward code for a listing (no consumption)' })
  @ApiQuery({ name: 'listingId', required: false })
  @ApiQuery({ name: 'businessId', required: false })
  resolve(
    @Param('code') code: string,
    @Query('listingId') listingId?: string,
    @Query('businessId') businessId?: string,
  ) {
    return this.status.resolvePublicReward(
      code,
      listingId ?? businessId,
    );
  }
}
