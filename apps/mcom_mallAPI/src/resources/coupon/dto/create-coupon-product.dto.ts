import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateCouponProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  fixedAmounts: number[];

  @IsBoolean()
  @IsOptional()
  allowCustomAmount: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minCustomAmount: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxCustomAmount: number;

  @IsBoolean()
  @IsOptional()
  isEnabled: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expiryDays: number;

  @IsString()
  @IsOptional()
  backgroundImage: string;

  @IsString()
  @IsOptional()
  textColor: string;

  @IsBoolean()
  @IsOptional()
  allowReloading: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  bonusThreshold: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  bonusAmount: number;
}