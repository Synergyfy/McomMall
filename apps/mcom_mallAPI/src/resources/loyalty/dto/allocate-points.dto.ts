import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AllocatePointsDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsInt()
  @Min(1)
  points: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
