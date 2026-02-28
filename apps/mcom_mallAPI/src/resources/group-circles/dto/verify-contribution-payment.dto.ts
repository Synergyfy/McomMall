import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class VerifyContributionPaymentDto {
  @ApiProperty({
    description: 'The payment provider that was used.',
    example: 'STRIPE',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: 'The payment identifier from the provider.',
    example: 'pi_123abc_xyz',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'The amount contributed.',
    example: 50,
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
