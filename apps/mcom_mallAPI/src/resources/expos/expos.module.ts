import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expo } from './entities/expo.entity';
import { ExposService } from './expos.service';
import { ExposController } from './expos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Expo])],
  controllers: [ExposController],
  providers: [ExposService],
  exports: [ExposService],
})
export class ExposModule {}
