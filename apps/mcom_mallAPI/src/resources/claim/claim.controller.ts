import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GoogleOAuthService } from './google-oauth.service';
import { BusinessVerificationService } from './business-verification.service';
import { Public } from '../../common/decorators/public.decorator';

type StartClaimBody = {
  placeId: string;
  returnUrl?: string; // optional override for where to send user back on success/fail
};

@Public()
@Controller('claim')
export class ClaimController {
  constructor(
    private readonly googleOAuth: GoogleOAuthService,
    private readonly verifier: BusinessVerificationService,
  ) {}

  @Post('start')
  start(@Body() body: StartClaimBody) {
    // Pack the placeId and returnUrl into OAuth state
    const stateObj = {
      placeId: body.placeId,
      returnUrl:
        body.returnUrl ||
        `${process.env.NEXT_PUBLIC_APP_BASE}/business/${body.placeId}`,
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
    const authUrl = this.googleOAuth.getAuthUrl(state);
    return { authUrl };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const { placeId, returnUrl } = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf8'),
    );

    const client = await this.googleOAuth.getClientFromCode(code);
    const result = await this.verifier.verifyPlaceOwnership(client, placeId);

    const redirectOk = new URL(
      `${returnUrl}?claim=success&placeId=${encodeURIComponent(placeId)}`,
    );
    const redirectFail = new URL(
      `${returnUrl}?claim=failed&placeId=${encodeURIComponent(placeId)}`,
    );

    if (result.ok) {
      // Here you would mark the claim VERIFIED in your DB for the current user + placeId
      // await claimsService.markVerified(userId, placeId, result.evidence);
      return res.redirect(redirectOk.toString());
    } else {
      // await claimsService.markRejected(userId, placeId);
      return res.redirect(redirectFail.toString());
    }
  }
}
