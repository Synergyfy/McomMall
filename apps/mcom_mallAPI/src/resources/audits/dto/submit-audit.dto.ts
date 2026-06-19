import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';
import { AuditType } from '../enums/audit-type.enum';

export class SubmitAuditDto {
  @ApiProperty({ enum: AuditType })
  @IsEnum(AuditType)
  @IsNotEmpty()
  type: AuditType;

  @ApiProperty({ example: { campaignFrequency: 'rarely', profileComplete: 'yes' } })
  @IsObject()
  @IsNotEmpty()
  responses: Record<string, any>;

  @ApiProperty({ example: '320e8d0e-26f5-46cb-8ff7-bc34903bfe0c', required: false })
  @IsUUID()
  @IsOptional()
  businessId?: string;
}
