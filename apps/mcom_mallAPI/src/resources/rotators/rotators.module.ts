import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RotatorsService } from './rotators.service';
import { RotatorsController } from './rotators.controller';
import { Rotator } from './entities/rotator.entity';
import { Business } from '../listings/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rotator, Business])],
  controllers: [RotatorsController],
  providers: [RotatorsService],
  exports: [RotatorsService],
})
export class RotatorsModule {}
