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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { VoucherService } from './voucher.service';
import { CreateVoucherProductDto } from './dto/create-voucher-product.dto';
import { UpdateVoucherProductDto } from './dto/update-voucher-product.dto';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { VoucherProduct } from './entities/voucher-product.entity';
import { Voucher } from './entities/voucher.entity';

@ApiTags('Voucher Business')
@ApiBearerAuth()
@Controller('business/vouchers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class VoucherBusinessController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('products')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new voucher product (Business Owner)' })
  @ApiResponse({
    status: 201,
    description: 'Voucher product created successfully.',
    type: VoucherProduct,
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing voucher product (Business Owner)',
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher product updated successfully.',
    type: VoucherProduct,
  })
  async updateVoucherProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVoucherProductDto: UpdateVoucherProductDto,
  ) {
    return this.voucherService.updateVoucherProduct(
      id,
      updateVoucherProductDto,
    );
  }

  @Get('products')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all voucher products for the current business owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all voucher products.',
    type: [VoucherProduct],
  })
  async getMyVoucherProducts(@Req() req: Request) {
    const userId = req.user.id;
    return this.voucherService.findVoucherProductsForUser(userId);
  }

  @Get('sold')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all vouchers sold by the business' })
  @ApiResponse({
    status: 200,
    description: 'Return all sold vouchers.',
    type: [Voucher],
  })
  async getSoldVouchers(@Req() req: Request) {
    const businessId = req.user.businessId;
    return this.voucherService.findVouchersSoldByBusiness(businessId);
  }

  @Post('redeem/manual')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Manually mark a voucher as redeemed (Business Owner/Staff)',
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher marked as redeemed successfully.',
    type: Voucher,
  })
  async manuallyRedeemVoucher(
    @Req() req: Request,
    @Body() redeemDto: RedeemVoucherDto,
  ) {
    const staffId = req.user.id;
    return this.voucherService.manuallyMarkAsRedeemed(redeemDto.code, staffId);
  }
}
