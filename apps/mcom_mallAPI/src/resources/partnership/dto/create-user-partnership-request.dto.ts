import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateUserPartnershipRequestDto {
  @ApiProperty({ example: 'uuid', description: 'The ID of the user to partner with' })
  @IsUUID()
  targetUserId: string;

  @ApiProperty({ example: 'Hello, I would like to partner with you.', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
