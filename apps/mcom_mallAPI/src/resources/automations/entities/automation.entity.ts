import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';

export enum TriggerType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  BOROUGH = 'borough',
}

@Entity('automations')
export class Automation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TriggerType,
    default: TriggerType.WEEKLY,
  })
  triggerType: TriggerType;

  @Column({ type: 'int', default: 5 })
  targetRadius: number; // radius in miles

  @Column({ type: 'jsonb', default: [] })
  customerTiers: string[]; // e.g., ["Loyal", "New", "Inactive"]

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  flowConfig: any; // visual flowchart layout steps

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
