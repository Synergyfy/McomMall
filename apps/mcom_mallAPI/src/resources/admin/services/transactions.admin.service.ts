import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/resources/order/entities/order.entity';
import { ServiceBooking } from 'src/resources/booking/entities/service-booking.entity';
import { MembershipPayment } from 'src/resources/membership/entities/membership-payment.entity';
import { McomPayCharge } from 'src/resources/payments/entities/mcom-pay-charge.entity';
import { Repository } from 'typeorm';
import {
  TransactionQueryDto,
  PaginatedTransactionsDto,
  TransactionStatsDto,
  AdminTransactionDto,
} from '../dto/transactions.dto';
import { OrderStatus } from 'src/resources/order/enums/order-status.enum';

@Injectable()
export class AdminTransactionsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(ServiceBooking)
    private bookingsRepository: Repository<ServiceBooking>,
    @InjectRepository(MembershipPayment)
    private membershipPaymentsRepository: Repository<MembershipPayment>,
    @InjectRepository(McomPayCharge)
    private mcomChargesRepository: Repository<McomPayCharge>,
  ) {}

  async getStats(): Promise<TransactionStatsDto> {
    const [
      orderSum,
      bookingSum,
      membershipSum,
      orderPending,
      bookingPending,
      feeSum,
      refundedCount,
    ] = await Promise.all([
        this.ordersRepository
          .createQueryBuilder('o')
          .select('SUM(o.total) / 100.0', 'sum')
          .getRawOne(),
        this.bookingsRepository
          .createQueryBuilder('b')
          .leftJoin('b.payment', 'p')
          .select('SUM(p.amount) / 100.0', 'sum')
          .getRawOne(),
        this.membershipPaymentsRepository
          .createQueryBuilder('m')
          .select('SUM(m.amount) / 100.0', 'sum')
          .getRawOne(),
        this.ordersRepository.count({ where: { status: OrderStatus.PENDING } }),
        this.bookingsRepository.count({ where: { status: 'pending' as any } }),
        this.mcomChargesRepository
          .createQueryBuilder('c')
          .select('SUM(c."feeMinor") / 100.0', 'sum')
          .where('c.status = :status', { status: 'paid' })
          .getRawOne(),
        this.mcomChargesRepository
          .createQueryBuilder('c')
          .where('c."refundedMinor" > 0 OR c.status = :refunded', {
            refunded: 'refunded',
          })
          .getCount(),
      ]);

    const totalVolume =
      Number(orderSum?.sum || 0) +
      Number(bookingSum?.sum || 0) +
      Number(membershipSum?.sum || 0);

    return {
      totalVolume,
      totalFees: Number(feeSum?.sum || 0),
      pendingCount: orderPending + bookingPending,
      refundCount: refundedCount,
    };
  }

  async findAll(query: TransactionQueryDto): Promise<PaginatedTransactionsDto> {
    const { search, status, type, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Fetch limited set from sources. Combined pagination is tricky without a unified table.
    // We take 'limit' from each and merge for a representative view.
    const [orders, bookings, memberships] = await Promise.all([
      this.ordersRepository.find({
        relations: [
          'user',
          'payment',
          'items',
          'items.product',
          'items.product.business',
        ],
        order: { created_at: 'DESC' },
        take: limit,
        skip: skip / 3, // Heuristic skip to simulate distributed pagination
      }),
      this.bookingsRepository.find({
        relations: ['user', 'payment', 'service', 'service.business'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: skip / 3,
      }),
      this.membershipPaymentsRepository.find({
        relations: ['user'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: skip / 3,
      }),
    ]);

    const allTransactions: AdminTransactionDto[] = [
      ...orders.map((o) => ({
        id: o.id,
        payerName: o.user?.name || 'Unknown',
        payeeName:
          o.items?.[0]?.product?.business?.businessName || 'Multiple/Unknown',
        type: 'payment' as const,
        amount: Number(o.total),
        fees: Number(o.payment?.feeMinor ?? 0) / 100,
        paymentMethod: o.payment?.paymentMethod || 'Unknown',
        status: o.status,
        date: o.created_at,
        orderId: o.id,
      })),
      ...bookings.map((b) => ({
        id: b.id,
        payerName: b.user?.name || 'Unknown',
        payeeName: b.service?.business?.businessName || 'Service Provider',
        type: 'payment' as const,
        amount: Number(b.payment?.amount || 0),
        fees: Number(b.payment?.feeMinor ?? 0) / 100,
        paymentMethod: b.payment?.paymentMethod || 'Booking',
        status: b.status,
        date: b.created_at,
      })),
      ...memberships.map((m) => ({
        id: m.id,
        payerName: m.user?.name || 'Unknown',
        payeeName: 'Mcom Mall',
        type: 'payment' as const,
        amount: Number(m.amount),
        fees: Number(m.feeMinor ?? 0) / 100,
        paymentMethod: m.paymentMethod,
        status: 'completed',
        date: m.created_at,
      })),
    ];

    const searchTerm = search?.trim().toLowerCase();
    const filtered = allTransactions.filter((txn) => {
      const matchesSearch =
        !searchTerm ||
        [txn.id, txn.payerName, txn.payeeName, txn.paymentMethod, txn.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm));
      const matchesStatus =
        !status ||
        status === 'all' ||
        String(txn.status).toLowerCase() === status.toLowerCase();
      const matchesType = !type || type === 'all' || txn.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort by date descending
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    const paginatedData = filtered.slice(0, limit);

    const [oTotal, bTotal, mTotal] = await Promise.all([
      this.ordersRepository.count(),
      this.bookingsRepository.count(),
      this.membershipPaymentsRepository.count(),
    ]);

    const totalCount = oTotal + bTotal + mTotal;

    return {
      data: paginatedData,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
