import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateExchangeProposalDto {
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the item you want to acquire.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  requestedItemId: string;

  @IsUUID()
  @ApiProperty({
    description: 'The ID of your item that you are offering in exchange.',
    example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210',
  })
  offeredItemId: string;
}
