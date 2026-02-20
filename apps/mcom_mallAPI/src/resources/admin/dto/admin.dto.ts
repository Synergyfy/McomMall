import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'The name of the admin.',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the admin.',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The phone number of the admin.',
    example: '1234567890',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The password for the admin account.',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginAdminDto {
  @ApiProperty({
    description: 'The email of the admin.',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the admin account.',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
