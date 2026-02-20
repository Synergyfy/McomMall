import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeItem } from './entities/exchange-item.entity';
import { ExchangeProposal } from './entities/exchange-proposal.entity';
import { ExchangeHistory } from './entities/exchange-history.entity';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { UsersModule } from '../users/users.module';
import { Escrow } from './entities/escrow.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExchangeItem,
      ExchangeProposal,
      ExchangeHistory,
      Escrow,
      Product,
      Service,
    ]),
    UsersModule,
  ],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}