import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HighStreet } from './entities/high-street.entity';
import { HighStreetsService } from './high-streets.service';
import { HighStreetsController } from './high-streets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HighStreet])],
  controllers: [HighStreetsController],
  providers: [HighStreetsService],
  exports: [HighStreetsService],
})
export class HighStreetsModule {}
