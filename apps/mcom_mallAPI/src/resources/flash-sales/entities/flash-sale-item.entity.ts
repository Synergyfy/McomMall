import { Column, Entity, Index } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { FlashSaleStatus } from '../flash-sale.enum';

@Entity('flash_sale_items')
export class FlashSaleItem extends AbstractBaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255 })
  category: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  price: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  discountedPrice: number;

  @Column({ type: 'int', default: 0 })
  itemsLeft: number;

  @Index()
  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({
    type: 'enum',
    enum: FlashSaleStatus,
    default: FlashSaleStatus.DRAFT,
  })
  status: FlashSaleStatus;

  @Column({ nullable: true })
  businessId?: string;

  @Column({ nullable: true })
  productId?: string;
}
