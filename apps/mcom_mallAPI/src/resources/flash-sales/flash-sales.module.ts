import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSalesService } from './flash-sales.service';
import { FlashSalesController } from './flash-sales.controller';
import { FlashSaleItem } from './entities/flash-sale-item.entity';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSaleItem, Business, Product])],
  controllers: [FlashSalesController],
  providers: [FlashSalesService],
  exports: [FlashSalesService],
})
export class FlashSalesModule {}
