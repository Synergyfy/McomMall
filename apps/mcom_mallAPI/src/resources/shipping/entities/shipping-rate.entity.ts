import { Column, Entity, Index } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('shipping_rates')
export class ShippingRate extends AbstractBaseEntity {
  @Index()
  @Column()
  carrierCode: string;

  @Column({ type: 'varchar', nullable: true })
  serviceCode: string | null;

  @Column({ type: 'float', default: 0 })
  minWeightKg: number;

  @Column({ type: 'float', default: 1000 })
  maxWeightKg: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  price: number;

  @Column({ default: true })
  isActive: boolean;
}
