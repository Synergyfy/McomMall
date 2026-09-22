import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoroughDto {
  @ApiPropertyOptional({ example: 'Camden', description: 'Unique borough name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'High', description: 'Population activity level' })
  @IsString()
  @IsOptional()
  activityLevel?: string;

  @ApiPropertyOptional({ example: 'Sarah Chen', description: 'Assigned borough manager' })
  @IsString()
  @IsOptional()
  managerName?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the borough is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
