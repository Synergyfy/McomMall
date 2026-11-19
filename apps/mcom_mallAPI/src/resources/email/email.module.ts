import { Logger, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const user = configService.get<string>('EMAIL_USER');
        const pass = configService.get<string>('EMAIL_PASSWORD');
        const from =
          configService.get<string>('EMAIL_FROM') ||
          (user ? `"McomMall" <${user}>` : '"No Reply" <noreply@example.com>');

        // Without credentials nodemailer fails every send with
        // `Missing credentials for "PLAIN"`. Fall back to the JSON transport so
        // local/dev environments log emails instead of breaking the request that
        // triggered them.
        if (!user || !pass) {
          new Logger('EmailModule').warn(
            'EMAIL_USER / EMAIL_PASSWORD are not configured — emails will be logged instead of sent.',
          );
          return {
            transport: { jsonTransport: true },
            defaults: { from },
          };
        }

        return {
          transport: {
            host: configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com',
            port: Number(configService.get<string>('EMAIL_PORT')) || 465,
            secure: configService.get<string>('EMAIL_SECURE') !== 'false',
            auth: { user, pass },
          },
          defaults: { from },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
