import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { Business } from '../listings/entities/listing.entity';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Verification, Business])],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
