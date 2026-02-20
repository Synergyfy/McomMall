import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, Like } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateAdminDto, LoginAdminDto } from './dto/admin.dto';
import { AdminDashboardResponseDto } from './dto/dashboard.dto';
import {
  UserStatsDto,
  UserQueryDto,
  PaginatedUsersDto,
  AdminUserDto,
} from './dto/users.dto';
import {
  BusinessStatsDto,
  BusinessQueryDto,
  PaginatedBusinessesDto,
  AdminBusinessDto,
  AdminBusinessListingDto,
} from './dto/businesses.dto';
import {
  ListingStatsDto,
  ListingQueryDto,
  PaginatedListingsDto,
  AdminListingDto,
} from './dto/listings.dto';
import { UpdateBusinessAdminDto } from './dto/update-business.dto';
import { HashService } from 'src/common/hash/hash.service';
import { UserRole } from 'src/common/role.enum';
import { BusinessStatus } from '../listings/listing.enum';
import { ErrorFactory } from 'src/common/errors/error.factory';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly hashService: HashService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    const { email, password, name, phoneNumber } = createAdminDto;

    const emailExists = await this.userService.checkEmailExists(email);
    if (emailExists) {
      throw ErrorFactory.existingEmail();
    }

    const phoneNumberExists =
      await this.userService.checkPhoneNumberExists(phoneNumber);
    if (phoneNumberExists) {
      throw ErrorFactory.existingPhoneNumber();
    }

    const hashedPassword = await this.hashService.hashPassword(password);
    const nameParts = name ? name.split(' ') : ['Admin', 'User'];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });

    await this.userRepository.save(admin);
    delete admin.password;
    return admin;
  }

  async login(loginAdminDto: LoginAdminDto) {
    const { email, password } = loginAdminDto;
    const admin = await this.userService.findCurrentUser(email);

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw ErrorFactory.invalidCredentials();
    }

    const validPassword = await this.authService.comparePassword(
      password,
      email,
    );
    if (!validPassword) {
      throw ErrorFactory.invalidCredentials();
    }

    const { id, role, name } = admin;

    const auth = await this.authService.createLogin({
      sub: id,
      role,
      email,
      name,
      userId: id,
    });

    return { auth, name, role, userId: id };
  }

  async getDashboardData(): Promise<AdminDashboardResponseDto> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Stats
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const totalBusinesses = await this.businessRepository.count();

    // Assuming 'pending' status for products/services. If not used, these might return 0.
    const pendingProducts = await this.productRepository.count({
      where: { productStatus: 'pending' },
    });
    const pendingListings = pendingProducts;

    const newSignups24h = await this.userRepository.count({
      where: { created_at: MoreThan(twentyFourHoursAgo) },
    });

    const ordersTodayQuery = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(order.id)', 'count')
      .addSelect('SUM(order.total)', 'sum')
      .where('order.created_at > :startOfDay', { startOfDay })
      .getRawOne();

    const transactionsToday = Number(ordersTodayQuery?.count || 0);
    const revenueToday = Number(ordersTodayQuery?.sum || 0);

    // 2. Analytics (Last 7 Days)
    const dateMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dateMap.set(d.toISOString().split('T')[0], 0);
    }

    // Signups Chart
    const recentSignups = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.created_at) as date, COUNT(user.id) as count')
      .where('user.created_at > :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(user.created_at)')
      .getRawMany();

    const signupsChart = Array.from(dateMap.keys())
      .map((date) => {
        const found = recentSignups.find((s) => {
          const d =
            s.date instanceof Date
              ? s.date.toISOString().split('T')[0]
              : String(s.date).split('T')[0];
          return d === date;
        });
        return { date, value: found ? Number(found.count) : 0 };
      })
      .reverse();

    // Revenue Chart
    const recentRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.created_at) as date, SUM(order.total) as total')
      .where('order.created_at > :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(order.created_at)')
      .getRawMany();

    const revenueChart = Array.from(dateMap.keys())
      .map((date) => {
        const found = recentRevenue.find((r) => {
          const d =
            r.date instanceof Date
              ? r.date.toISOString().split('T')[0]
              : String(r.date).split('T')[0];
          return d === date;
        });
        return { date, value: found ? Number(found.total) : 0 };
      })
      .reverse();

    // Weekly totals
    const weeklySignups = signupsChart.reduce((sum, day) => sum + day.value, 0);
    const weeklyRevenue = revenueChart.reduce((sum, day) => sum + day.value, 0);

    // 3. Recent Activity (Mix of Users joined and Orders placed)
    const recentUsers = await this.userRepository.find({
      order: { created_at: 'DESC' },
      take: 5,
    });

    const recentOrders = await this.orderRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 5,
    });

    const activities = [
      ...recentUsers.map((u) => ({
        type: 'user',
        message: `New user joined: ${u.name || u.email}`,
        timestamp: u.created_at,
      })),
      ...recentOrders.map((o) => ({
        type: 'order',
        message: `New order #${o.id} by ${o.user?.name || 'Unknown'} for $${o.total}`,
        timestamp: o.created_at,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      stats: {
        pendingListings,
        newSignups24h,
        transactionsToday,
        revenueToday,
        activeUsers,
        totalBusinesses,
      },
      analytics: {
        signups: signupsChart,
        revenue: revenueChart,
        weeklySignups,
        weeklyRevenue,
      },
      recentActivity: activities,
    };
  }

  async getUserStats(): Promise<UserStatsDto> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({
      where: { isActive: true, isEmailVerified: true },
    });
    const suspended = await this.userRepository.count({
      where: { isActive: false },
    });
    const pending = await this.userRepository.count({
      where: { isEmailVerified: false },
    });

    return {
      total,
      active,
      suspended,
      pending,
    };
  }

  async getUsers(query: UserQueryDto): Promise<PaginatedUsersDto> {
    const { search, status, type, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .skip(skip)
      .take(limit)
      .orderBy('user.created_at', 'DESC');

    if (search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        qb.andWhere(
          'user.isActive = :isActive AND user.isEmailVerified = :isEmailVerified',
          { isActive: true, isEmailVerified: true },
        );
      } else if (status === 'suspended' || status === 'banned') {
        qb.andWhere('user.isActive = :isActive', { isActive: false });
      } else if (status === 'pending') {
        qb.andWhere('user.isEmailVerified = :isEmailVerified', {
          isEmailVerified: false,
        });
      }
    }

    if (type && type !== 'all') {
      let role = UserRole.CUSTOMER;
      if (type === 'business') role = UserRole.OWNER;
      if (type === 'admin') role = UserRole.ADMIN;

      qb.andWhere('user.role = :role', { role });
    }

    const [users, total] = await qb.getManyAndCount();

    const mappedUsers: AdminUserDto[] = users.map((user) => {
      let statusStr = 'pending';
      if (user.isActive && user.isEmailVerified) statusStr = 'active';
      else if (!user.isActive) statusStr = 'suspended';

      let accountType: string = user.role;
      if (user.role === UserRole.OWNER) {
        accountType = 'business';
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phoneNumber,
        accountType: accountType,
        status: statusStr,
        walletBalance: Number(user.wallet?.balance || 0),
        lastLogin: user.lastLogin || user.updated_at,
        signupDate: user.created_at,
        verified: user.isEmailVerified,
        avatar: user.profilePictureUrl,
        notes: '',
      };
    });

    return {
      data: mappedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBusinessStats(): Promise<BusinessStatsDto> {
    const total = await this.businessRepository.count();
    const active = await this.businessRepository.count({
      where: { status: BusinessStatus.PUBLISHED },
    });
    const pending = await this.businessRepository.count({
      where: { status: BusinessStatus.DRAFT },
    });
    const verified = await this.businessRepository.count({
      where: { isVerified: true },
    });

    return {
      total,
      active,
      pending,
      verified,
    };
  }

  async getBusinesses(
    query: BusinessQueryDto,
  ): Promise<PaginatedBusinessesDto> {
    const { search, status, sector, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.user', 'user')
      .leftJoinAndSelect('business.location', 'location')
      .leftJoinAndSelect('business.sector', 'sector')
      .leftJoinAndSelect('business.category', 'category')
      .leftJoinAndSelect('business.subCategory', 'subCategory')
      .leftJoinAndSelect('business.reviews', 'review')
      .loadRelationCountAndMap('business.productCount', 'business.products')
      .loadRelationCountAndMap('business.serviceCount', 'business.services')
      .skip(skip)
      .take(limit)
      .orderBy('business.created_at', 'DESC');

    if (search) {
      qb.andWhere(
        '(business.businessName ILIKE :search OR user.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status !== 'all') {
      let businessStatus = BusinessStatus.PUBLISHED;
      if (status === 'pending') businessStatus = BusinessStatus.DRAFT;
      if (status === 'suspended') businessStatus = BusinessStatus.ARCHIVED;
      qb.andWhere('business.status = :status', { status: businessStatus });
    }

    if (sector && sector !== 'all') {
      qb.andWhere('sector.name = :sector', { sector });
    }

    const [businesses, total] = await qb.getManyAndCount();

    const mappedBusinesses: AdminBusinessDto[] = businesses.map((b) => {
      let statusStr = 'active';
      if (b.status === BusinessStatus.DRAFT) statusStr = 'pending';
      if (b.status === BusinessStatus.ARCHIVED) statusStr = 'suspended';

      const reviewCount = b.reviews?.length || 0;
      const totalRating = b.reviews?.reduce((acc, r) => acc + r.rating, 0) || 0;
      const rating = reviewCount > 0 ? totalRating / reviewCount : 0;

      const sectorName = b.sector?.name || 'N/A';
      const categoryName = b.category?.name || 'N/A';

      return {
        id: b.id,
        name: b.businessName,
        owner: b.user?.name || 'Unknown',
        ownerId: b.user?.id || '',
        status: statusStr,
        verified: b.isVerified,
        rating: rating,
        reviewCount: reviewCount,
        listingCount: (b['productCount'] || 0) + (b['serviceCount'] || 0),
        sector: sectorName,
        category: categoryName,
        address: b.location
          ? `${b.location.addressLine1}, ${b.location.city}`
          : 'N/A',
        email: b.businessEmail || 'N/A',
        phone: b.businessPhone || 'N/A',
        createdAt: b.created_at,
        logo: b.logoUrl,
      };
    });

    return {
      data: mappedBusinesses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBusinessListings(
    businessId: string,
  ): Promise<AdminBusinessListingDto[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['products', 'services'],
    });

    if (!business) throw new NotFoundException('Business not found');

    const productListings: AdminBusinessListingDto[] = (
      business.products || []
    ).map((p) => ({
      id: p.id,
      name: p.title,
      price: p.price,
      status: p.productStatus,
      type: 'product',
    }));

    const serviceListings: AdminBusinessListingDto[] = (
      business.services || []
    ).map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.fixedPrice || s.pricePerHour || s.pricePerUnit || 0),
      status: s.status,
      type: 'service',
    }));

    return [...productListings, ...serviceListings];
  }

  async verifyBusiness(id: string, isVerified: boolean) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');
    return this.businessRepository.update(id, { isVerified });
  }

  async updateBusinessStatus(id: string, status: BusinessStatus) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');
    return this.businessRepository.update(id, { status });
  }

  async updateBusiness(
    id: string,
    updateBusinessAdminDto: UpdateBusinessAdminDto,
  ) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');

    this.businessRepository.merge(business, updateBusinessAdminDto);
    return this.businessRepository.save(business);
  }

  async getListingStats(): Promise<ListingStatsDto> {
    const [
      pTotal,
      sTotal,
      pPending,
      sPending,
      pApproved,
      sApproved,
      pFeatured,
      sFeatured,
    ] = await Promise.all([
      this.productRepository.count(),
      this.serviceRepository.count(),
      this.productRepository.count({ where: { productStatus: 'pending' } }),
      this.serviceRepository.count({ where: { status: 'pending' } }),
      this.productRepository.count({ where: { productStatus: 'published' } }),
      this.serviceRepository.count({ where: { status: 'published' } }),
      this.productRepository.count({ where: { isFeatured: true } }),
      this.serviceRepository.count({ where: { isFeatured: true } }),
    ]);

    return {
      total: pTotal + sTotal,
      pending: pPending + sPending,
      approved: pApproved + sApproved,
      featured: pFeatured + sFeatured,
    };
  }

  async getListings(query: ListingQueryDto): Promise<PaginatedListingsDto> {
    const { search, status, category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.user', 'user')
      .leftJoinAndSelect('business.location', 'location')
      .leftJoinAndSelect('business.sector', 'sector')
      .leftJoinAndSelect('business.category', 'category')
      .leftJoinAndSelect('business.reviews', 'reviews')
      .take(limit)
      .skip(skip)
      .orderBy('business.created_at', 'DESC');

    if (search) {
      qb.andWhere(
        '(business.businessName ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('business.status = :status', { status });
    }

    if (category) {
      qb.andWhere('category.name = :category', { category });
    }

    const [listings, total] = await qb.getManyAndCount();

    const mappedData: AdminListingDto[] = listings.map((b) => {
      // Basic rating calculation
      const rating = b.reviews?.length
        ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length
        : 0;

      return {
        id: b.id,
        businessName: b.businessName,
        ownerName: b.user
          ? `${b.user.firstName} ${b.user.lastName}`
          : 'Unknown',
        ownerEmail: b.user?.email || '',
        category: b.category?.name || 'Uncategorized',
        sector: b.sector?.name || 'N/A',
        status: b.status,
        isVerified: b.isVerified,
        rating: Number(rating.toFixed(1)),
        reviewCount: b.reviews?.length || 0,
        location: b.location
          ? `${b.location.addressLine1}, ${b.location.city}`
          : 'No Location',
        description: b.shortDescription,
        images: b.media || [],
        createdAt: b.created_at,
      };
    });

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Helper methods for product/service actions (updateListingStatus, toggleListingFeatured)
  // are likely no longer applicable or need to be moved to Products/Services admin service
  // but keeping them blank/refactored if needed, or removing if AdminListingDto no longer supports them.
  // Since AdminListingDto changed, these methods are likely broken or irrelevant for "Listings" context.
  // I will comment them out or update them to work on Business if applicable, but user asked for "Listings = Businesses".
  // Assuming business status and verification are the new actions.

  async updateListingStatus(id: string, status: string) {
    const exists = await this.businessRepository.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Business not found');
    // Map string status to BusinessStatus enum if needed, or use as is if types match
    return this.businessRepository.update(id, {
      status: status as BusinessStatus,
    });
  }

  // Featured logic for businesses isn't in the entity by default, skipping or removing validation error
  // async toggleListingFeatured(id: string, isFeatured: boolean) { ... }
}
