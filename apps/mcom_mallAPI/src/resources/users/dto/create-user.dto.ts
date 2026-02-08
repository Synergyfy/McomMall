import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of user ',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Karnel',
    description: 'Last name of user ',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '+2347033486488',
    description: 'Phone number of the user',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the user',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password confirmation',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirm_password: string;

  @ApiProperty({
    enum: UserRole,
    required: false,
    description: 'Role of the user',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    required: false,
    description: 'Code for pre-provisioned rewards (e.g. Extended Trial).',
  })
  @IsString()
  @IsOptional()
  provisionCode?: string;
}
