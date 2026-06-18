import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;
}
