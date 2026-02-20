import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/role.enum';
import { Order } from '../order/entities/order.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import {
  PointTransaction,
  PointTransactionType,
} from '../transaction/entities/point-transaction.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { CouponTransaction } from '../coupon/entities/coupon-transaction.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { Business } from '../listings/entities/listing.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { OwnerStatsDto } from './dto/owner-stats.dto';
import { CustomerStatsDto } from './dto/customer-stats.dto';
import { SalesChartQueryDto } from './dto/sales-chart.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(GiftCard)
    private readonly giftCardRepository: Repository<GiftCard>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(CouponTransaction)
    private readonly couponTransactionRepository: Repository<CouponTransaction>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(PromotionParticipant)
    private readonly promotionParticipantRepository: Repository<PromotionParticipant>,
  ) {}

  async getUserStats(user: User): Promise<OwnerStatsDto | CustomerStatsDto> {
    if (user.role === UserRole.OWNER) {
      return this.getOwnerStats(user.id);
    } else {
      return this.getCustomerStats(user.id);
    }
  }

  private async getOwnerStats(userId: string): Promise<OwnerStatsDto> {
    const userWithWalletQuery = this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });

    const productOrdersQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'sum')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.business', 'business')
      .where('business.user = :userId', { userId })
      .getRawOne();

    const giftCardQuery = this.giftCardRepository
      .createQueryBuilder('gift_card')
      .select('SUM(gift_card.initialBalance)', 'sum')
      .where('gift_card.owner = :userId', { userId })
      .getRawOne();

    const promotionsQuery = this.promotionParticipantRepository
      .createQueryBuilder('participant')
      .select('SUM(participant.pointsEarned)', 'sum')
      .leftJoin('participant.promotion', 'promotion')
      .where('promotion.user = :userId', { userId })
      .getRawOne();

    const offersRedeemedQuery = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.offer', 'offer')
      .where('offer.user = :userId', { userId })
      .getCount();

    const couponQuery = this.couponTransactionRepository
      .createQueryBuilder('ct')
      .select('SUM(ct.amount)', 'sum')
      .leftJoin('ct.coupon', 'coupon')
      .where('coupon.owner = :userId', { userId })
      .getRawOne();

    const voucherQuery = this.voucherRepository
      .createQueryBuilder('voucher')
      .select('SUM(voucher.initialValue)', 'sum')
      .where('voucher.owner = :userId', { userId })
      .getRawOne();

    const productCountQuery = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.business', 'business')
      .where('business.user = :userId', { userId })
      .getCount();

    const serviceCountQuery = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoin('service.business', 'business')
      .where('business.user = :userId', { userId })
      .getCount();

    const listingCountQuery = this.businessRepository.count({
      where: { user: { id: userId } },
    });

    const [
      userWithWallet,
      productOrders,
      giftCard,
      promotions,
      offersRedeemed,
      coupon,
      voucher,
      productCount,
      serviceCount,
      listingCount,
    ] = await Promise.all([
      userWithWalletQuery,
      productOrdersQuery,
      giftCardQuery,
      promotionsQuery,
      offersRedeemedQuery,
      couponQuery,
      voucherQuery,
      productCountQuery,
      serviceCountQuery,
      listingCountQuery,
    ]);

    return {
      totalAmountEarnedFromProductOrders: +productOrders.sum || 0,
      totalAmountEarnedFromGiftCard: +giftCard.sum || 0,
      totalAmountSpentForPromotions: +promotions.sum || 0,
      totalOffersRedeemed: offersRedeemed,
      totalAmountSpentOnCoupon: +coupon.sum || 0,
      totalAmountOfVoucherPurchased: +voucher.sum || 0,
      totalAmountOfProduct: productCount,
      totalAmountOfService: serviceCount,
      totalAmountOfListing: listingCount,
      totalWalletBalance: userWithWallet.wallet?.balance || 0,
    };
  }

  private async getCustomerStats(userId: string): Promise<CustomerStatsDto> {
    const productOrdersQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'sum')
      .where('order.userId = :userId', { userId })
      .getRawOne();

    const orderItemsCountQuery = this.orderItemRepository
      .createQueryBuilder('oi')
      .leftJoin('oi.order', 'order')
      .where('order.userId = :userId', { userId })
      .getCount();

    const serviceBookedQuery = this.bookingRepository.count({
      where: { user: { id: userId } },
    });

    const promotionsParticipatingQuery =
      this.promotionParticipantRepository.count({
        where: { user: { id: userId } },
      });

    const pointsEarnedQuery = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('SUM(pt.points)', 'sum')
      .where('pt.userId = :userId', { userId })
      .andWhere('pt.type = :type', { type: PointTransactionType.EARNED })
      .getRawOne();

    const pointsRedeemedQuery = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('SUM(pt.points)', 'sum')
      .where('pt.userId = :userId', { userId })
      .andWhere('pt.type = :type', {
        type: PointTransactionType.REDEMPTION,
      })
      .getRawOne();

    const voucherQuery = this.voucherRepository
      .createQueryBuilder('voucher')
      .select('SUM(voucher.initialValue)', 'sum')
      .where('voucher.buyer = :userId', { userId })
      .getRawOne();

    const giftCardQuery = this.giftCardRepository
      .createQueryBuilder('gift_card')
      .select('SUM(gift_card.initialBalance)', 'sum')
      .where('gift_card.purchaser = :userId', { userId })
      .getRawOne();

    const [
      productOrders,
      orderItemsCount,
      serviceBooked,
      promotionsParticipating,
      pointsEarned,
      pointsRedeemed,
      voucher,
      giftCard,
    ] = await Promise.all([
      productOrdersQuery,
      orderItemsCountQuery,
      serviceBookedQuery,
      promotionsParticipatingQuery,
      pointsEarnedQuery,
      pointsRedeemedQuery,
      voucherQuery,
      giftCardQuery,
    ]);

    return {
      totalAmountSpentOnProductOrdered: +productOrders.sum || 0,
      totalNumberOfProductOrdered: orderItemsCount,
      totalNumberOfServiceBooked: serviceBooked,
      totalNumberOfPromotionsParticipating: promotionsParticipating,
      totalNumberOfPointsEarned: +pointsEarned.sum || 0,
      totalNumberOfPointsRedeemed: +pointsRedeemed.sum || 0,
      totalAmountSpentOnVoucher: +voucher.sum || 0,
      totalAmountSpentOnGiftCards: +giftCard.sum || 0,
    };
  }

  async getSalesChart(user: User, query: SalesChartQueryDto) {
    let startDate = query.startDate;
    let endDate = query.endDate;

    if (query.allTime) {
      startDate = new Date(0);
      endDate = new Date();
    } else if (!startDate || !endDate) {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
    }

    if (user.role === UserRole.OWNER) {
      return this.getSalesChartData(user.id, startDate, endDate);
    } else {
      return [];
    }
  }

  private async getSalesChartData(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const giftCardSalesQuery = this.giftCardRepository
      .createQueryBuilder('gift_card')
      .select('DATE(gift_card.created_at)', 'date')
      .addSelect('SUM(gift_card.initialBalance)', 'total')
      .where('gift_card.owner = :userId', { userId })
      .andWhere('gift_card.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(gift_card.created_at)')
      .getRawMany();

    const voucherSalesQuery = this.voucherRepository
      .createQueryBuilder('voucher')
      .select('DATE(voucher.createdAt)', 'date')
      .addSelect('SUM(voucher.initialValue)', 'total')
      .where('voucher.owner = :userId', { userId })
      .andWhere('voucher.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(voucher.createdAt)')
      .getRawMany();

    const orderSalesQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.created_at)', 'date')
      .addSelect('SUM(order.total)', 'total')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.business', 'business')
      .where('business.user = :userId', { userId })
      .andWhere('order.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(order.created_at)')
      .getRawMany();

    const bookingPaymentsQuery = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.payment', 'payment')
      .leftJoin('booking.service', 'service')
      .leftJoin('service.business', 'business')
      .select('DATE(booking.updated_at)', 'date')
      .addSelect('SUM(payment.amount)', 'total')
      .where('business.user = :userId', { userId })
      .andWhere('booking.customerCompleted = true')
      .andWhere('booking.businessOwnerCompleted = true')
      .andWhere('booking.updated_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(booking.updated_at)')
      .getRawMany();

    const [giftCardSales, voucherSales, orderSales, bookingPayments] =
      await Promise.all([
        giftCardSalesQuery,
        voucherSalesQuery,
        orderSalesQuery,
        bookingPaymentsQuery,
      ]);

    const salesData = {};

    const processSales = (sales, type) => {
      sales.forEach((sale) => {
        const date = new Date(sale.date).toISOString().split('T')[0];
        if (!salesData[date]) {
          salesData[date] = {
            giftCardSales: 0,
            voucherSales: 0,
            orderSales: 0,
            bookingPayments: 0,
          };
        }
        salesData[date][type] = +sale.total;
      });
    };

    processSales(giftCardSales, 'giftCardSales');
    processSales(voucherSales, 'voucherSales');
    processSales(orderSales, 'orderSales');
    processSales(bookingPayments, 'bookingPayments');

    const chartData = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        ...(salesData[dateStr] || {
          giftCardSales: 0,
          voucherSales: 0,
          orderSales: 0,
          bookingPayments: 0,
        }),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  }
}
