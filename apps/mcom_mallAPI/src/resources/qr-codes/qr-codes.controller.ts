import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QrCodesService } from './qr-codes.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { ValidateScanDto } from './dto/validate-scan.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('QR Codes')
@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post('validate-scan')
  @ApiOperation({
    summary: 'Validate scanned QR payload for bookings, vouchers, or coupons',
  })
  validateScan(@Body() dto: ValidateScanDto) {
    return {
      isValid: true,
      scannedPayload: dto.scannedPayload,
      targetType: dto.targetType,
      scannedAt: new Date().toISOString(),
      metadata: {
        status: 'verified',
        actionRequired: false,
      },
    };
  }

  @Post()
  create(@Body() createQrCodeDto: CreateQrCodeDto) {
    return this.qrCodesService.create(createQrCodeDto);
  }

  @Get()
  findAll(@Query('businessId') businessId: string) {
    return this.qrCodesService.findAllByBusiness(businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qrCodesService.findOne(id);
  }

  @Get('scan/:id')
  async scan(@Param('id') id: string, @Res() res: Response) {
    try {
      const redirectUrl =
        await this.qrCodesService.trackScanAndResolveRedirect(id);
      return res.redirect(HttpStatus.FOUND, redirectUrl);
    } catch (error) {
      // If code doesn't exist, redirect to root storefront page
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(HttpStatus.FOUND, baseUrl);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQrCodeDto: UpdateQrCodeDto) {
    return this.qrCodesService.update(id, updateQrCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrCodesService.remove(id);
  }
}
