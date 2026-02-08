import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { User } from 'src/resources/users/entities/user.entity';
import { Order } from 'src/resources/order/entities/order.entity';
import { ServiceBooking } from 'src/resources/booking/entities/service-booking.entity';
import { MembershipPayment } from 'src/resources/membership/entities/membership-payment.entity';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { AdminAnalyticsResponseDto, MetricDto, AnalyticsChartPointDto, TopItemDto } from '../dto/analytics.dto';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(ServiceBooking) private bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(MembershipPayment) private membershipRepository: Repository<MembershipPayment>,
    @InjectRepository(Business) private businessRepository: Repository<Business>,
  ) {}

  async getAnalytics(range: string = '7days'): Promise<AdminAnalyticsResponseDto> {
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
        prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7days
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 1. Signups Metric
    const currentSignups = await this.userRepository.count({ where: { created_at: MoreThan(startDate) } });
    const prevSignups = await this.userRepository.count({ where: { created_at: Between(prevStartDate, startDate) } });
    const signupsMetric = this.calculateMetric(currentSignups, prevSignups);

    // 2. Revenue Metric
    const currentRevenue = await this.calculateTotalRevenue(startDate, new Date());
    const prevRevenue = await this.calculateTotalRevenue(prevStartDate, startDate);
    const revenueMetric = this.calculateMetric(currentRevenue, prevRevenue, true);

    // 3. Revenue Chart (Last 7 Days always for the chart in the UI)
    const chartStartDate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    const revenueChart = await this.getRevenueChartData(chartStartDate);

    // 4. Top Categories (This Month)
    const topCategories = await this.getTopCategories();

    // 5. Top Businesses (This Month)
    const topBusinesses = await this.getTopBusinesses();

    return {
      visitors: { value: '0', change: '0%', changeType: 'up' }, // Not tracked yet
      signups: signupsMetric,
      revenue: revenueMetric,
      conversionRate: { value: '0%', change: '0%', changeType: 'up' }, // Not tracked yet
      visitorChart: [], // Not tracked yet
      revenueChart,
      topCategories,
      topBusinesses,
      conversionFunnel: [], // Not tracked yet
    };
  }

  private calculateMetric(current: number, prev: number, isCurrency: boolean = false): MetricDto {
    const change = prev === 0 ? 100 : ((current - prev) / prev) * 100;
    const valueStr = isCurrency ? `£${(current / 1000).toFixed(1)}K` : current.toLocaleString();
    return {
      value: valueStr,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      changeType: change >= 0 ? 'up' : 'down',
    };
  }

  private async calculateTotalRevenue(start: Date, end: Date): Promise<number> {
    const [orderSum, bookingSum, membershipSum] = await Promise.all([
      this.orderRepository.createQueryBuilder('o').select('SUM(o.total)', 'sum').where('o.created_at BETWEEN :start AND :end', { start, end }).getRawOne(),
      this.bookingRepository.createQueryBuilder('b').leftJoin('b.payment', 'p').select('SUM(p.amount)', 'sum').where('b.created_at BETWEEN :start AND :end', { start, end }).getRawOne(),
      this.membershipRepository.createQueryBuilder('m').select('SUM(m.amount)', 'sum').where('m.created_at BETWEEN :start AND :end', { start, end }).getRawOne(),
    ]);
    return Number(orderSum?.sum || 0) + Number(bookingSum?.sum || 0) + Number(membershipSum?.sum || 0);
  }

  private async getRevenueChartData(start: Date): Promise<AnalyticsChartPointDto[]> {
    const revenueData = await this.orderRepository
      .createQueryBuilder('o')
      .select("DATE(o.created_at) as date, SUM(o.total) as total")
      .where('o.created_at > :start', { start })
      .groupBy("DATE(o.created_at)")
      .orderBy("DATE(o.created_at)", 'ASC')
      .getRawMany();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return revenueData.map(d => ({
      day: days[new Date(d.date).getDay()],
      value: Number(d.total),
    }));
  }

  private async getTopCategories(): Promise<TopItemDto[]> {
    const data = await this.orderRepository.createQueryBuilder('o')
      .leftJoin('o.items', 'oi')
      .leftJoin('oi.product', 'p')
      .select('p.category', 'name')
      .addSelect('SUM(oi.price * oi.quantity)', 'value')
      .where('o.created_at > :monthStart', { monthStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1) })
      .groupBy('p.category')
      .orderBy('value', 'DESC')
      .limit(5)
      .getRawMany();

    return data.map(d => ({
      name: d.name || 'Uncategorized',
      value: `£${Number(d.value).toLocaleString()}`,
      change: '+0%', // Placeholder
    }));
  }

  private async getTopBusinesses(): Promise<TopItemDto[]> {
    const data = await this.orderRepository.createQueryBuilder('o')
      .leftJoin('o.items', 'oi')
      .leftJoin('oi.product', 'p')
      .leftJoin('p.business', 'b')
      .select('b.businessName', 'name')
      .addSelect('SUM(oi.price * oi.quantity)', 'value')
      .where('o.created_at > :monthStart', { monthStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1) })
      .groupBy('b.businessName')
      .orderBy('value', 'DESC')
      .limit(5)
      .getRawMany();

    return data.map(d => ({
      name: d.name || 'Unknown',
      value: `£${Number(d.value).toLocaleString()}`,
      change: '+0%', // Placeholder
    }));
  }
}
