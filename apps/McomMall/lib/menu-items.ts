import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  BookOpen,
  Plus,
  Wallet,
  ShoppingBag,
  Store,
  SquareDashedKanban,
  Settings,
  LucideIcon,
  UserPen,
  Heart,
  LogOut,
  CreditCard,
  History,
  Gift,
  Coins,
  LifeBuoy,
  MapPin,
  Megaphone,
  BadgePercent,
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
  { title: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar },

  { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { title: 'My Wishlist', href: '/dashboard/wishlist', icon: Heart },
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
    title: 'My Storefront',
    href: '/dashboard/my-business',
    icon: Store,
  },
  { title: 'LocalMall', href: '/dashboard/localmall', icon: MapPin },
  {
    title: 'Promotions & Partnerships',
    href: '/dashboard/promotions',
    icon: Megaphone,
    subMenu: [
      { title: 'Available Promotions', href: '/dashboard/promotions' },
      {
        title: 'Affiliate Offers',
        href: '/dashboard/promotions?tab=affiliate',
      },
      { title: 'My Partners', href: '/dashboard/marketing/my-partners' },
      {
        title: 'Partnership Requests',
        href: '/dashboard/marketing/partnership-requests',
      },
    ],
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

export const historyMenuItems: MenuItem[] = [
  {
    title: 'Reward History',
    href: '/dashboard/history/reward-history',
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
    title: 'Affiliate Deals',
    href: '/dashboard/marketing/affiliate-deals',
    icon: BadgePercent,
  },
  {
    title: 'C-V / V-C',
    href: '/dashboard/deals',
    icon: Gift,
  },
  {
    title: 'Loyalty & Reward',
    href: '/dashboard/loyalty',
    icon: Coins,
    subMenu: [
      { title: 'Overview', href: '/dashboard/loyalty' },
      { title: 'Earning Rules', href: '/dashboard/loyalty/earning' },
      { title: 'Members', href: '/dashboard/loyalty/members' },
      { title: 'Offers', href: '/dashboard/loyalty/offers' },
      { title: 'Time Bonus', href: '/dashboard/loyalty/time-bonus' },
    ],
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
      { title: 'Create Voucher', href: '/dashboard/vouchers/new' },
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
