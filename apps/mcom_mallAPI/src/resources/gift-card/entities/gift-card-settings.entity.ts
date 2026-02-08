import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('gift_card_settings')
export class GiftCardSettings extends AbstractBaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ unique: true })
  ownerId: string;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ default: true })
  allowDeliveryScheduling: boolean;

  @Column({ default: true })
  allowPersonalMessage: boolean;

  @Column({ default: true })
  enableQrCode: boolean;

  @Column({ default: false })
  allowReloading: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Rules for applying gift cards to orders',
  })
  redemptionRules: {
    canBeUsedWithDiscounts: boolean;
    canApplyToShipping: boolean;
    canApplyToTax: boolean;
  };
}