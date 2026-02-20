import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePartnershipRequestDto {
  @ApiProperty({
    description: 'The ID of the product to be partnered.',
    example: 'clq0x0q0m0000g0qjqy3q9q9q',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'The ID of the service to be partnered.',
    example: 'clq0x0q0m0000g0qjqy3q9q9r',
  })
  @IsString()
  serviceId: string;
}