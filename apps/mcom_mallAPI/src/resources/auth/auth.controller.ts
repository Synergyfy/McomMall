import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, RefreshAuthDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { ResetPasswordDto } from '../email/dto/reset-password.dto';
import { OtpType } from '../email/entities/otp.entity';
import { ErrorFactory } from '../../common/errors/error.factory';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from '../../common/role.enum';

import { ActivityTimerService } from '../activity-timer/activity-timer.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly activityTimerService: ActivityTimerService,
  ) { }

  @ApiOperation({ summary: 'Authenticate as user' })
  @ApiResponse({
    status: 201,
    description: 'User authenticated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  @Public()
  @Post('')
  async create(@Body() createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const user = await this.userService.findCurrentUser(email);

    if (!user) throw ErrorFactory.invalidCredentials();

    const validPassword = await this.authService.comparePassword(
      password,
      email,
    );
    if (!validPassword) throw ErrorFactory.invalidCredentials();

    const { id, role, firstName, lastName, trial } = user;
    const name = `${firstName} ${lastName}`;

    const auth = await this.authService.createLogin({
      sub: id,
      role,
      email,
      name,
      userId: id,
    });

    await this.userService.updateLastLogin(id);

    const activeTimers = await this.activityTimerService.getUserActiveTimer(user);

    return { auth, name, role, packageInfo: trial, userId: id, tasks: activeTimers };
  }

  @ApiOperation({ summary: 'Login via SSO' })
  @ApiResponse({
    status: 201,
    description: 'User authenticated successfully via SSO.',
  })
  @ApiResponse({ status: 400, description: 'Invalid SSO token.' })
  @Public()
  @Post('sso')
  async ssoLogin(@Body('token') token: string) {
    try {
      const authData = await this.authService.loginWithSso(token);
      const user = await this.userService.findCurrentUser(authData.email);
      await this.userService.updateLastLogin(user.id);

      const activeTimers = await this.activityTimerService.getUserActiveTimer(user);

      return {
        auth: {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        },
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        packageInfo: user.trial,
        userId: user.id,
        tasks: activeTimers,
      };
    } catch (error) {
      throw ErrorFactory.invalidCredentials();
    }
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid refresh token.' })
  @Public()
  @Post('refresh')
  async refreshToken(@Body() payload: RefreshAuthDto) {
    try {
      const result = await this.authService.refreshAccessToken(payload.refreshToken);
      await this.userService.updateLastLogin(result.userId);
      return result;
    } catch (error) {
      throw ErrorFactory.invalidCredentials();
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.emailService.sendOtp({ email, type: OtpType.PASSWORD_RESET });
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.emailService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('send-verification-otp')
  async sendVerificationOtp(@Body('email') email: string) {
    return this.emailService.sendOtp({ email, type: OtpType.VERIFICATION });
  }

  @Public()
  @Post('verify-verification-otp')
  async verifyVerificationOtp(@Body() body: { email: string; otp: string }) {
    return this.emailService.validateOtp({
      email: body.email,
      otp: body.otp,
      type: OtpType.VERIFICATION,
    });
  }
}
