import { Column, Entity, ManyToOne } from 'typeorm';
import { DayOfWeek } from '../listing.enum';
import { Business } from './listing.entity';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('business_hours')
export class BusinessHour extends AbstractBaseEntity {
  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @Column('time')
  openTime: string;

  @Column('time')
  closeTime: string;

  @Column({ default: false })
  is24h: boolean;

  @ManyToOne(() => Business, (business) => business.businessHours)
  business: Business;
}
