import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  BookOpen,
  Plus,
  List,
  Wallet,
  ShoppingBag,
  Store,
  SquareDashedKanban,
  Settings,
  LucideIcon,
  UserPen,
  Heart,
  LogOut,
  Megaphone,
  CreditCard,
  History,
  Users,
  Timer,
  Scan,
  Gift,
  Coins,
  LifeBuoy,
  Zap,
  MapPin,
  BarChart2,
  Trophy,
} from 'lucide-react';

export interface SubMenuItem {
  title: string;
  href: string;
}

export interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  subMenu?: SubMenuItem[];
}

// Export the menu item arrays
export const mainMenuItems: MenuItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'LocalMall', href: '/dashboard/localmall', icon: MapPin },
  {
    title: 'Activity Timer',
    href: '/dashboard/activity-timer',
    icon: Timer,
  },
  { title: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar },
  { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { title: 'My Wishlist', href: '/dashboard/wishlist', icon: Heart },
  {
    title: 'Coupon-Voucher',
    href: '/dashboard/coupons-vouchers',
    icon: Gift,
  },
  {
    title: 'Support Tickets',
    href: '/dashboard/support-tickets',
    icon: LifeBuoy,
  },
  // { title: 'QR Scanner', href: '/dashboard/bookings/qr-scanner', icon: QrCode },
  // { title: 'Store', href: '/dashboard/store', icon: LayoutDashboard },
];

export const listingMenuItems: MenuItem[] = [
  {
    title: 'My Business',
    href: '/dashboard/my-business',
    icon: Store,
  },
];

export const storefrontMenuItems: MenuItem[] = [
  {
    title: 'Storefront Hub',
    href: '/dashboard/storefront',
    icon: SquareDashedKanban,
  },
  {
    title: 'Business Profile',
    href: '/dashboard/storefront/profile',
    icon: UserPen,
  },
  {
    title: 'Appearance',
    href: '/dashboard/storefront/appearance',
    icon: Settings,
  },
  {
    title: 'Verification',
    href: '/dashboard/storefront/verification',
    icon: Scan,
  },
  {
    title: 'Visibility Settings',
    href: '/dashboard/storefront/visibility',
    icon: Zap,
  },
  {
    title: 'Readiness Score',
    href: '/dashboard/storefront/readiness',
    icon: Trophy,
  },
  {
    title: 'Borough Campaigns',
    href: '/dashboard/storefront/boroughs',
    icon: Megaphone,
  },
  {
    title: 'Interest Signals',
    href: '/dashboard/storefront/signals',
    icon: BarChart2,
  },
  {
    title: 'Claim Campaigns',
    href: '/dashboard/storefront/activations',
    icon: List,
  },
];

export const productMenuItems: MenuItem[] = [
  {
    title: 'Product',
    href: '/dashboard/store/products',
    icon: SquareDashedKanban,
  },
  {
    title: 'Add Product',
    href: '/dashboard/store/products/add-product',
    icon: Plus,
  },
  { title: 'Orders', href: '/dashboard/store/orders', icon: ShoppingBag },
];

export const serviceMenuItems: MenuItem[] = [
  {
    title: 'Service',
    href: '/dashboard/services',
    icon: SquareDashedKanban,
  },
  {
    title: 'Add Service',
    href: '/dashboard/services/add-service',
    icon: Plus,
  },
  {
    title: 'Bookings',
    href: '/dashboard/bookings',
    icon: BookOpen,
    subMenu: [
      { title: 'Calendar View', href: '/dashboard/bookings/calendar-view' },
      { title: 'Pending', href: '/dashboard/bookings?status=pending' },
      { title: 'Approved', href: '/dashboard/bookings?status=approved' },
      { title: 'Cancelled', href: '/dashboard/bookings?status=cancelled' },
    ],
  },
];

export const marketingMenuItems: MenuItem[] = [
  {
    title: 'Partnerships',
    href: '/dashboard/marketing/my-partners',
    icon: Users,
    subMenu: [
      { title: 'My Partners', href: '/dashboard/marketing/my-partners' },
      {
        title: 'Partnership Requests',
        href: '/dashboard/marketing/partnership-requests',
      },
    ],
  },
];

export const historyMenuItems: MenuItem[] = [
  {
    title: 'Reward History',
    href: '/dashboard/history/promotion-history',
    icon: History,
  },
  {
    title: 'Gift Card',
    href: '/dashboard/history/gift-card',
    icon: CreditCard,
  },
  {
    title: 'My Vouchers',
    href: '/dashboard/history/my-vouchers',
    icon: CreditCard,
  },
  {
    title: 'My Coupons',
    href: '/dashboard/history/my-coupons',
    icon: CreditCard,
  },
];

export const businessCategories = [
  {
    title: 'Building and trades',
    items: ['Plumbers', 'Electricians', 'Builders', 'Roofers'],
  },
  {
    title: 'Health and beauty',
    items: ['Hairdressers', 'Nail salons', 'Spas'],
  },
  { title: 'Food and drink', items: ['Restaurants', 'Cafes', 'Bars'] },
  {
    title: 'Education and training',
    items: ['Tutors', 'Courses', 'Workshops'],
  },
];

export const accountMenuItems: MenuItem[] = [
  { title: 'My Profile', href: '/dashboard/my-profile', icon: UserPen },
  {
    title: 'My Subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
  },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { title: 'Cashback', href: '/dashboard/cashback', icon: Coins },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },

  { title: 'Logout', href: '/', icon: LogOut },
];

export const pluginMenuItems: MenuItem[] = [
  {
    title: 'Loyalty & Reward',
    href: '/dashboard/loyalty',
    icon: Settings,
    subMenu: [
      // { title: 'Dashboard', href: '/dashboard/loyalty' },
      { title: 'Analytics', href: '/dashboard/loyalty/analytics' },
      // { title: 'Customer view', href: '/dashboard/loyalty/customer' },
      { title: 'Members', href: '/dashboard/loyalty/members' },
      { title: 'Time Bonus', href: '/dashboard/loyalty/time-bonus' },
      { title: 'Offers', href: '/dashboard/loyalty/offers' },
      // { title: 'Settings', href: '/dashboard/loyalty/settings' },
    ],
  },
  {
    title: 'Promotion',
    href: '/dashboard/promotions',
    icon: Megaphone,
  },
  {
    title: 'Gift Card',
    href: '/dashboard/gift-card',
    icon: Settings,
    subMenu: [
      // { title: 'Dashboard', href: '/dashboard/gift-card' },
      { title: 'Analytics', href: '/dashboard/gift-card/analytics' },
      { title: 'Templates', href: '/dashboard/gift-card/templates' },
      { title: 'Assets', href: '/dashboard/gift-card/assets' },
      { title: 'Check Balance', href: '/dashboard/gift-card/check-balance' },
      // { title: 'Email Designs', href: '/dashboard/gift-card/email-design' },
      // { title: 'Settings', href: '/dashboard/gift-card/settings' },
    ],
  },

  {
    title: 'Voucher',
    href: '/dashboard/vouchers',
    icon: Settings,
    subMenu: [
      { title: 'Dashboard', href: '/dashboard/vouchers' },
      { title: 'Create Campaign', href: '/dashboard/vouchers/new' },
      { title: 'Redemption Log', href: '/dashboard/vouchers/sold' },
      { title: 'Analytics', href: '/dashboard/vouchers/analytics' },
    ],
  },
  {
    title: 'Coupons',
    href: '/dashboard/coupons',
    icon: Settings,
    subMenu: [
      { title: 'Dashboard', href: '/dashboard/coupons' },
      { title: 'Create Campaign', href: '/dashboard/coupons/new' },
      { title: 'Redemption Log', href: '/dashboard/coupons/sold' },
      { title: 'Redeem Coupon', href: '/dashboard/coupons/redeem' },
      { title: 'Analytics', href: '/dashboard/coupons/analytics' },
    ],
  },
];
