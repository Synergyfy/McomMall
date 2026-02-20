import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkMerchantDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The UUID of the merchant to link this instrument to. Once linked, it can only be redeemed at this merchant.'
  })
  @IsUUID()
  merchantId: string;
}
