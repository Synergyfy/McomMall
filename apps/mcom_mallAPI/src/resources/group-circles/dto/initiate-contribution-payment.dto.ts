import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class InitiateContributionPaymentDto {
  @ApiProperty({
    description: 'The payment provider to use for the contribution.',
    example: 'STRIPE',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: 'The amount to contribute.',
    example: 50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'The member ID.',
    example: 'uuid',
  })
  @IsString()
  @IsOptional()
  memberId?: string;

  @ApiProperty({
    description: 'The round number.',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  round?: number;
}
