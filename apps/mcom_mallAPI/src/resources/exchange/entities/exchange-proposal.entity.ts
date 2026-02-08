import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ExchangeItem } from './exchange-item.entity';
import { ProposalStatus } from './proposal-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ExchangeProposal {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'The unique identifier for the exchange proposal.',
  })
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  @ApiProperty({
    type: () => User,
    description: 'The user making the proposal.',
  })
  proposer: User;

  @Column()
  proposerId: string;

  @ManyToOne(() => User, (user) => user.id)
  @ApiProperty({
    type: () => User,
    description: 'The user receiving the proposal.',
  })
  receiver: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => ExchangeItem, (item) => item.proposalsAsOffered)
  @ApiProperty({
    type: () => ExchangeItem,
    description: 'The item being offered by the proposer.',
  })
  offeredItem: ExchangeItem;

  @Column()
  offeredItemId: string;

  @ManyToOne(() => ExchangeItem, (item) => item.proposalsAsRequested)
  @ApiProperty({
    type: () => ExchangeItem,
    description: 'The item being requested by the proposer.',
  })
  requestedItem: ExchangeItem;

  @Column()
  requestedItemId: string;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.PENDING,
  })
  @ApiProperty({
    description: 'The current status of the proposal.',
    enum: ProposalStatus,
    default: ProposalStatus.PENDING,
  })
  status: ProposalStatus;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date and time when the proposal was created.',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date and time when the proposal was last updated.',
  })
  updatedAt: Date;
}