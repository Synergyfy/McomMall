import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { InitiateFundingDto } from './dto/initiate-funding.dto';
import { VerifyFundingDto } from './dto/verify-funding.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWallet(@Req() request: Request) {
    const userId = request.user.id;
    return this.walletService.getWalletDetails(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('fund/initiate')
  async initiateWalletFunding(
    @Req() request: Request,
    @Body() initiateFundingDto: InitiateFundingDto,
  ) {
    const userId = request.user.id;
    return this.walletService.initiateWalletFunding(initiateFundingDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('fund/verify')
  async verifyAndCompleteFunding(
    @Req() request: Request,
    @Body() verifyFundingDto: VerifyFundingDto,
  ) {
    const userId = request.user.id;
    return this.walletService.verifyAndCompleteFunding(
      verifyFundingDto,
      userId,
    );
  }
}
