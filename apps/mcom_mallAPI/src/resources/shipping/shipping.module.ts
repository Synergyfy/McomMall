import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { Order } from '../order/entities/order.entity';
import { Business } from '../listings/entities/listing.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { RoyalMailService } from './royal-mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Business]),
    EventEmitterModule.forRoot(),
    HttpModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService, RoyalMailService],
  exports: [ShippingService, RoyalMailService],
})
export class ShippingModule {}
