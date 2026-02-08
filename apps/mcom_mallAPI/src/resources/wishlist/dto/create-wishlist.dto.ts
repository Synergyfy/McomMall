import { IsUUID } from 'class-validator';

export class CreateWishlistDto {
  @IsUUID()
  productId: string;
}
