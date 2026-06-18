import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateVisibilitySettingsDto {
  @IsInt()
  @IsOptional()
  radius?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hubs?: string[];

  @IsInt()
  @IsOptional()
  featuredDaysLeft?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  rotatorOrder?: string[];

  @IsBoolean()
  @IsOptional()
  highStreetMode?: boolean;
}
