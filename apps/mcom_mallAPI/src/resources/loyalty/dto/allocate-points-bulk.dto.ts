import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AllocatePointsBulkDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  customerIds: string[];

  @IsInt()
  @Min(1)
  points: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
