import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  Validate,
} from 'class-validator';
import { MatchPassword } from '../validators/match-password.validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Validate(MatchPassword, ['password'])
  confirmPassword: string;
}
