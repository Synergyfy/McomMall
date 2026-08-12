export const MOCK_BYPASS = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';

const MOCK_USER = {
  userId: 'mock-user-001',
  name: 'Demo User',
  email: 'demo@mcommall.com',
  role: 'owner',
  packageInfo: { planType: 'enterprise' },
  auth: {
    accessToken: 'mock-access-token-bypass',
    refreshToken: 'mock-refresh-token-bypass',
  },
};

const MOCK_BUSINESS = {
  id: 'biz-mock-001',
  name: 'Brew & Co.',
  category: 'Coffee Shop',
  description: 'Premium artisan coffee shop in the heart of the high street.',
  address: '123 High Street, London, N1 1AA',
  phone: '+44 20 7946 0958',
  email: 'hello@brewandco.com',
  website: 'https://brewandco.com',
  ownerUserId: 'mock-user-001',
  isVerified: true,
  status: 'active',
  rating: 4.8,
  reviewCount: 247,
  imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
  location: { lat: 51.5353, lng: -0.1234 },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2025-08-01T14:30:00Z',
};

const MOCK_LISTINGS = [
  { ...MOCK_BUSINESS, id: 'biz-mock-001', type: 'listing' },
  { ...MOCK_BUSINESS, id: 'biz-mock-002', name: 'Urban Threads', category: 'Fashion', rating: 4.6, reviewCount: 183 },
  { ...MOCK_BUSINESS, id: 'biz-mock-003', name: 'Peak Performance Gym', category: 'Fitness', rating: 4.9, reviewCount: 312 },
  { ...MOCK_BUSINESS, id: 'biz-mock-004', name: 'The Italian Kitchen', category: 'Restaurant', rating: 4.7, reviewCount: 198 },
];

const MOCK_SERVICES = [
  { id: 'svc-001', businessId: 'biz-mock-001', name: 'Espresso', description: 'Single or double shot espresso', price: 3.50, duration: 5, category: 'Coffee', isActive: true },
  { id: 'svc-002', businessId: 'biz-mock-001', name: 'Latte', description: 'Classic latte with steamed milk', price: 4.00, duration: 5, category: 'Coffee', isActive: true },
  { id: 'svc-003', businessId: 'biz-mock-001', name: 'Cappuccino', description: 'Traditional cappuccino', price: 4.00, duration: 5, category: 'Coffee', isActive: true },
  { id: 'svc-004', businessId: 'biz-mock-001', name: 'Flat White', description: 'Double shot flat white', price: 4.50, duration: 5, category: 'Coffee', isActive: true },
];

const MOCK_COUPONS = [
  { id: 'cpn-001', businessId: 'biz-mock-001', title: '10% Off All Drinks', description: 'Get 10% off any handcrafted beverage', discountType: 'percentage', discountValue: 10, code: 'DRINK10', maxUses: 100, currentUses: 45, startDate: '2025-08-01', endDate: '2025-09-01', isActive: true, minPurchase: 0 },
  { id: 'cpn-002', businessId: 'biz-mock-001', title: 'Free Pastry', description: 'Free pastry with any large coffee', discountType: 'free_item', discountValue: 0, code: 'PASTRY', maxUses: 50, currentUses: 23, startDate: '2025-08-01', endDate: '2025-08-31', isActive: true, minPurchase: 4.00 },
  { id: 'cpn-003', businessId: 'biz-mock-001', title: 'BOGO Coffee', description: 'Buy one coffee, get one free', discountType: 'bogo', discountValue: 0, code: 'BOGO', maxUses: 200, currentUses: 89, startDate: '2025-08-05', endDate: '2025-08-15', isActive: true, minPurchase: 0 },
  { id: 'cpn-004', businessId: 'biz-mock-001', title: '£5 Off Weekend Brunch', description: 'Save £5 on weekend brunch orders over £20', discountType: 'fixed', discountValue: 5, code: 'BRUNCH5', maxUses: 75, currentUses: 31, startDate: '2025-08-01', endDate: '2025-10-01', isActive: true, minPurchase: 20 },
];

const MOCK_OFFERS = [
  { id: 'off-001', businessId: 'biz-mock-001', title: 'Happy Hour Special', description: '50% off all drinks between 4pm-6pm', loyaltyPoints: 100, discountType: 'percentage', discountValue: 50, isActive: true, startDate: '2025-08-01', endDate: '2025-12-31', validDays: ['mon', 'tue', 'wed', 'thu', 'fri'] },
  { id: 'off-002', businessId: 'biz-mock-001', title: 'Double Points Tuesday', description: 'Earn 2x loyalty points every Tuesday', loyaltyPoints: 50, discountType: 'loyalty_multiplier', discountValue: 2, isActive: true, startDate: '2025-08-01', endDate: '2025-12-31', validDays: ['tue'] },
];

const MOCK_GIFT_CARDS = [
  { id: 'gc-001', businessId: 'biz-mock-001', title: 'Brew & Co Gift Card', value: 25, currency: 'GBP', isActive: true, remainingBalance: 25, code: 'GIFT-XXXX-1234', createdAt: '2025-08-01' },
  { id: 'gc-002', businessId: 'biz-mock-001', title: 'Brew & Co Gift Card', value: 50, currency: 'GBP', isActive: true, remainingBalance: 50, code: 'GIFT-XXXX-5678', createdAt: '2025-08-05' },
];

const MOCK_VOUCHERS = [
  { id: 'vch-001', businessId: 'biz-mock-001', title: 'Coffee Voucher', value: 5, currency: 'GBP', isActive: true, isUsed: false, code: 'VCH-COFFEE-001', createdAt: '2025-08-01' },
];

const MOCK_CAMPAIGNS = [
  { id: 'cmp-001', businessId: 'biz-mock-001', title: 'Summer Coffee Festival', description: 'Celebrate summer with special coffee blends and discounts', status: 'active', startDate: '2025-06-01', endDate: '2025-09-30', budget: 500, spent: 175, impressions: 12400, clicks: 890 },
  { id: 'cmp-002', businessId: 'biz-mock-001', title: 'Back to Office Campaign', description: 'Welcome back workers! Special lunch deals for office workers', status: 'scheduled', startDate: '2025-09-01', endDate: '2025-10-31', budget: 300, spent: 0, impressions: 0, clicks: 0 },
];

const MOCK_AUTOMATIONS = [
  { id: 'auto-001', businessId: 'biz-mock-001', name: 'Welcome New Customers', type: 'welcome', isActive: true, trigger: 'first_visit', action: 'send_coupon', lastTriggered: '2025-08-10T14:00:00Z', totalTriggered: 34 },
  { id: 'auto-002', businessId: 'biz-mock-001', name: 'Loyalty Milestone Reward', type: 'loyalty', isActive: true, trigger: 'points_1000', action: 'send_voucher', lastTriggered: '2025-08-08T10:00:00Z', totalTriggered: 12 },
  { id: 'auto-003', businessId: 'biz-mock-001', name: 'Re-engagement Campaign', type: 'reengagement', isActive: false, trigger: 'inactive_30_days', action: 'send_notification', lastTriggered: null, totalTriggered: 0 },
];

const MOCK_PARTNERSHIPS = [
  { id: 'ptr-001', businessId: 'biz-mock-001', partnerBusinessId: 'biz-mock-002', partnerName: 'Urban Threads', status: 'active', type: 'cross_promotion', createdAt: '2025-07-01' },
  { id: 'ptr-002', businessId: 'biz-mock-001', partnerBusinessId: 'biz-mock-003', partnerName: 'Peak Performance Gym', status: 'pending', type: 'referral', createdAt: '2025-08-10' },
];

const MOCK_STATS = {
  overview: {
    totalCustomers: 1247,
    totalRevenue: 34500,
    totalCouponsRedeemed: 312,
    totalOrders: 892,
    averageOrderValue: 38.67,
    revenueGrowth: 12.5,
    customerGrowth: 8.3,
    topProduct: 'Espresso',
    conversionRate: 4.2,
  },
  chartData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    revenue: [3200, 3800, 4100, 3900, 4500, 4800, 5200, 5100],
    customers: [95, 110, 125, 118, 140, 155, 170, 165],
    orders: [65, 78, 82, 79, 95, 105, 118, 112],
  },
  traffic: {
    sources: [
      { name: 'Direct', value: 4500 },
      { name: 'Social Media', value: 3200 },
      { name: 'Search', value: 2800 },
      { name: 'Referral', value: 1500 },
    ],
    weekly: [120, 145, 132, 168, 155, 140, 175],
  },
  salesAndRedemptions: [
    { date: '2025-08-01', sales: 12, redemptions: 8, revenue: 456 },
    { date: '2025-08-02', sales: 15, redemptions: 11, revenue: 523 },
    { date: '2025-08-03', sales: 18, redemptions: 14, revenue: 612 },
    { date: '2025-08-04', sales: 10, redemptions: 7, revenue: 389 },
    { date: '2025-08-05', sales: 22, redemptions: 18, revenue: 745 },
    { date: '2025-08-06', sales: 20, redemptions: 16, revenue: 698 },
    { date: '2025-08-07', sales: 25, redemptions: 20, revenue: 812 },
    { date: '2025-08-08', sales: 19, redemptions: 15, revenue: 667 },
    { date: '2025-08-09', sales: 28, redemptions: 22, revenue: 901 },
    { date: '2025-08-10', sales: 24, redemptions: 19, revenue: 789 },
  ],
};

const MOCK_WALLET = {
  balance: 125.50,
  currency: 'GBP',
  transactions: [
    { id: 'txn-001', type: 'credit', amount: 50, description: 'Gift card purchase', date: '2025-08-01' },
    { id: 'txn-002', type: 'debit', amount: 12.50, description: 'Coffee purchase', date: '2025-08-05' },
    { id: 'txn-003', type: 'credit', amount: 100, description: 'Cashback reward', date: '2025-08-08' },
    { id: 'txn-004', type: 'debit', amount: 12, description: 'Lunch order', date: '2025-08-10' },
  ],
};

const MOCK_NOTIFICATIONS = [
  { id: 'ntf-001', title: 'New coupon redeemed', message: 'Customer used DRINK10 coupon at your store', isRead: false, createdAt: '2025-08-10T14:30:00Z', type: 'coupon' },
  { id: 'ntf-002', title: 'Partnership request', message: 'Urban Threads wants to partner with you', isRead: false, createdAt: '2025-08-10T10:00:00Z', type: 'partnership' },
  { id: 'ntf-003', title: 'Campaign performance', message: 'Your Summer Coffee Festival campaign reached 12,400 impressions', isRead: true, createdAt: '2025-08-09T18:00:00Z', type: 'campaign' },
  { id: 'ntf-004', title: 'New review', message: 'A customer left a 5-star review', isRead: true, createdAt: '2025-08-08T12:00:00Z', type: 'review' },
];

const MOCK_MESSAGES = {
  conversations: [
    { id: 'conv-001', name: 'Urban Threads', lastMessage: 'Partnership sounds great!', unreadCount: 1, updatedAt: '2025-08-10T14:00:00Z' },
    { id: 'conv-002', name: 'Peak Performance Gym', lastMessage: 'Can we schedule a call?', unreadCount: 0, updatedAt: '2025-08-09T16:00:00Z' },
  ],
  messages: [
    { id: 'msg-001', conversationId: 'conv-001', senderId: 'other', content: 'Hey! Love your coffee shop.', timestamp: '2025-08-10T13:00:00Z' },
    { id: 'msg-002', conversationId: 'conv-001', senderId: 'mock-user-001', content: 'Thanks! Would love to partner.', timestamp: '2025-08-10T13:30:00Z' },
    { id: 'msg-003', conversationId: 'conv-001', senderId: 'other', content: 'Partnership sounds great!', timestamp: '2025-08-10T14:00:00Z' },
  ],
};

const MOCK_GAMIFICATION = {
  games: [
    { id: 'game-001', name: 'Spin the Wheel', type: 'spin', isActive: true, participants: 234, prizes: ['10% Off', 'Free Coffee', 'Double Points'] },
    { id: 'game-002', name: 'Scratch Card', type: 'scratch', isActive: true, participants: 189, prizes: ['£5 Voucher', 'Free Pastry', '50 Points'] },
  ],
};

const MOCK_EVENTS = [
  { id: 'evt-001', businessId: 'biz-mock-001', title: 'Latte Art Workshop', description: 'Learn the art of latte creation', startDate: '2025-08-15T18:00:00Z', endDate: '2025-08-15T20:00:00Z', location: 'Brew & Co', maxAttendees: 20, currentAttendees: 15, status: 'live', price: 15 },
  { id: 'evt-002', businessId: 'biz-mock-001', title: 'Coffee Tasting Night', description: 'Sample our new seasonal blends', startDate: '2025-08-22T19:00:00Z', endDate: '2025-08-22T21:00:00Z', location: 'Brew & Co', maxAttendees: 30, currentAttendees: 8, status: 'upcoming', price: 0 },
];

const MOCK_VISIBILITY = {
  businessId: 'biz-mock-001',
  isVisible: true,
  showInSearch: true,
  showOnMap: true,
  showContactInfo: true,
  showReviews: true,
  premiumListing: false,
  boostedUntil: null,
};

const MOCK_QR_CODES = [
  { id: 'qr-001', businessId: 'biz-mock-001', title: 'Table Menu QR', type: 'menu', isActive: true, scans: 456, createdAt: '2025-07-01', url: 'https://mcommall.com/biz/biz-mock-001' },
  { id: 'qr-002', businessId: 'biz-mock-001', title: 'Loyalty Sign-up QR', type: 'loyalty', isActive: true, scans: 234, createdAt: '2025-07-15', url: 'https://mcommall.com/loyalty/biz-mock-001' },
];

const MOCK_DEALS = [
  { id: 'deal-001', businessId: 'biz-mock-001', title: 'Early Bird Coffee Deal', description: '50% off before 8am', discount: 50, isActive: true, startDate: '2025-08-01', endDate: '2025-09-30', validHours: { from: '06:00', to: '08:00' } },
  { id: 'deal-002', businessId: 'biz-mock-001', title: 'Student Discount', description: '20% off with valid student ID', discount: 20, isActive: true, startDate: '2025-08-01', endDate: '2025-12-31' },
];

const MOCK_SUPPORT_TICKETS = [
  { id: 'tkt-001', businessId: 'biz-mock-001', subject: 'Payment issue', description: 'I was charged twice for my order', status: 'open', priority: 'high', createdAt: '2025-08-10', updatedAt: '2025-08-10' },
];

const MOCK_MEMBERSHIP = {
  planType: 'enterprise',
  status: 'active',
  startDate: '2025-01-01',
  endDate: '2026-01-01',
  features: ['unlimited_coupons', 'advanced_analytics', 'priority_support', 'custom_branding'],
};

const MOCK_READINESS = {
  score: 85,
  completeness: {
    profile: 100,
    photos: 90,
    hours: 100,
    description: 80,
    menu: 75,
  },
  recommendations: ['Add more photos', 'Complete your menu items', 'Add a description for your business'],
};

const MOCK_BOROUGH_CAMPAIGNS = [
  { id: 'bc-001', borough: 'Islington', title: 'Islington Food Festival', description: 'Join 50+ restaurants for the annual food festival', status: 'active', participants: 34, endDate: '2025-09-15' },
  { id: 'bc-002', borough: 'Camden', title: 'Camden Market Week', description: 'Special discounts at Camden Market stalls', status: 'upcoming', participants: 28, endDate: '2025-10-01' },
];

const MOCK_CLAIMS = [
  { id: 'clm-001', businessId: 'biz-mock-001', type: 'local_activation', title: 'First 50 Customers', description: 'Free coffee for the first 50 customers this Saturday', status: 'active', startDate: '2025-08-16', endDate: '2025-08-16', claimedCount: 23 },
];

const MOCK_PRODUCTS = [
  { id: 'prod-001', businessId: 'biz-mock-001', name: 'House Blend Beans', description: '250g bag of our signature house blend', price: 12.99, category: 'Retail', isActive: true, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400' },
  { id: 'prod-002', businessId: 'biz-mock-001', name: 'Brew & Co Mug', description: 'Ceramic mug with Brew & Co branding', price: 15.99, category: 'Merchandise', isActive: true, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400' },
  { id: 'prod-003', businessId: 'biz-mock-001', name: 'Cold Brew Bottle', description: '500ml ready-to-drink cold brew', price: 5.99, category: 'Drinks', isActive: true, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400' },
];

const MOCK_HISTORY = [
  { id: 'hst-001', type: 'coupon_redeemed', title: 'DRINK10 coupon redeemed', amount: -3.50, date: '2025-08-10', businessName: 'Brew & Co' },
  { id: 'hst-002', type: 'purchase', title: 'Latte purchase', amount: -4.00, date: '2025-08-09', businessName: 'Brew & Co' },
  { id: 'hst-003', type: 'gift_card', title: 'Gift card loaded', amount: 50.00, date: '2025-08-08', businessName: 'Brew & Co' },
];

const MOCK_INTEREST_SIGNALS = [
  { id: 'sig-001', businessId: 'biz-mock-001', customerName: 'Alice M.', signal: 'interested', category: 'Coffee', timestamp: '2025-08-10T14:00:00Z' },
  { id: 'sig-002', businessId: 'biz-mock-001', customerName: 'Bob K.', signal: 'visited', category: 'Coffee', timestamp: '2025-08-10T12:00:00Z' },
  { id: 'sig-003', businessId: 'biz-mock-001', customerName: 'Charlie P.', signal: 'redeemed', category: 'Pastries', timestamp: '2025-08-10T10:00:00Z' },
];

const MOCK_TEAM = [
  { id: 'usr-001', name: 'Demo User', email: 'demo@mcommall.com', role: 'owner', status: 'active', lastActive: '2025-08-10T14:00:00Z' },
  { id: 'usr-002', name: 'Staff Member', email: 'staff@mcommall.com', role: 'staff', status: 'active', lastActive: '2025-08-10T12:00:00Z' },
];

const MOCK_AUDITS = [
  { id: 'aud-001', action: 'coupon_created', userId: 'mock-user-001', details: 'Created coupon: 10% Off All Drinks', timestamp: '2025-08-10T14:00:00Z' },
  { id: 'aud-002', action: 'settings_updated', userId: 'mock-user-001', details: 'Updated business hours', timestamp: '2025-08-09T10:00:00Z' },
];

const MOCK_SHIPPING = {
  methods: [
    { id: 'ship-001', name: 'Standard Delivery', price: 3.99, estimatedDays: '3-5 business days', isActive: true },
    { id: 'ship-002', name: 'Express Delivery', price: 7.99, estimatedDays: '1-2 business days', isActive: true },
    { id: 'ship-003', name: 'Store Pickup', price: 0, estimatedDays: 'Ready in 2 hours', isActive: true },
  ],
};

const MOCK_REVIEWS = [
  { id: 'rev-001', businessId: 'biz-mock-001', customerName: 'Alice M.', rating: 5, comment: 'Amazing coffee! Best in the area.', date: '2025-08-10' },
  { id: 'rev-002', businessId: 'biz-mock-001', customerName: 'Bob K.', rating: 4, comment: 'Great atmosphere, friendly staff.', date: '2025-08-09' },
  { id: 'rev-003', businessId: 'biz-mock-001', customerName: 'Charlie P.', rating: 5, comment: 'Love the cold brew!', date: '2025-08-08' },
];

const MOCK_HIGH_STREET = {
  name: 'High Street Islington',
  readiness: 85,
  borough: 'Islington',
  totalBusinesses: 45,
  activePromotions: 12,
  eventsThisMonth: 3,
};

const MOCK_CASHBACK = {
  balance: 45.00,
  totalEarned: 125.50,
  pendingPayout: 20.00,
  transactions: [
    { id: 'cb-001', amount: 2.50, description: 'Cashback from coffee purchase', date: '2025-08-10' },
    { id: 'cb-002', amount: 1.50, description: 'Cashback from lunch order', date: '2025-08-09' },
  ],
};

const MOCK_ROTATORS = [
  { id: 'rot-001', businessId: 'biz-mock-001', name: 'Morning Deals', status: 'active', items: ['Early Bird Coffee', 'Breakfast Bundle'], schedule: '06:00-12:00' },
  { id: 'rot-002', businessId: 'biz-mock-001', name: 'Afternoon Picks', status: 'paused', items: ['Lunch Special', 'Afternoon Tea'], schedule: '12:00-17:00' },
];

const MOCK_PROMOTIONS = [
  { id: 'pr-001', businessId: 'biz-mock-001', title: 'Summer Sale', type: 'seasonal', discount: 20, status: 'active', startDate: '2025-06-01', endDate: '2025-09-30' },
  { id: 'pr-002', businessId: 'biz-mock-001', title: 'Flash Friday', type: 'flash', discount: 30, status: 'scheduled', startDate: '2025-08-15', endDate: '2025-08-15' },
];

const MOCK_STRIPE_INTENT = {
  clientSecret: 'mock-stripe-client-secret',
  paymentIntentId: 'mock-pi-001',
};

const MOCK_PAYPAL_ORDER = {
  orderId: 'mock-paypal-order-001',
  status: 'created',
};

type MockRouteHandler = (method: string, path: string, data?: any) => any;

const routeHandlers: MockRouteHandler = (method, path, data) => {
  const p = path.replace(/\/+$/, '').replace(/^\//, '');

  // Auth routes
  if (p === 'auth' && method === 'POST') return MOCK_USER;
  if (p === 'auth/refresh' && method === 'POST') return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
  if (p === 'auth/sso' && method === 'POST') return MOCK_USER;
  if (p === 'auth/logout' && method === 'POST') return { success: true };
  if (p === 'auth/me' && method === 'GET') return MOCK_USER;
  if (p.startsWith('users/check-email')) return { available: true };
  if (p === 'users/create' && method === 'POST') return MOCK_USER;
  if (p.startsWith('users/me') && method === 'GET') return MOCK_USER;

  // Businesses
  if (p === 'businesses/my-profile' && method === 'GET') return MOCK_BUSINESS;
  if (p.startsWith('businesses/') && !p.includes('/') && method === 'GET') return MOCK_BUSINESS;
  if (p === 'businesses' && method === 'GET') return MOCK_LISTINGS;

  // Listings
  if (p === 'listings/mine' && method === 'GET') return MOCK_LISTINGS;
  if (p === 'listings' && method === 'GET') return MOCK_LISTINGS;
  if (p.startsWith('listings/') && method === 'GET') return MOCK_BUSINESS;
  if (p.startsWith('listings/') && method === 'PATCH') return { ...MOCK_BUSINESS, ...data };

  // Services
  if (p === 'services' && method === 'GET') return MOCK_SERVICES;
  if (p === 'services' && method === 'POST') return { id: 'svc-new', ...data };
  if (p.startsWith('services/mine') && method === 'GET') return MOCK_SERVICES;
  if (p.startsWith('services/business/') && method === 'GET') return MOCK_SERVICES;
  if (p.startsWith('services/') && method === 'GET') return MOCK_SERVICES[0];
  if (p.startsWith('services/') && method === 'PATCH') return { ...MOCK_SERVICES[0], ...data };
  if (p.startsWith('services/') && method === 'DELETE') return { success: true };
  if (p === 'services/spare-capacity' && method === 'POST') return { success: true, capacity: 5 };

  // Coupons
  if (p === 'coupons' && method === 'GET') return MOCK_COUPONS;
  if (p === 'coupons' && method === 'POST') return { id: 'cpn-new', ...data };
  if (p === 'coupons/mine' && method === 'GET') return MOCK_COUPONS;
  if (p.startsWith('coupons/') && method === 'GET') return MOCK_COUPONS[0];
  if (p.startsWith('coupons/') && method === 'PATCH') return { ...MOCK_COUPONS[0], ...data };
  if (p.startsWith('coupons/') && method === 'DELETE') return { success: true };
  if (p === 'coupons/save' && method === 'POST') return { success: true };
  if (p === 'coupons/remove-saved' && method === 'POST') return { success: true };

  // Coupon Products (business owner view)
  if (p === 'business/coupons/stats' && method === 'GET') return { totalCoupons: MOCK_COUPONS.length, totalRedemptions: 312, totalValue: 4500, conversionRate: 4.2 };
  if (p === 'business/coupons/chart-data' && method === 'GET') return MOCK_STATS.chartData;
  if (p === 'business/coupons/sales-and-redemptions' && method === 'GET') return MOCK_STATS.salesAndRedemptions;
  if (p === 'business/coupon-products' && method === 'GET') return MOCK_COUPONS;
  if (p === 'business/coupon-products' && method === 'POST') return { id: 'cpn-new', ...data };

  // Offers
  if (p === 'offer' && method === 'GET') return MOCK_OFFERS;
  if (p === 'offer' && method === 'POST') return { id: 'off-new', ...data };
  if (p.startsWith('offer/') && method === 'GET') return MOCK_OFFERS[0];
  if (p.startsWith('offer/') && method === 'PATCH') return { ...MOCK_OFFERS[0], ...data };
  if (p.startsWith('offer/') && method === 'DELETE') return { success: true };

  // Gift Cards
  if (p === 'gift-cards' && method === 'GET') return MOCK_GIFT_CARDS;
  if (p === 'merchant/gift-cards' && method === 'POST') return { id: 'gc-new', ...data };
  if (p.startsWith('gift-cards/') && method === 'GET') return MOCK_GIFT_CARDS[0];

  // Vouchers
  if (p === 'vouchers' && method === 'GET') return MOCK_VOUCHERS;
  if (p === 'vouchers' && method === 'POST') return { id: 'vch-new', ...data };
  if (p.startsWith('vouchers/verify-purchase') && method === 'POST') return { valid: true, voucher: MOCK_VOUCHERS[0] };
  if (p.startsWith('vouchers/') && method === 'POST') return MOCK_VOUCHERS[0];

  // Campaigns
  if (p === 'campaigns' && method === 'GET') return MOCK_CAMPAIGNS;
  if (p === 'campaigns' && method === 'POST') return { id: 'cmp-new', ...data };
  if (p.startsWith('campaigns/') && method === 'GET') return MOCK_CAMPAIGNS[0];
  if (p.startsWith('campaigns/') && method === 'PATCH') return { ...MOCK_CAMPAIGNS[0], ...data };

  // Automations
  if (p === 'automations' && method === 'GET') return MOCK_AUTOMATIONS;
  if (p === 'automations/summary' && method === 'GET') return { total: MOCK_AUTOMATIONS.length, active: MOCK_AUTOMATIONS.filter(a => a.isActive).length };
  if (p === 'automations' && method === 'POST') return { id: 'auto-new', ...data };
  if (p.startsWith('automations/') && method === 'PATCH') return { ...MOCK_AUTOMATIONS[0], ...data };
  if (p.startsWith('automations/') && method === 'DELETE') return { success: true };

  // Partnerships
  if (p === 'partnerships' && method === 'GET') return MOCK_PARTNERSHIPS;
  if (p === 'partnerships' && method === 'POST') return { id: 'ptr-new', ...data };
  if (p === 'partnerships/my-partners' && method === 'GET') return MOCK_PARTNERSHIPS.filter(p => p.status === 'active');
  if (p === 'partnerships/requests/user/received' && method === 'GET') return MOCK_PARTNERSHIPS.filter(p => p.status === 'pending');
  if (p.startsWith('partnerships/search-owners') && method === 'GET') return MOCK_LISTINGS;
  if (p.startsWith('partnerships/user-request') && method === 'POST') return { success: true };
  if (p.startsWith('partnerships/') && method === 'GET') return MOCK_PARTNERSHIPS[0];
  if (p.startsWith('partnerships/') && method === 'PATCH') return { ...MOCK_PARTNERSHIPS[0], ...data };

  // Stats
  if (p === 'stats/overview' && method === 'GET') return MOCK_STATS.overview;
  if (p === 'stats/chart-data' && method === 'GET') return MOCK_STATS.chartData;
  if (p === 'stats/traffic' && method === 'GET') return MOCK_STATS.traffic;

  // Wallet
  if (p === 'wallet' && method === 'GET') return MOCK_WALLET;
  if (p === 'wallet/fund/initiate' && method === 'POST') return MOCK_STRIPE_INTENT;
  if (p === 'wallet/fund/verify' && method === 'POST') return { success: true, balance: 175.50 };
  if (p === 'wallet/transactions' && method === 'GET') return MOCK_WALLET.transactions;

  // Notifications
  if (p === 'notifications' && method === 'GET') return MOCK_NOTIFICATIONS;
  if (p === 'notifications/seen' && method === 'POST') return { success: true };
  if (p.startsWith('notifications/') && method === 'PATCH') return { success: true };

  // Messaging
  if (p === 'messaging/conversations' && method === 'GET') return MOCK_MESSAGES.conversations;
  if (p.startsWith('messaging/conversations/') && method === 'GET') return MOCK_MESSAGES.messages;
  if (p === 'messaging' && method === 'POST') return { id: 'msg-new', ...data };

  // Support tickets
  if (p === 'support-tickets' && method === 'GET') return MOCK_SUPPORT_TICKETS;
  if (p === 'support-tickets' && method === 'POST') return { id: 'tkt-new', ...data };

  // Gamification
  if (p === 'gamification/my-games' && method === 'GET') return MOCK_GAMIFICATION.games;
  if (p === 'gamification' && method === 'GET') return MOCK_GAMIFICATION.games;
  if (p === 'gamification' && method === 'POST') return { id: 'game-new', ...data };
  if (p.startsWith('gamification/') && method === 'GET') return MOCK_GAMIFICATION.games[0];
  if (p.startsWith('gamification/') && method === 'DELETE') return { success: true };

  // Events
  if (p === 'events' && method === 'GET') return MOCK_EVENTS;
  if (p === 'events' && method === 'POST') return { id: 'evt-new', ...data };
  if (p === 'events/my-events' && method === 'GET') return MOCK_EVENTS;
  if (p.startsWith('events/') && method === 'GET') return MOCK_EVENTS[0];
  if (p.startsWith('events/') && method === 'PATCH') return { ...MOCK_EVENTS[0], ...data };

  // Visibility
  if (p.startsWith('visibility/') && method === 'GET') return MOCK_VISIBILITY;
  if (p.startsWith('visibility/') && method === 'PATCH') return { ...MOCK_VISIBILITY, ...data };

  // QR Codes
  if (p === 'qr-codes' && method === 'GET') return MOCK_QR_CODES;
  if (p === 'qr-codes' && method === 'POST') return { id: 'qr-new', ...data };
  if (p.startsWith('qr-codes/') && method === 'GET') return MOCK_QR_CODES[0];
  if (p.startsWith('qr-codes/') && method === 'PATCH') return { ...MOCK_QR_CODES[0], ...data };
  if (p.startsWith('qr-codes/') && method === 'DELETE') return { success: true };

  // Deals
  if (p === 'deals' && method === 'GET') return MOCK_DEALS;
  if (p === 'deals/mine' && method === 'GET') return MOCK_DEALS;
  if (p.startsWith('deals/') && method === 'GET') return MOCK_DEALS[0];

  // Interest Signals
  if (p.startsWith('interest-signals/') && method === 'GET') return MOCK_INTEREST_SIGNALS;
  if (p.startsWith('interest-signals/') && method === 'POST') return { success: true };

  // High Street
  if (p === 'high-street/readiness' && method === 'GET') return MOCK_READINESS;

  // Borough Campaigns
  if (p === 'borough-campaigns' && method === 'GET') return MOCK_BOROUGH_CAMPAIGNS;
  if (p.startsWith('borough-campaigns/') && method === 'POST') return { success: true };

  // Claims
  if (p === 'claims' && method === 'GET') return MOCK_CLAIMS;
  if (p.startsWith('claims/') && method === 'PATCH') return { ...MOCK_CLAIMS[0], ...data };

  // Products
  if (p === 'product/mine' && method === 'GET') return MOCK_PRODUCTS;
  if (p === 'product' && method === 'GET') return MOCK_PRODUCTS;

  // History
  if (p === 'history' && method === 'GET') return MOCK_HISTORY;
  if (p === 'history/transactions' && method === 'GET') return MOCK_HISTORY;

  // Cashback
  if (p === 'cashback' && method === 'GET') return MOCK_CASHBACK;

  // Rotators
  if (p === 'rotators/my-rotators' && method === 'GET') return MOCK_ROTATORS;
  if (p === 'rotators' && method === 'GET') return MOCK_ROTATORS;
  if (p === 'rotators' && method === 'POST') return { id: 'rot-new', ...data };
  if (p.startsWith('rotators/') && method === 'PATCH') return { ...MOCK_ROTATORS[0], ...data };
  if (p.startsWith('rotators/') && method === 'DELETE') return { success: true };

  // Promotions
  if (p === 'promotions/my-participations' && method === 'GET') return MOCK_PROMOTIONS;

  // Membership
  if (p === 'membership/initiate-payment' && method === 'POST') return MOCK_STRIPE_INTENT;
  if (p === 'membership/verify-payment' && method === 'POST') return { success: true, membership: MOCK_MEMBERSHIP };
  if (p === 'membership/join-trial' && method === 'POST') return { success: true, trial: { endDate: '2025-09-10' } };

  // Payments
  if (p === 'payments/stripe/create-intent' && method === 'POST') return MOCK_STRIPE_INTENT;
  if (p === 'payments/paypal/create-order' && method === 'POST') return MOCK_PAYPAL_ORDER;
  if (p === 'payments/paypal/capture-order' && method === 'POST') return { success: true };
  if (p === 'payments/checkout' && method === 'POST') return MOCK_STRIPE_INTENT;

  // Cart
  if (p === 'cart' && method === 'GET') return { items: [], total: 0 };
  if (p === 'cart' && method === 'DELETE') return { success: true };

  // Order
  if (p === 'order/checkout' && method === 'POST') return { orderId: 'ord-001', status: 'confirmed' };

  // Shipping
  if (p === 'shipping/methods' && method === 'GET') return MOCK_SHIPPING.methods;

  // Reviews
  if (p === 'reviews' && method === 'GET') return MOCK_REVIEWS;

  // Audits
  if (p === 'audits' && method === 'GET') return MOCK_AUDITS;

  // Team
  if (p === 'team' && method === 'GET') return MOCK_TEAM;

  // Local Mall
  if (p === 'localmall/business/partnerships' && method === 'GET') return MOCK_PARTNERSHIPS;
  if (p === 'localmall/onboarding/check-location' && method === 'POST') return { valid: true, location: MOCK_BUSINESS.location };

  // Google Business
  if (p.startsWith('google-business/complete-onboarding') && method === 'POST') return { success: true, businessId: MOCK_BUSINESS.id };
  if (p.startsWith('google-business/map-category') && method === 'GET') return { category: 'Coffee Shop' };

  // Profile Verification
  if (p === 'profile/verification/upload' && method === 'POST') return { status: 'pending', documentId: 'doc-001' };
  if (p === 'profile/verification/status' && method === 'GET') return { status: 'pending' };

  // Taxonomy
  if (p === 'taxonomy/categories' && method === 'GET') return ['Coffee', 'Fashion', 'Fitness', 'Restaurant', 'Beauty', 'Electronics'];

  // System
  if (p === 'system/config' && method === 'GET') return { version: '1.0.0', environment: 'mock' };

  // Group Circle
  if (p === 'group-circle' && method === 'GET') return [];

  // Grouping
  if (p === 'grouping' && method === 'GET') return [];

  // Terminal Cashback
  if (p === 'terminal-cashback' && method === 'GET') return MOCK_CASHBACK;

  // Campaign Cashback
  if (p === 'campaign-cashback' && method === 'GET') return [];

  // Activity Timer
  if (p === 'activity-timer' && method === 'GET') return { isActive: false, elapsed: 0 };

  // Activities
  if (p === 'activities' && method === 'GET') return [];

  // Wishlist
  if (p === 'wishlist' && method === 'GET') return [];

  // Search
  if (p === 'search' && method === 'GET') return MOCK_LISTINGS;

  // Admin
  if (p.startsWith('admin/') && method === 'GET') return [];

  // Payment
  if (p === 'payment' && method === 'GET') return { status: 'active' };

  // My Coupons
  if (p === 'my-coupons' && method === 'GET') return MOCK_COUPONS;

  // Money Engine
  if (p.startsWith('money-engine/') && method === 'POST') return { success: true, transactionId: 'txn-001' };

  // Default fallback - return empty success
  return { success: true, data: null, message: 'Mock response' };
};

export function handleMockRequest(method: string, url: string, data?: any): { data: any } {
  let path = url;
  if (path.startsWith('http')) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname;
      const apiIdx = path.indexOf('/api/v1/');
      if (apiIdx !== -1) {
        path = path.substring(apiIdx + '/api/v1/'.length);
      }
    } catch {
      path = path.replace(/^https?:\/\/[^\/]+\/api\/v1\//, '');
    }
  }

  path = path.replace(/^\/+/, '').replace(/\/+$/, '');

  const result = routeHandlers(method, path, data);
  return { data: result };
}

export function initMockAuth(): void {
  if (!MOCK_BYPASS || typeof window === 'undefined') return;

  const Cookies = require('js-cookie');
  Cookies.set('access', MOCK_USER.auth.accessToken, { expires: 1 });
  Cookies.set('refresh', MOCK_USER.auth.refreshToken, { expires: 1 });
  Cookies.set('userId', MOCK_USER.userId, { expires: 1 });
  Cookies.set('userRole', MOCK_USER.role, { expires: 1 });
  Cookies.set('packageInfo', JSON.stringify(MOCK_USER.packageInfo), { expires: 1 });
  localStorage.setItem('user-name', MOCK_USER.name);
}

export function getMockUser() {
  return MOCK_USER;
}
