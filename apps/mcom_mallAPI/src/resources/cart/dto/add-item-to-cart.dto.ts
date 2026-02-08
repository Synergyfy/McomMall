import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddItemToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  selectedVariants?: Record<string, string>;

  @IsInt()
  @Min(1)
  quantity: number;
}
