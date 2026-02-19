import {
  ChildEntity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DigitalValue, DigitalValueType } from '../../digital-value/entities/digital-value.entity';
import { Order } from '../../order/entities/order.entity';
import { GiftCardTemplate } from './gift-card-template.entity';
import { GiftCardAsset } from './gift-card-asset.entity';

@ChildEntity(DigitalValueType.GIFT_CARD)
export class GiftCard extends DigitalValue {
  @Column({ type: 'text', nullable: true })
  htmlBody: string;

  @ManyToOne(() => GiftCardTemplate, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: GiftCardTemplate;

  @Column({ nullable: true })
  templateId: string;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: Order;

  @Column({ nullable: true })
  purchaseOrderId: string;

  @ManyToOne(() => GiftCardAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assetId' })
  asset: GiftCardAsset;

  @Column({ nullable: true })
  assetId: string;

  // Transactions are now handled by DigitalValueTransaction in parent class
}
