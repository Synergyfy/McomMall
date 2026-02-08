import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class SocialDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  @MinLength(0)
  twitter?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MinLength(0)
  facebook?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MinLength(0)
  instagram?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MinLength(0)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MinLength(0)
  youtube?: string;
}
