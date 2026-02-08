import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartnershipDto {
  @ApiProperty({
    description: 'The ID of the service provider to partner with.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  providerId: string;
}