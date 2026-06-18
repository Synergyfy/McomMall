import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';

@Entity('interest_signals')
export class InterestSignal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  signalType: string; // e.g. "sourdough", "workshops", "organic_food"

  @Column({ nullable: true })
  voterIp?: string;

  @CreateDateColumn()
  createdAt: Date;
}
