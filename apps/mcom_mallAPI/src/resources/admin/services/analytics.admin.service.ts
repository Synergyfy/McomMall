import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { User } from 'src/resources/users/entities/user.entity';
import { Order } from 'src/resources/order/entities/order.entity';
import { ServiceBooking } from 'src/resources/booking/entities/service-booking.entity';
import { MembershipPayment } from 'src/resources/membership/entities/membership-payment.entity';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { Activity } from 'src/resources/activities/entities/activity.entity';
import {
  AdminAnalyticsResponseDto,
  MetricDto,
  AnalyticsChartPointDto,
  TopItemDto,
  FunnelItemDto,
} from '../dto/analytics.dto';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(ServiceBooking)
    private bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(MembershipPayment)
    private membershipRepository: Repository<MembershipPayment>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async getAnalytics(
    range: string = '7days',
  ): Promise<AdminAnalyticsResponseDto> {
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;

    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(
          startDate.getTime() - 30 * 24 * 60 * 60 * 1000,
        );
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(
          startDate.getTime() - 90 * 24 * 60 * 60 * 1000,
        );
        break;
      default: // 7days
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Run all independent metric queries in parallel — was 8 sequential, now 1 round trip
    const [
      currentSignups,
      prevSignups,
      currentRevenue,
      prevRevenue,
      currentVisitors,
      prevVisitors,
      currentOrders,
      prevOrders,
    ] = await Promise.all([
      this.userRepository.count({ where: { created_at: MoreThan(startDate) } }),
      this.userRepository.count({ where: { created_at: Between(prevStartDate, startDate) } }),
      this.calculateTotalRevenue(startDate, new Date()),
      this.calculateTotalRevenue(prevStartDate, startDate),
      this.countDistinctActiveUsers(startDate),
      this.countDistinctActiveUsers(prevStartDate, startDate),
      this.orderRepository.count({ where: { created_at: MoreThan(startDate) } }),
      this.orderRepository.count({ where: { created_at: Between(prevStartDate, startDate) } }),
    ]);

    const signupsMetric = this.calculateMetric(currentSignups, prevSignups);
    const revenueMetric = this.calculateMetric(currentRevenue, prevRevenue, true);
    const visitorsMetric = this.calculateMetric(currentVisitors, prevVisitors);
    const conversionMetric = this.calculatePercentageMetric(
      currentOrders,
      Math.max(currentVisitors, 1),
      prevOrders,
      Math.max(prevVisitors, 1),
    );

    // 5. Revenue Chart (Last 7 Days always for the chart in the UI)
    const chartStartDate = new Date(
      new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    const [revenueChart, visitorChart] = await Promise.all([
      this.getRevenueChartData(chartStartDate),
      this.getVisitorChartData(chartStartDate),
    ]);

    // 6. Top Categories (This Month)
    const topCategories = await this.getTopCategories();

    // 7. Top Businesses (This Month)
    const topBusinesses = await this.getTopBusinesses();

    // 8. Conversion Funnel (visitors -> signups -> orders -> paid orders)
    const paidOrders = await this.countPaidOrders(startDate);
    const conversionFunnel = this.buildConversionFunnel(
      currentVisitors,
      currentSignups,
      currentOrders,
      paidOrders,
    );

    return {
      visitors: visitorsMetric,
      signups: signupsMetric,
      revenue: revenueMetric,
      conversionRate: conversionMetric,
      visitorChart,
      revenueChart,
      topCategories,
      topBusinesses,
      conversionFunnel,
    };
  }

  private async countDistinctActiveUsers(
    start: Date,
    end?: Date,
  ): Promise<number> {
    const qb = this.activityRepository
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a."userId")', 'count')
      .where('a."created_at" >= :start', { start });
    if (end) {
      qb.andWhere('a."created_at" < :end', { end });
    }
    const row = await qb.getRawOne();
    return Number(row?.count || 0);
  }

  private async countPaidOrders(start: Date): Promise<number> {
    const row = await this.orderRepository
      .createQueryBuilder('o')
      .select('COUNT(DISTINCT o.id)', 'count')
      .leftJoin('o.payment', 'p')
      .where('o.created_at >= :start', { start })
      .getRawOne();
    return Number(row?.count || 0);
  }

  private buildConversionFunnel(
    visitors: number,
    signups: number,
    orders: number,
    paidOrders: number,
  ): FunnelItemDto[] {
    const visitorsPct = 100;
    const signupsPct = visitors > 0 ? (signups / visitors) * 100 : 0;
    const ordersPct = visitors > 0 ? (orders / visitors) * 100 : 0;
    const paidPct = visitors > 0 ? (paidOrders / visitors) * 100 : 0;
    return [
      { stage: 'Visitors', value: visitors, pct: visitorsPct },
      {
        stage: 'Signups',
        value: signups,
        pct: Math.round(signupsPct * 10) / 10,
      },
      { stage: 'Orders', value: orders, pct: Math.round(ordersPct * 10) / 10 },
      {
        stage: 'Paid Orders',
        value: paidOrders,
        pct: Math.round(paidPct * 10) / 10,
      },
    ];
  }

  private calculateMetric(
    current: number,
    prev: number,
    isCurrency: boolean = false,
  ): MetricDto {
    const change = prev === 0 ? 100 : ((current - prev) / prev) * 100;
    const valueStr = isCurrency
      ? `£${(current / 1000).toFixed(1)}K`
      : current.toLocaleString();
    return {
      value: valueStr,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      changeType: change >= 0 ? 'up' : 'down',
    };
  }

  private calculatePercentageMetric(
    current: number,
    currentBase: number,
    prev: number,
    prevBase: number,
  ): MetricDto {
    const currentRate = currentBase > 0 ? (current / currentBase) * 100 : 0;
    const prevRate = prevBase > 0 ? (prev / prevBase) * 100 : 0;
    const change =
      prevRate === 0 ? 100 : ((currentRate - prevRate) / prevRate) * 100;
    return {
      value: `${currentRate.toFixed(1)}%`,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      changeType: change >= 0 ? 'up' : 'down',
    };
  }

  private async calculateTotalRevenue(start: Date, end: Date): Promise<number> {
    const [orderSum, bookingSum, membershipSum] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('o')
        .select('SUM(o.total)', 'sum')
        .where('o.created_at BETWEEN :start AND :end', { start, end })
        .getRawOne(),
      this.bookingRepository
        .createQueryBuilder('b')
        .leftJoin('b.payment', 'p')
        .select('SUM(p.amount)', 'sum')
        .where('b.created_at BETWEEN :start AND :end', { start, end })
        .getRawOne(),
      this.membershipRepository
        .createQueryBuilder('m')
        .select('SUM(m.amount)', 'sum')
        .where('m.created_at BETWEEN :start AND :end', { start, end })
        .getRawOne(),
    ]);
    return (
      Number(orderSum?.sum || 0) +
      Number(bookingSum?.sum || 0) +
      Number(membershipSum?.sum || 0)
    );
  }

  private async getRevenueChartData(
    start: Date,
  ): Promise<AnalyticsChartPointDto[]> {
    const revenueData = await this.orderRepository
      .createQueryBuilder('o')
      .select('DATE(o.created_at) as date, SUM(o.total) as total')
      .where('o.created_at > :start', { start })
      .groupBy('DATE(o.created_at)')
      .orderBy('DATE(o.created_at)', 'ASC')
      .getRawMany();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return revenueData.map((d) => ({
      day: days[new Date(d.date).getDay()],
      value: Number(d.total),
    }));
  }

  private async getVisitorChartData(
    start: Date,
  ): Promise<AnalyticsChartPointDto[]> {
    const visitorData = await this.activityRepository
      .createQueryBuilder('a')
      .select(
        'DATE(a.created_at) as date, COUNT(DISTINCT a."userId") as visitors',
      )
      .where('a.created_at > :start', { start })
      .groupBy('DATE(a.created_at)')
      .orderBy('DATE(a.created_at)', 'ASC')
      .getRawMany();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return visitorData.map((d) => ({
      day: days[new Date(d.date).getDay()],
      value: Number(d.visitors),
    }));
  }

  private async getTopCategories(): Promise<TopItemDto[]> {
    const prevMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1,
    );
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const [data, prevData] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('o')
        .leftJoin('o.items', 'oi')
        .leftJoin('oi.product', 'p')
        .select('p.category', 'name')
        .addSelect('SUM(oi.price * oi.quantity)', 'value')
        .where('o.created_at > :monthStart', {
          monthStart: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ),
        })
        .groupBy('p.category')
        .orderBy('value', 'DESC')
        .limit(5)
        .getRawMany(),
      this.orderRepository
        .createQueryBuilder('o')
        .leftJoin('o.items', 'oi')
        .leftJoin('oi.product', 'p')
        .select('p.category', 'name')
        .addSelect('SUM(oi.price * oi.quantity)', 'value')
        .where(
          'o.created_at >= :prevMonthStart AND o.created_at < :currentMonthStart',
          {
            prevMonthStart,
            currentMonthStart,
          },
        )
        .groupBy('p.category')
        .getRawMany(),
    ]);

    const prevMap = new Map(
      prevData.map((pd) => [pd.name, Number(pd.value) || 0]),
    );

    return data.map((d) => {
      const currentVal = Number(d.value) || 0;
      const prevVal = prevMap.get(d.name) || 0;
      let pctChange = 0;
      if (prevVal > 0) {
        pctChange = Math.round(((currentVal - prevVal) / prevVal) * 100);
      } else if (currentVal > 0) {
        pctChange = 100;
      }
      return {
        name: d.name || 'Uncategorized',
        value: `£${currentVal.toLocaleString()}`,
        change: pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`,
      };
    });
  }

  private async getTopBusinesses(): Promise<TopItemDto[]> {
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const prevMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1,
    );

    const [data, prevData] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('o')
        .leftJoin('o.items', 'oi')
        .leftJoin('oi.product', 'p')
        .leftJoin('p.business', 'b')
        .select('b.businessName', 'name')
        .addSelect('SUM(oi.price * oi.quantity)', 'value')
        .where('o.created_at > :monthStart', { monthStart })
        .groupBy('b.businessName')
        .orderBy('value', 'DESC')
        .limit(5)
        .getRawMany(),
      this.orderRepository
        .createQueryBuilder('o')
        .leftJoin('o.items', 'oi')
        .leftJoin('oi.product', 'p')
        .leftJoin('p.business', 'b')
        .select('b.businessName', 'name')
        .addSelect('SUM(oi.price * oi.quantity)', 'value')
        .where(
          'o.created_at >= :prevMonthStart AND o.created_at < :monthStart',
          { prevMonthStart, monthStart },
        )
        .groupBy('b.businessName')
        .getRawMany(),
    ]);

    const prevMap = new Map(
      prevData.map((pd) => [pd.name, Number(pd.value) || 0]),
    );

    return data.map((d) => {
      const currentVal = Number(d.value) || 0;
      const prevVal = prevMap.get(d.name) || 0;
      let pctChange = 0;
      if (prevVal > 0) {
        pctChange = Math.round(((currentVal - prevVal) / prevVal) * 100);
      } else if (currentVal > 0) {
        pctChange = 100;
      }
      return {
        name: d.name || 'Unknown',
        value: `£${currentVal.toLocaleString()}`,
        change: pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`,
      };
    });
  }
}
