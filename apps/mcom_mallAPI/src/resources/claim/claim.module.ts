import { Module } from '@nestjs/common';
import { ClaimService } from './claim.service';
import { ClaimController } from './claim.controller';
import { GoogleOAuthService } from './google-oauth.service';
import { BusinessVerificationService } from './business-verification.service';

@Module({
  controllers: [ClaimController],
  providers: [ClaimService, GoogleOAuthService, BusinessVerificationService],
})
export class ClaimModule {}
