import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClaimDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsString()
  @IsOptional()
  businessLicenseUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
