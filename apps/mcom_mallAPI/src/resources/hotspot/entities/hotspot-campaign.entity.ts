import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { Hotspot } from './hotspot.entity';

@Entity('hotspot_campaigns')
export class HotspotCampaign extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Index()
  business: Business;

  @OneToMany(() => Hotspot, (hotspot) => hotspot.campaign, {
    cascade: ['insert', 'update', 'remove'],
  })
  hotspots: Hotspot[];
}
