import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoroughDto {
  @ApiProperty({ example: 'Camden', description: 'Unique borough name' })
  @IsString()
  @IsNotEmpty()
  name: string;

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
