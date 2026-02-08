import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trial } from '../payments/entities/trial.entity';
import { TrialService } from './trial.service';
import { TrialController } from './trial.controller';
import { User } from '../users/entities/user.entity';
import { TrialGuard } from './trial.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Trial, User])],
  controllers: [TrialController],
  providers: [TrialService, TrialGuard],
  exports: [TrialService],
})
export class TrialModule {}
