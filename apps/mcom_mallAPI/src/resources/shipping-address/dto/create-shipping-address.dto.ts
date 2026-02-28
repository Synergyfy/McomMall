import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShippingAddressDto {
  @ApiProperty({ example: 'Home', description: 'Custom name for the address' })
  @IsString()
  @IsNotEmpty()
  addressName: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the recipient' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Contact number for shipping',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St', description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({
    example: 'Apt 4B',
    description: 'Apartment, suite, etc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'New York', description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'NY', description: 'State/Province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'USA', description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    example: '10001',
    description: 'Postal/Zip code',
    required: false,
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({
    example: false,
    description: 'Set as main shipping address',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isMain?: boolean;
}
