import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { AdminGamificationController } from './admin-gamification.controller';
import { Gamification } from './entities/gamification.entity';
import { Business } from '../listings/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gamification, Business])],
  controllers: [GamificationController, AdminGamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
