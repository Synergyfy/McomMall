import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminalCashbackService } from './terminal-cashback.service';
import { TerminalCashbackController } from './terminal-cashback.controller';
import { TerminalCashbackClaim } from './entities/terminal-cashback-claim.entity';
import { TerminalConfig } from './entities/terminal-config.entity';
import { TerminalGlobalRule } from './entities/terminal-global-rule.entity';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TerminalCashbackClaim,
      TerminalConfig,
      TerminalGlobalRule,
    ]),
    WalletModule,
    PaymentsModule,
  ],
  controllers: [TerminalCashbackController],
  providers: [TerminalCashbackService],
  exports: [TerminalCashbackService],
})
export class TerminalCashbackModule {}
