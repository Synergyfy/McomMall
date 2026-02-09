import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { VoucherService } from './voucher.service';
import { CreateVoucherProductDto } from './dto/create-voucher-product.dto';
import { UpdateVoucherProductDto } from './dto/update-voucher-product.dto';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';

@Controller('business/vouchers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class VoucherBusinessController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('products')
  async createVoucherProduct(
    @Req() req: Request,
    @Body() createVoucherProductDto: CreateVoucherProductDto,
  ) {
    const userId = req.user.id;
    return this.voucherService.createVoucherProduct(
      userId,
      createVoucherProductDto,
    );
  }

  @Patch('products/:id')
  async updateVoucherProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVoucherProductDto: UpdateVoucherProductDto,
  ) {
    return this.voucherService.updateVoucherProduct(id, updateVoucherProductDto);
  }

  @Get('products')
  async getMyVoucherProducts(@Req() req: Request) {
    const userId = req.user.id;
    return this.voucherService.findVoucherProductsForUser(userId);
  }

  @Get('sold')
  async getSoldVouchers(@Req() req: Request) {
    const businessId = req.user.businessId;
    return this.voucherService.findVouchersSoldByBusiness(businessId);
  }

  @Post('redeem/manual')
  async manuallyRedeemVoucher(
    @Req() req: Request,
    @Body() redeemDto: RedeemVoucherDto,
  ) {
    const staffId = req.user.id;
    return this.voucherService.manuallyMarkAsRedeemed(redeemDto.code, staffId);
  }
}