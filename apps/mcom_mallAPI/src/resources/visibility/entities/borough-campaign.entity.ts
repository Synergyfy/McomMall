import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Borough } from '../../boroughs/entities/borough.entity';

@Entity('borough_campaigns')
export class BoroughCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  targetAudience: string;

  @Column({ type: 'int', default: 0 })
  reach: number;

  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'int', default: 30 })
  daysLeft: number;

  @Column({ type: 'int', default: 0 })
  merchantCount: number;

  @Column({ type: 'int', default: 0 })
  progress: number; // percentage progress towards goal

  @Column({ nullable: true })
  bannerUrl?: string;

  @Column({ type: 'uuid', nullable: true })
  boroughId?: string | null;

  @ManyToOne(() => Borough, (borough) => borough.campaigns, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'boroughId' })
  borough?: Borough | null;

  @CreateDateColumn()
  createdAt: Date;
}
