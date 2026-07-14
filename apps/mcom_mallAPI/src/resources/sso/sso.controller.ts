import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SsoService } from './sso.service';
import { McomCentralService } from './mcom-central.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CallbackQueryDto } from './dto/callback-query.dto';

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
    description: 'Redirects to MCOM Central authorize URL',
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
  @ApiOperation({ summary: 'OAuth callback from MCOM Central' })
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

      res.redirect(`${frontendUrl}/auth/sso?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'sso_callback_failed';
      this.logger.error('SSO Callback failed:', message);
      const frontendUrl =
        process.env.MALL_FRONTEND_URL || 'http://localhost:3003';
      res.redirect(
        `${frontendUrl}/signin?error=${encodeURIComponent('sso_authentication_failed')}`,
      );
    }
  }

  @Get('membership/:userId')
  @ApiOperation({ summary: 'Get user membership from MCOM Central' })
  @ApiResponse({ status: 200, description: 'Returns membership data' })
  @ApiResponse({ status: 400, description: 'Missing userId' })
  async getUserMembership(@Param('userId') userId: string) {
    const membership = await this.mcomCentralService.getUserMembership(userId);

    if (!membership) {
      throw new BadRequestException(
        'Could not retrieve membership data from MCOM Central',
      );
    }

    return {
      status: 'success',
      data: membership,
    };
  }
}
