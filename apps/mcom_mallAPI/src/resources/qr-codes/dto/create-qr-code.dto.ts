import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { QrType } from '../entities/qr-code.entity';

export class CreateQrCodeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(QrType)
  @IsNotEmpty()
  qrType: QrType;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsUUID()
  @IsNotEmpty()
  businessId: string;
}
