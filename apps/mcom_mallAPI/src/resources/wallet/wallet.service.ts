import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { InitiateFundingDto } from './dto/initiate-funding.dto';
import {
  OrderPayment,
  PaymentMethod,
} from '../order/entities/order-payment.entity';
import { VerifyFundingDto } from './dto/verify-funding.dto';
import { Order } from '../order/entities/order.entity';
import {
  WalletTransaction,
  WalletTransactionType,
} from './entities/wallet-transaction.entity';
import { GiftCardService } from '../gift-card/gift-card.service';
import { VoucherService } from '../voucher/voucher.service';
import { CouponService } from '../coupon/coupon.service';
import { OrderService } from '../order/order.service';
import { CreditEarningDto } from './dto/credit-earning.dto';
import { BookingService } from '../booking/booking.service';
import { ServiceBooking } from '../booking/entities/service-booking.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => GiftCardService))
    private readonly giftCardService: GiftCardService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => CouponService))
    private readonly couponService: CouponService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly dataSource: DataSource,
  ) {}

  async getWallet(userId: string): Promise<Wallet> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.wallet) {
      const orders = await this.orderService.getOrdersForOwner(userId, {
        page: 1,
        limit: 1000,
      });
      user.wallet.totalOrders = orders.meta.totalItems;
      await this.walletRepository.save(user.wallet);
      return user.wallet;
    }

    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);

      const orders = await this.orderService.getOrdersForOwner(userId, {
        page: 1,
        limit: 1000,
      });
      const giftCardStats = await this.giftCardService.getOwnerStats(userId);
      const voucherStats =
        await this.voucherService.getSummaryStatistics(userId);
      const couponStats = await this.couponService.getSummaryStatistics(userId);
      const completedBookings =
        await this.bookingService.getCompletedBookingsForOwner(userId);

      const earningsFromOrders = orders.data.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );
      const earningsFromGiftCard = giftCardStats.totalSold;
      const earningsFromVoucher = voucherStats.totalSold;
      const earningsFromCoupons = couponStats.totalSold;
      const earningsFromBookings = completedBookings.reduce(
        (sum, booking) => sum + Number(booking.payment.amount),
        0,
      );

      const newWallet = walletRepo.create({
        user,
        balance: 0,
        earningsBalance:
          earningsFromOrders +
          earningsFromGiftCard +
          earningsFromVoucher +
          earningsFromCoupons +
          earningsFromBookings,
        spendableBalance: 0,
        totalOrders: orders.meta.totalItems,
        earningsFromOrders,
        earningsFromGiftCard,
        earningsFromVoucher,
        earningsFromCoupons,
        earningsFromBookings,
      });

      const savedWallet = await walletRepo.save(newWallet);

      if (earningsFromOrders > 0) {
        await this.createTransaction(
          savedWallet,
          earningsFromOrders,
          WalletTransactionType.EARNING_ORDER,
          'Backfilled order earnings',
          savedWallet.earningsBalance,
          manager,
        );
      }
      if (earningsFromGiftCard > 0) {
        await this.createTransaction(
          savedWallet,
          earningsFromGiftCard,
          WalletTransactionType.EARNING_GIFT_CARD,
          'Backfilled gift card earnings',
          savedWallet.earningsBalance,
          manager,
        );
      }
      if (earningsFromVoucher > 0) {
        await this.createTransaction(
          savedWallet,
          earningsFromVoucher,
          WalletTransactionType.EARNING_VOUCHER,
          'Backfilled voucher earnings',
          savedWallet.earningsBalance,
          manager,
        );
      }
      if (newWallet.earningsFromBookings > 0) {
        await this.createTransaction(
          savedWallet,
          newWallet.earningsFromBookings,
          WalletTransactionType.EARNING_BOOKING,
          'Backfilled booking earnings',
          savedWallet.earningsBalance,
          manager,
        );
      }

      return savedWallet;
    });
  }

  async getWalletDetails(userId: string): Promise<any> {
    const wallet = await this.getWallet(userId);
    const transactionHistory = await this.getTransactionHistory(wallet.id);

    const totalCashbackBalance = Number(wallet.earningsBalance);
    const terminalCashbackBalance = Number(wallet.earningsFromTerminalCashback);
    const normalCashbackBalance =
      totalCashbackBalance - terminalCashbackBalance;

    return {
      wallet,
      cashbackBreakdown: {
        terminalCashbackBalance,
        normalCashbackBalance,
        totalCashbackBalance,
      },
      transactionHistory,
    };
  }

  async creditEarning(creditEarningDto: CreditEarningDto): Promise<Wallet> {
    const { userId, amount, type, description } = creditEarningDto;

    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let wallet = await walletRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!wallet) {
        wallet = walletRepo.create({
          user,
          balance: 0,
          earningsBalance: 0,
          spendableBalance: 0,
          pendingBalance: 0,
          earningsFromOrders: 0,
          earningsFromGiftCard: 0,
          earningsFromVoucher: 0,
        });
      }

      if (type === WalletTransactionType.EARNING_BOOKING) {
        wallet.pendingBalance = Number(wallet.pendingBalance) + amount;
      } else {
        wallet.earningsBalance = Number(wallet.earningsBalance) + amount;
        if (type === WalletTransactionType.EARNING_ORDER) {
          wallet.earningsFromOrders =
            Number(wallet.earningsFromOrders) + amount;
        } else if (type === WalletTransactionType.EARNING_GIFT_CARD) {
          wallet.earningsFromGiftCard =
            Number(wallet.earningsFromGiftCard) + amount;
        } else if (type === WalletTransactionType.EARNING_VOUCHER) {
          wallet.earningsFromVoucher =
            Number(wallet.earningsFromVoucher) + amount;
        } else if (type === WalletTransactionType.EARNING_COUPON) {
          wallet.earningsFromCoupons =
            Number(wallet.earningsFromCoupons) + amount;
        } else if (type === WalletTransactionType.EARNING_TERMINAL_CASHBACK) {
          wallet.earningsFromTerminalCashback =
            Number(wallet.earningsFromTerminalCashback) + amount;
        }
      }

      const savedWallet = await walletRepo.save(wallet);

      await this.createTransaction(
        savedWallet,
        amount,
        type,
        description,
        type === WalletTransactionType.EARNING_BOOKING
          ? savedWallet.pendingBalance
          : savedWallet.earningsBalance,
        manager,
      );

      return savedWallet;
    });
  }

  async releaseBookingPayment(bookingId: string): Promise<Wallet> {
    const booking = await this.dataSource.manager.findOne(ServiceBooking, {
      where: { id: bookingId },
      relations: [
        'payment',
        'service',
        'service.business',
        'service.business.user',
      ],
    });

    if (!booking || !booking.payment) {
      throw new NotFoundException('Booking or payment not found.');
    }

    const { amount } = booking.payment;
    const userId = booking.service.business.user.id;

    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const wallet = await walletRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found.');
      }

      wallet.pendingBalance = Number(wallet.pendingBalance) - amount;
      wallet.earningsBalance = Number(wallet.earningsBalance) + amount;
      wallet.earningsFromBookings =
        Number(wallet.earningsFromBookings) + amount;

      const savedWallet = await walletRepo.save(wallet);

      await this.createTransaction(
        savedWallet,
        amount,
        WalletTransactionType.BOOKING_PAYMENT_RELEASED,
        `Released payment for booking #${booking.id}`,
        savedWallet.earningsBalance,
        manager,
      );

      return savedWallet;
    });
  }

  async getTransactionHistory(walletId: string): Promise<WalletTransaction[]> {
    return this.walletTransactionRepository.find({
      where: { wallet: { id: walletId } },
      order: { created_at: 'DESC' },
    });
  }

  async initiateWalletFunding(
    initiateDto: InitiateFundingDto,
    userId: string,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    provider: PaymentMethod;
  }> {
    if (initiateDto.amount < 10) {
      throw new BadRequestException('Minimum funding amount is 10 GBP');
    }
    const currency = 'GBP';

    if (initiateDto.paymentProvider === PaymentMethod.STRIPE) {
      const paymentIntent =
        await this.paymentProviderService.createStripePaymentIntent(
          initiateDto.amount,
          currency,
        );
      return {
        clientSecret: paymentIntent.client_secret,
        provider: PaymentMethod.STRIPE,
      };
    } else if (initiateDto.paymentProvider === PaymentMethod.PAYPAL) {
      const order = await this.paymentProviderService.createPaypalOrder(
        initiateDto.amount,
        currency,
      );
      return { orderId: order.id, provider: PaymentMethod.PAYPAL };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  async verifyAndCompleteFunding(
    verifyDto: VerifyFundingDto,
    userId: string,
  ): Promise<Wallet> {
    const { amount, paymentProvider, transactionId } = verifyDto;
    const currency = 'GBP';
    let verificationResult;

    if (paymentProvider === PaymentMethod.STRIPE) {
      verificationResult =
        await this.paymentProviderService.verifyStripePaymentIntent(
          transactionId,
          amount,
          currency,
        );
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      verificationResult =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          transactionId,
          amount,
          currency,
        );
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }

    if (!verificationResult.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verificationResult.reason}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const paymentRepo = manager.getRepository(OrderPayment);
      const walletRepo = manager.getRepository(Wallet);
      const userRepo = manager.getRepository(User);

      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ['wallet'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newPayment = paymentRepo.create({
        user: { id: userId } as User,
        amount,
        currency,
        transactionId,
        paymentMethod: paymentProvider,
      });
      const savedPayment = await paymentRepo.save(newPayment);

      const newOrder = orderRepo.create({
        user: { id: userId } as User,
        total: amount,
        payment: savedPayment,
      });
      await orderRepo.save(newOrder);

      let wallet = user.wallet;
      if (!wallet) {
        wallet = walletRepo.create({
          user,
          balance: 0,
          earningsBalance: 0,
          spendableBalance: amount,
          earningsFromOrders: 0,
          earningsFromGiftCard: 0,
          earningsFromVoucher: 0,
        });
      } else {
        wallet.spendableBalance = Number(wallet.spendableBalance) + amount;
      }
      const savedWallet = await walletRepo.save(wallet);

      await this.createTransaction(
        savedWallet,
        amount,
        WalletTransactionType.FUNDING,
        'Wallet funded.',
        savedWallet.spendableBalance,
        manager,
      );

      return savedWallet;
    });
  }

  async spendBalance(
    userId: string,
    amount: number,
    description: string,
    type: WalletTransactionType = WalletTransactionType.SPEND,
    manager?: EntityManager,
  ): Promise<Wallet> {
    const finalManager = manager || this.dataSource.manager;
    const walletRepo = finalManager.getRepository(Wallet);

    const wallet = await walletRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (Number(wallet.spendableBalance) < amount) {
      throw new BadRequestException('Insufficient spendable balance');
    }

    wallet.spendableBalance = Number(wallet.spendableBalance) - amount;
    const savedWallet = await walletRepo.save(wallet);

    await this.createTransaction(
      savedWallet,
      amount,
      type,
      description,
      savedWallet.spendableBalance,
      finalManager,
    );

    return savedWallet;
  }

  private async createTransaction(
    wallet: Wallet,
    amount: number,
    type: WalletTransactionType,
    description: string,
    balanceAfter: number,
    manager?: EntityManager,
  ): Promise<WalletTransaction> {
    const finalManager = manager || this.dataSource.manager;
    const transactionRepo = finalManager.getRepository(WalletTransaction);

    const transaction = transactionRepo.create({
      wallet,
      amount,
      type,
      description,
      balanceAfter,
    });

    return transactionRepo.save(transaction);
  }
}
