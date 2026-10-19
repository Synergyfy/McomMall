import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleOAuthService {
  constructor(private readonly configService: ConfigService) {}

  private makeClient() {
    return new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  getAuthUrl(state: string) {
    const client = this.makeClient();
    return client.generateAuthUrl({
      access_type: 'online',
      scope: ['https://www.googleapis.com/auth/business.manage'],
      state,
      prompt: 'select_account consent',
    });
  }

  async getClientFromCode(code: string): Promise<any> {
    const client = this.makeClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    return client;
  }
}
