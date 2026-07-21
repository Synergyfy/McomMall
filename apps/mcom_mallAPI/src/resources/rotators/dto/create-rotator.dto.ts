import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreateRotatorDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  rotatorType: string;

  @IsInt()
  @IsOptional()
  rotationSpeed?: number;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  visibility?: string;

  @IsString()
  @IsOptional()
  boroughTarget?: string;

  @IsString()
  @IsOptional()
  storefrontTarget?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contentIds?: string[];

  @IsString()
  @IsOptional()
  status?: string;
}
