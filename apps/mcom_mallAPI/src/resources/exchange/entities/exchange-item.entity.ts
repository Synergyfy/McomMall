import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ItemStatus } from './item-status.enum';
import { ExchangeProposal } from './exchange-proposal.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ExchangeItemType } from './exchange-item-type.enum';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';

@Entity()
@Check(
  `"itemType" = 'generic' OR ("productId" IS NOT NULL AND "serviceId" IS NULL) OR ("productId" IS NULL AND "serviceId" IS NOT NULL)`,
)
export class ExchangeItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for the exchange item.' })
  id: string;

  @Column({
    type: 'enum',
    enum: ExchangeItemType,
    default: ExchangeItemType.GENERIC,
  })
  @ApiProperty({
    description: 'The type of the exchange item.',
    enum: ExchangeItemType,
    default: ExchangeItemType.GENERIC,
  })
  itemType: ExchangeItemType;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'The ID of the product, if the item is a product.',
    nullable: true,
  })
  productId?: string;

  @ManyToOne(() => Product, { nullable: true, eager: true })
  product?: Product;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'The ID of the service, if the item is a service.',
    nullable: true,
  })
  serviceId?: string;

  @ManyToOne(() => Service, { nullable: true, eager: true })
  service?: Service;

  @Column()
  @ApiProperty({
    description: 'The title of the exchange item.',
    example: 'Vintage Leather Jacket',
  })
  title: string;

  @Column('text')
  @ApiProperty({ description: 'A detailed description of the exchange item.' })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.AVAILABLE,
  })
  @ApiProperty({
    description: 'The current status of the exchange item.',
    enum: ItemStatus,
    default: ItemStatus.AVAILABLE,
  })
  status: ItemStatus;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => ExchangeProposal, (proposal) => proposal.offeredItem)
  proposalsAsOffered: ExchangeProposal[];

  @OneToMany(() => ExchangeProposal, (proposal) => proposal.requestedItem)
  proposalsAsRequested: ExchangeProposal[];

  @CreateDateColumn()
  @ApiProperty({ description: 'The date and time when the item was created.' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date and time when the item was last updated.',
  })
  updatedAt: Date;
}
