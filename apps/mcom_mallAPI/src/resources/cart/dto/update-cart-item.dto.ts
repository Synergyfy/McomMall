import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(0)
  quantity: number;
}
