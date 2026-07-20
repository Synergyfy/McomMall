import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCode, QrStatus } from './entities/qr-code.entity';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';

@Injectable()
export class QrCodesService {
  constructor(
    @InjectRepository(QrCode)
    private readonly qrCodeRepository: Repository<QrCode>,
  ) {}

  async create(createQrCodeDto: CreateQrCodeDto): Promise<QrCode> {
    const qrCode = this.qrCodeRepository.create({
      ...createQrCodeDto,
      status: QrStatus.ACTIVE,
      scanCount: 0,
    });

    const saved = await this.qrCodeRepository.save(qrCode);

    // Set a placeholder shortUrl based on the saved ID
    saved.shortUrl = `/api/qr-codes/scan/${saved.id}`;
    return this.qrCodeRepository.save(saved);
  }

  async findAllByBusiness(businessId: string): Promise<QrCode[]> {
    return this.qrCodeRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<QrCode> {
    const qrCode = await this.qrCodeRepository.findOne({ where: { id } });
    if (!qrCode) {
      throw new NotFoundException(`QR Code with ID ${id} not found`);
    }
    return qrCode;
  }

  async update(id: string, updateQrCodeDto: UpdateQrCodeDto): Promise<QrCode> {
    const qrCode = await this.findOne(id);
    Object.assign(qrCode, updateQrCodeDto);
    return this.qrCodeRepository.save(qrCode);
  }

  async remove(id: string): Promise<void> {
    const qrCode = await this.findOne(id);
    await this.qrCodeRepository.remove(qrCode);
  }

  async trackScanAndResolveRedirect(id: string): Promise<string> {
    const qrCode = await this.findOne(id);

    // Increment scanCount
    qrCode.scanCount += 1;
    await this.qrCodeRepository.save(qrCode);

    // Resolve target URL in frontend
    // Business storefront target or sub resources
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    switch (qrCode.qrType) {
      case 'product':
        return `${baseUrl}/business/${qrCode.businessId}?product=${qrCode.targetId || ''}`;
      case 'event':
        return `${baseUrl}/business/${qrCode.businessId}/events/${qrCode.targetId || ''}`;
      case 'promo':
        return `${baseUrl}/business/${qrCode.businessId}/promotions/${qrCode.targetId || ''}`;
      case 'reward':
        return `${baseUrl}/business/${qrCode.businessId}/rewards`;
      case 'storefront':
      default:
        return `${baseUrl}/business/${qrCode.businessId}`;
    }
  }
}
