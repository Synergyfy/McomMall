import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExchangeProposal } from './exchange-proposal.entity';
import { EscrowStatus } from './escrow-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for the escrow record.' })
  id: string;

  @OneToOne(() => ExchangeProposal)
  @JoinColumn()
  @ApiProperty({
    type: () => ExchangeProposal,
    description: 'The exchange proposal associated with this escrow.',
  })
  proposal: ExchangeProposal;

  @Column()
  proposalId: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.PENDING,
  })
  @ApiProperty({
    description: 'The current status of the escrow.',
    enum: EscrowStatus,
    default: EscrowStatus.PENDING,
  })
  status: EscrowStatus;

  @Column({ default: false })
  @ApiProperty({
    description: 'Indicates whether the proposer has confirmed the exchange.',
    default: false,
  })
  proposerConfirmed: boolean;

  @Column({ default: false })
  @ApiProperty({
    description: 'Indicates whether the receiver has confirmed the exchange.',
    default: false,
  })
  receiverConfirmed: boolean;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date and time when the escrow was created.',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date and time when the escrow was last updated.',
  })
  updatedAt: Date;
}