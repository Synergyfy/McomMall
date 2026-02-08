import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InitiateVoucherPurchaseDto } from './dto/initiate-voucher-purchase.dto';
import { VerifyVoucherPurchaseDto } from './dto/verify-voucher-purchase.dto';
import { InitiateReloadDto } from './dto/initiate-reload.dto';
import { VerifyReloadDto } from './dto/verify-reload.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';
import { VoucherProductSearchDto } from './dto/voucher-product-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { VoucherProduct } from './entities/voucher-product.entity';
import { Query } from '@nestjs/common';

@Controller('vouchers')
export class VoucherConsumerController {
  constructor(private readonly voucherService: VoucherService) { }

  @Public()
  @Get('products/business/:businessId')
  findActiveVoucherProductsByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.voucherService.findActiveVoucherProductsByBusiness(businessId);
  }

  @Public()
  @Get('products/public')
  findAllPublicVoucherProducts(@Query() searchDto: VoucherProductSearchDto): Promise<PageDto<VoucherProduct>> {
    return this.voucherService.findAllPublicVoucherProducts(searchDto);
  }

  @Get('my-vouchers')
  @UseGuards(JwtAuthGuard)
  async getMyVouchers(@CurrentUser() user: User) {
    return this.voucherService.findUserVouchers(user.id);
  }

  @Post('initiate-purchase')
  @UseGuards(JwtAuthGuard)
  async initiatePurchase(
    @Body() initiateDto: InitiateVoucherPurchaseDto,
  ) {
    return this.voucherService.initiateVoucherPurchase(initiateDto);
  }

  @Post('verify-purchase')
  @UseGuards(JwtAuthGuard)
  async verifyPurchase(
    @CurrentUser() user: User,
    @Body() verifyDto: VerifyVoucherPurchaseDto,
  ) {
    return this.voucherService.verifyAndCompletePurchase(verifyDto, user.id);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  async redeemVoucher(@Body() redeemVoucherDto: RedeemVoucherDto) {
    // In a real-world scenario, you might get the staffId from the authenticated user
    // if a staff member is redeeming on behalf of a customer.
    return this.voucherService.redeemVoucher(redeemVoucherDto);
  }

  @Post(':code/initiate-reload')
  @UseGuards(JwtAuthGuard)
  async initiateReload(
    @Param('code') code: string,
    @Body() initiateDto: InitiateReloadDto,
  ) {
    return this.voucherService.initiateVoucherReload(
      code,
      initiateDto,
    );
  }

  @Post(':code/verify-reload')
  @UseGuards(JwtAuthGuard)
  async verifyReload(
    @CurrentUser() user: User,
    @Param('code') code: string,
    @Body() verifyDto: VerifyReloadDto,
  ) {
    return this.voucherService.verifyAndCompleteReload(
      code,
      verifyDto,
      user.id,
    );
  }

  @Get(':code')
  @UseGuards(JwtAuthGuard)
  async getVoucherDetails(@Param('code') code: string) {
    return this.voucherService.findVoucherByCode(code);
  }
}