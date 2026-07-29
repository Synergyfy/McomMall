import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  Req,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { SsoService } from './sso.service';
import { McomCentralService } from './mcom-central.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { CallbackQueryDto } from './dto/callback-query.dto';
import { SsoCallbackDto } from './dto/sso-callback.dto';
import { SsoRefreshDto } from './dto/sso-refresh.dto';
import { SsoLogoutDto } from './dto/sso-logout.dto';

@ApiTags('sso')
@Controller('sso')
export class SsoController {
  private readonly logger = new Logger(SsoController.name);

  constructor(
    private readonly ssoService: SsoService,
    private readonly mcomCentralService: McomCentralService,
  ) {}

  @Public()
  @Get('authorize')
  @ApiOperation({ summary: 'Initiate SSO login flow' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to MCOM Solutions authorize URL',
  })
  initiateSso(
    @Query('state') redirectPath: string | undefined,
    @Res() res: Response,
  ) {
    const csrfState = this.ssoService.generateState();
    const authorizeUrl = this.ssoService.getAuthorizeUrl(csrfState);

    res.cookie('sso_state', csrfState, {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    if (redirectPath) {
      res.cookie('sso_redirect_path', redirectPath, {
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60 * 1000,
      });
    }

    res.redirect(authorizeUrl);
  }

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'OAuth callback from MCOM Solutions' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with tokens',
  })
  async handleCallback(
    @Query() query: CallbackQueryDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const cookieState = req.signedCookies?.sso_state;
      const redirectPath = req.signedCookies?.sso_redirect_path || '/dashboard';
      const result = await this.ssoService.handleCallback(
        query.code,
        query.state,
        cookieState,
      );

      res.clearCookie('sso_state');
      res.clearCookie('sso_redirect_path');

      const frontendUrl =
        process.env.MALL_FRONTEND_URL || 'http://localhost:3003';
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.userId,
        name: result.name,
        role: String(result.role),
        state: redirectPath,
      });

      res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'sso_callback_failed';
      this.logger.error('SSO Callback failed:', message);

      const frontendUrl =
        process.env.MALL_FRONTEND_URL || 'http://localhost:3003';

      if (error instanceof ForbiddenException) {
        res.redirect(
          `${frontendUrl}/signin?error=${encodeURIComponent('subscription_required')}`,
        );
        return;
      }

      res.redirect(
        `${frontendUrl}/signin?error=${encodeURIComponent('sso_authentication_failed')}`,
      );
    }
  }

  @Public()
  @Post('callback')
  @ApiOperation({
    summary: 'Exchange auth code for MCOM Mall tokens',
    description:
      'Receives an auth code from the frontend (after MCOM Solutions redirect), exchanges it with MCOM Solutions for user data, creates/updates local user via JIT provisioning, and returns MCOM Mall JWT tokens.',
  })
  @ApiResponse({ status: 201, description: 'Tokens returned successfully' })
  @ApiResponse({ status: 401, description: 'Token exchange failed' })
  async handleCodeCallback(@Body() dto: SsoCallbackDto) {
    try {
      this.logger.log(`SSO code callback: exchanging code for user (redirect_uri=${dto.redirect_uri})`);
      const result = await this.ssoService.handleCallbackFromCode(
        dto.code,
        dto.redirect_uri,
      );
      this.logger.log(`SSO code callback: success for user ${result.userId}`);
      return {
        auth: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        userId: result.userId,
        name: result.name,
        role: result.role,
        email: result.email,
        packageInfo: null,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'sso_callback_failed';
      this.logger.error(`SSO code callback failed: ${message}`, error instanceof Error ? error.stack : undefined);

      if (error instanceof ForbiddenException) {
        throw new ForbiddenException('subscription_required');
      }

      throw new BadRequestException(message);
    }
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh an SSO access token via MCOM Solutions' })
  @ApiResponse({ status: 200, description: 'New tokens returned' })
  @ApiResponse({ status: 401, description: 'Token refresh failed' })
  async refreshSsoToken(@Body() dto: SsoRefreshDto) {
    try {
      return await this.ssoService.refreshSsoToken(dto.refresh_token);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'sso_refresh_failed';
      this.logger.error('SSO token refresh failed:', message);
      throw new BadRequestException(message);
    }
  }

  @Public()
  @Get('userinfo')
  @ApiOperation({
    summary: 'Fetch user profile from MCOM Solutions',
    description:
      'Returns membership level, tier, status, and platform-specific packages.',
  })
  @ApiResponse({ status: 200, description: 'User info returned' })
  @ApiResponse({ status: 401, description: 'Failed to fetch user info' })
  async getUserInfo(@Query('access_token') accessToken: string) {
    if (!accessToken) {
      throw new BadRequestException('access_token query parameter is required');
    }
    return this.ssoService.getSsoUserInfo(accessToken);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Invalidate SSO session via MCOM Solutions' })
  @ApiResponse({ status: 200, description: 'SSO session invalidated' })
  async logoutSso(@Body() dto: SsoLogoutDto) {
    return this.ssoService.logoutSso(dto.access_token);
  }

  @Get('membership/:userId')
  @ApiOperation({ summary: 'Get user membership from MCOM Solutions' })
  @ApiResponse({ status: 200, description: 'Returns membership data' })
  @ApiResponse({ status: 400, description: 'Missing userId' })
  async getUserMembership(@Param('userId') userId: string) {
    const membership = await this.mcomCentralService.getUserMembership(userId);

    if (!membership) {
      throw new BadRequestException(
        'Could not retrieve membership data from MCOM Solutions',
      );
    }

    return {
      status: 'success',
      data: membership,
    };
  }
}
