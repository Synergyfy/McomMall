import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCustomerSegmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsUUID()
  @IsNotEmpty()
  businessId: string;
}

export class UpdateCustomerSegmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
