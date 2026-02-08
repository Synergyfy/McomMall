import { IsArray, IsUUID } from 'class-validator';

export class ApplicableOffersDto {
  @IsArray()
  @IsUUID('all', { each: true })
  productIds: string[];
}
