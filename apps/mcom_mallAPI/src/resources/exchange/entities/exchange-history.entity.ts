import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ExchangeItem } from './exchange-item.entity';
import { ExchangeProposal } from './exchange-proposal.entity';
import { ExchangeHistoryAction } from './exchange-history-action.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ExchangeHistory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'The unique identifier for the history record.',
  })
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  @ApiProperty({
    type: () => User,
    description: 'The user who performed the action.',
  })
  actor: User;

  @Column({ nullable: true })
  actorId: string;

  @Column({
    type: 'enum',
    enum: ExchangeHistoryAction,
  })
  @ApiProperty({
    description: 'The action that was performed.',
    enum: ExchangeHistoryAction,
  })
  action: ExchangeHistoryAction;

  @ManyToOne(() => ExchangeItem, (item) => item.id, { nullable: true })
  @ApiProperty({
    type: () => ExchangeItem,
    description: 'The exchange item related to this action.',
    nullable: true,
  })
  item: ExchangeItem;

  @Column({ nullable: true })
  itemId: string;

  @ManyToOne(() => ExchangeProposal, (proposal) => proposal.id, {
    nullable: true,
  })
  @ApiProperty({
    type: () => ExchangeProposal,
    description: 'The exchange proposal related to this action.',
    nullable: true,
  })
  proposal: ExchangeProposal;

  @Column({ nullable: true })
  proposalId: string;

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'A snapshot of the state before the change.',
    nullable: true,
  })
  detailsBefore: object;

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'A snapshot of the state after the change.',
    nullable: true,
  })
  detailsAfter: object;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date and time when the action occurred.',
  })
  createdAt: Date;
}