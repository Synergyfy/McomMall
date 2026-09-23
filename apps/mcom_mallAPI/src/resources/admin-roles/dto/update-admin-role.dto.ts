import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdminRoleDto {
  @ApiPropertyOptional({ example: 'Moderator' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['listings.review'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AssignAdminRoleDto {
  @ApiPropertyOptional({ description: 'User UUID to assign (null to unassign)' })
  @IsUUID()
  @IsOptional()
  userId?: string | null;
}
