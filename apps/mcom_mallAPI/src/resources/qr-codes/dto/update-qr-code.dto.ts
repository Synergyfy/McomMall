import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QrStatus } from '../entities/qr-code.entity';

export class UpdateQrCodeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(QrStatus)
  @IsOptional()
  status?: QrStatus;

  @IsString()
  @IsOptional()
  targetId?: string;
}
