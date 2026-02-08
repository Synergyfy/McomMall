import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

@Entity('price_modifiers')
export class PriceModifier extends AbstractBaseEntity {
  @ManyToOne(() => Business)
  business: Business;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'float' })
  priceMultiplier: number;

  @Column({ default: false })
  isAllDay: boolean;
}
