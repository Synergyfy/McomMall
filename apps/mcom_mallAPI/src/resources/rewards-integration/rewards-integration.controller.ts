import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RewardsIntegrationService } from './rewards-integration.service';
import { EligibleRewardsDto } from './dto/eligible-rewards.dto';

/**
 * Shopper-facing rewards surface for the mall. Surfaces reward issuances that
 * originated in MCOM Rewards alongside locally-held mall instruments
 * (gift cards, vouchers, saved coupons) and computes which rewards are
 * eligible for the current cart.
 */
@ApiTags('Rewards')
@ApiBearerAuth()
@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsIntegrationController {
  constructor(
    private readonly rewardsIntegration: RewardsIntegrationService,
  ) {}

  @Get('my')
  @ApiOperation({
    summary: 'My rewards wallet (MCOM Rewards issuances + local instruments)',
  })
  getMyRewards(@Req() req) {
    return this.rewardsIntegration.getMyRewards(req.user);
  }

  @Post('eligible')
  @ApiOperation({
    summary: 'Which rewards can discount which cart/booking lines',
  })
  getEligibleRewards(@Req() req, @Body() dto: EligibleRewardsDto) {
    return this.rewardsIntegration.getEligibleRewards(req.user.id, dto);
  }
}
