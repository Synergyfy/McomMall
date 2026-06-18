import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';
import { BoroughCampaign } from './borough-campaign.entity';

@Entity('borough_participations')
export class BoroughParticipation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  campaignId: string;

  @ManyToOne(() => BoroughCampaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaignId' })
  campaign: BoroughCampaign;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @CreateDateColumn()
  joinedAt: Date;
}
