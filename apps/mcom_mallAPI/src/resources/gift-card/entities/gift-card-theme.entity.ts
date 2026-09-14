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

@Entity('gift_card_themes')
export class GiftCardTheme {
  @ApiProperty({ description: 'Unique UUID of the theme' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Theme name/title' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Category (e.g. Birthday, Holiday, Thank You, General)',
  })
  @Column({ type: 'varchar', length: 50, default: 'General' })
  category: string;

  @ApiProperty({ description: 'Primary brand/theme color hex' })
  @Column({ type: 'varchar', length: 20, default: '#3b82f6' })
  primaryColor: string;

  @ApiProperty({ description: 'Secondary theme color hex' })
  @Column({ type: 'varchar', length: 20, default: '#1e40af' })
  secondaryColor: string;

  @ApiProperty({
    description: 'SVG markup or image URL for background preview',
  })
  @Column({ type: 'text', nullable: true })
  previewSvg: string;

  @ApiProperty({ description: 'Badge or header text overlay' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  badgeText: string;

  @ApiProperty({ description: 'Whether this is a public system template' })
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
