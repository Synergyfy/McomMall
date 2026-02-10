import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateUserPartnershipRequestDto {
  @ApiProperty({ example: 'uuid', description: 'The ID of the user to partner with' })
  @IsUUID()
  targetUserId: string;
}
