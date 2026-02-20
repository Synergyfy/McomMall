import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TierService } from './tier.service';
import { TierController } from './tier.controller';
import { Tier } from './entities/tier.entity';
import { SeasonsModule } from '../seasons/seasons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tier]),
    SeasonsModule,
  ],
  controllers: [TierController],
  providers: [TierService],
  exports: [TierService],
})
export class TierModule {}
