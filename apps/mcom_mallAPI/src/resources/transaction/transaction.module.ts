import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PointTransaction } from './entities/point-transaction.entity';
import { PointsService } from './points.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, PointTransaction])],
  controllers: [TransactionController],
  providers: [TransactionService, PointsService],
  exports: [TransactionService, PointsService, TypeOrmModule],
})
export class TransactionModule {}
