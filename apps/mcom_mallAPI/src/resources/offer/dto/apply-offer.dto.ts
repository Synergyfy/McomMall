import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ApplyOfferDto {
  @IsNotEmpty()
  @IsUUID()
  offerId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  productIds: string[];
}
