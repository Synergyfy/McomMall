import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkMerchantDto {
  @ApiProperty()
  @IsUUID()
  merchantId: string;
}
