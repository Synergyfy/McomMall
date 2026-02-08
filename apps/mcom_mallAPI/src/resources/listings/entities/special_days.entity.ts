import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Business } from './listing.entity';

@Entity('special_days')
export class SpecialDay extends AbstractBaseEntity {
  @Column('date')
  date: Date;

  @Column()
  description: string;

  @Column({ default: false })
  isOpen: boolean;

  @Column('time', { nullable: true })
  openTime?: string;

  @Column('time', { nullable: true })
  closeTime?: string;

  @ManyToOne(() => Business, (business) => business.specialDays)
  business: Business;
}
