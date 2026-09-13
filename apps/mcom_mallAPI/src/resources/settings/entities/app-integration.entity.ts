import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('app_integrations')
export class AppIntegration {
  @ApiProperty({ description: 'Unique UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description:
      'App identifier key (e.g. google_business, stripe_connect, instagram)',
  })
  @Column({ type: 'varchar', length: 50 })
  appKey: string;

  @ApiProperty({ description: 'Whether integration is currently enabled' })
  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @ApiProperty({ description: 'JSON metadata/config for app' })
  @Column({ type: 'jsonb', nullable: true })
  configJson: Record<string, any>;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
