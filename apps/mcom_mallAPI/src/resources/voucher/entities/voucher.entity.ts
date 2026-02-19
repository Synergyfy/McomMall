import {
  ChildEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DigitalValue, DigitalValueType } from '../../digital-value/entities/digital-value.entity';
import { Order } from '../../order/entities/order.entity';
import { VoucherProduct } from './voucher-product.entity';

// Deprecated, use DigitalValueStatus
export enum VoucherStatus {
  UNREDEEMED = 'unredeemed',
  REDEEMED = 'redeemed',
  PARTIALLY_REDEEMED = 'partially_redeemed',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

@ChildEntity(DigitalValueType.VOUCHER)
export class Voucher extends DigitalValue {
  @ManyToOne(() => Order, (order) => order.vouchers, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => VoucherProduct, (product) => product.vouchers, { nullable: true })
  @JoinColumn({ name: 'voucherProductId' })
  voucherProduct: VoucherProduct;

  // Transactions are inherited
}
