import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemDigitalValueDto {
  @ApiProperty({
    example: 25.50,
    description: 'The amount to redeem/spend from the instrument.',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The UUID of the merchant where the redemption is taking place. Used for validation if the instrument is merchant-locked.'
  })
  @IsUUID()
  merchantId: string;
}
