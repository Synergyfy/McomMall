import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../common/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the user',
  })
  @IsString()
  password: string;

  @ApiProperty({
    enum: UserRole,
    required: false,
    description: 'Role of the user',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;
}

export class RefreshAuthDto {
  @ApiProperty({
    example: '348njdfj309932038df3029302',
    description: 'Refresh token',
  })
  @IsString()
  refreshToken: string;
}

export class LogoutAuthDto {
  @ApiProperty({
    description: 'The access token to revoke',
  })
  @IsString()
  accessToken: string;
}
