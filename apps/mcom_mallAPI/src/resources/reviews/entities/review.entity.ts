import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../listings/entities/listing.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
}

@Entity('reviews')
export class Review {
  @ApiProperty({ example: 'uuid-string', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 5, description: 'Rating value' })
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty({ example: 'Excellent service!', description: 'Review comment' })
  @Column({ type: 'text' })
  comment: string;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ type: () => Business })
  @ManyToOne(() => Business, (business) => business.reviews)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
