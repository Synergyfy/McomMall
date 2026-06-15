import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { google, Auth } from 'googleapis';

@Injectable()
export class GoogleOAuthService {
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    console.log(
      'GOOGLE_CLIENT_ID:',
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
    console.log(
      'GOOGLE_CLIENT_SECRET:',
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
    console.log(
      'GOOGLE_REDIRECT_URI:',
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  private makeClient() {
    return new google.auth.OAuth2(
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

  async getClientFromCode(code: string): Promise<Auth.OAuth2Client> {
    const client = this.makeClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    return client;
  }
}
