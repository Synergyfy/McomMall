import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

@Entity('blocked_slots')
export class BlockedSlot extends AbstractBaseEntity {
  @ManyToOne(() => Business)
  business: Business;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ default: false })
  isAllDay: boolean;
}
