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

@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

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
