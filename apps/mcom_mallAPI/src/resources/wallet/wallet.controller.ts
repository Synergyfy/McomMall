import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { InitiateFundingDto } from './dto/initiate-funding.dto';
import { VerifyFundingDto } from './dto/verify-funding.dto';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { Withdrawal } from './entities/withdrawal.entity';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user wallet details' })
  @ApiResponse({ status: 200, description: 'Wallet details retrieved' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  async getWallet(@Req() request: Request) {
    const userId = request.user.id;
    return this.walletService.getWalletDetails(userId);
  }

  @Post('fund/initiate')
  @ApiOperation({ summary: 'Initiate a wallet funding via Stripe or PayPal' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  @ApiBadRequestResponse({ description: 'Invalid payment provider or amount' })
  async initiateWalletFunding(
    @Req() request: Request,
    @Body() initiateFundingDto: InitiateFundingDto,
  ) {
    const userId = request.user.id;
    return this.walletService.initiateWalletFunding(initiateFundingDto, userId);
  }

  @Post('fund/verify')
  @ApiOperation({ summary: 'Verify and complete wallet funding' })
  @ApiResponse({ status: 201, description: 'Wallet funded successfully' })
  @ApiBadRequestResponse({ description: 'Payment verification failed' })
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

  @Post('withdraw/request')
  @ApiOperation({ summary: 'Request a withdrawal from the wallet balance' })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal requested successfully',
    type: Withdrawal,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payload or insufficient balance',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error' })
  requestWithdrawal(
    @Req() request: Request,
    @Body() dto: RequestWithdrawalDto,
  ) {
    const userId = request.user.id;
    return this.walletService.requestWithdrawal(dto, userId);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get the current user withdrawal history' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal history retrieved successfully',
    type: [Withdrawal],
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getWithdrawalHistory(@Req() request: Request) {
    const userId = request.user.id;
    return this.walletService.getWithdrawalHistory(userId);
  }
}
