import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SystemAuthGuard } from '../voucher/system-voucher.controller'; // Reuse the guard
import { IpWhitelistGuard } from '../../common/middleware/ip-whitelist.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('System Integration')
@Public()
@Controller('system/gift-cards')
@UseGuards(SystemAuthGuard, IpWhitelistGuard)
export class SystemGiftCardController {
  constructor(private readonly giftCardService: GiftCardService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create a gift card from external system (Loyalty API)',
  })
  async createGiftCard(
    @Body()
    payload: {
      amount: number;
      recipientEmail: string;
      recipientName?: string;
      message?: string;
      businessName: string;
    },
  ) {
    return this.giftCardService.createSystemGiftCard(payload);
  }
}
