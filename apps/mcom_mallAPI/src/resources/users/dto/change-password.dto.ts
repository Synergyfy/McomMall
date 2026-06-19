import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password of the logged-in user',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password for the user (minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Confirm the new password',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
