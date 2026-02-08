import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { Otp } from './entities/otp.entity';
import { User } from '../users/entities/user.entity';
import { HashService } from '../../common/hash/hash.service';
import { HashModule } from '../../common/hash/hash.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp, User]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          secure: true,
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
      }),
      inject: [ConfigService],
    }),
    HashModule,
  ],
  controllers: [EmailController],
  providers: [EmailService, HashService],
  exports: [EmailService],
})
export class EmailModule {}
