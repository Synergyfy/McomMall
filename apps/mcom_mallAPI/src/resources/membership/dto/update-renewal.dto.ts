import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateRenewalDto {
  @ApiProperty({
    example: true,
    description:
      'Enable or disable automatic renewal from the MCOM Wallet at each period end.',
  })
  @IsBoolean()
  autoRenew: boolean;
}
