import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  BookOpen,
  Plus,
  List,
  Wallet,
  ShoppingCart,
  UserStar,
  Bookmark,
  ShoppingBag,
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
  QrCode,
  Scan,
  Gift,
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
  {
    title: 'Activity Timer',
    href: '/dashboard/activity-timer',
    icon: Timer,
  },
  { title: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar },
  { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { title: 'My Wishlist', href: '/dashboard/wishlist', icon: Heart },
  {
    title: 'Reward Hub',
    href: '/dashboard/coupons-vouchers',
    icon: Gift,
  },
  // { title: 'QR Scanner', href: '/dashboard/bookings/qr-scanner', icon: QrCode },
  // { title: 'Store', href: '/dashboard/store', icon: LayoutDashboard },
];

export const listingMenuItems: MenuItem[] = [
  { title: 'Add listing', href: '/dashboard/add-listing', icon: Plus },
  { title: 'Ad Campaign', href: '/dashboard/ad-campaign', icon: Megaphone },
  {
    title: 'My listings',
    href: '/dashboard/my-listings',
    icon: List,
    subMenu: [
      { title: 'Active', href: '/dashboard/my-listings/active' },
      { title: 'Pending', href: '/dashboard/my-listings/pending' },
      { title: 'Expired', href: '/dashboard/my-listings/expired' },
    ],
  },
  { title: 'Reviews', href: '/dashboard/reviews', icon: UserStar },
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
    href: '/dashboard/marketing/partnerships',
    icon: Users,
    subMenu: [
      { title: 'My Partners', href: '/dashboard/marketing/my-partners' },
      {
        title: 'Partnership Requests',
        href: '/dashboard/marketing/partnership-requests',
      },
    ],
  },
  {
    title: 'Groups',
    href: '/dashboard/marketing/groups',
    icon: Users,
    subMenu: [
      { title: 'My Groups', href: '/dashboard/marketing/groups' },
      { title: 'Create Group', href: '/dashboard/marketing/groups/new' },
      { title: 'Membership', href: '/dashboard/marketing/membership' },
    ],
  },
];

export const historyMenuItems: MenuItem[] = [
  {
    title: 'Promotion History',
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
    href: '/dashboard/my-subscription',
    icon: CreditCard,
  },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    subMenu: [{ title: 'Payment', href: '/dashboard/settings/payment' }],
  },
  { title: 'Logout', href: '/', icon: LogOut },
];

import { BarChart } from 'lucide-react';

export const pluginMenuItems: MenuItem[] = [
  {
    title: 'Loyalty & Reward',
    href: '/dashboard/loyalty',
    icon: Settings,
    subMenu: [
      // { title: 'Dashboard', href: '/dashboard/loyalty' },
      { title: 'Analytics', href: '/dashboard/loyalty/analytics' },
      { title: 'Customer view', href: '/dashboard/loyalty/customer' },
      { title: 'Members', href: '/dashboard/loyalty/members' },
      { title: 'Promotion', href: '/dashboard/loyalty/promotion' },
      { title: 'Time Bonus', href: '/dashboard/loyalty/time-bonus' },
      { title: 'Offers', href: '/dashboard/loyalty/offers' },
      // { title: 'Settings', href: '/dashboard/loyalty/settings' },
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
      { title: 'Analytics', href: '/dashboard/vouchers/analytics' },
      { title: 'Voucher Products', href: '/dashboard/vouchers/products' },
      { title: 'Sold Vouchers', href: '/dashboard/vouchers/sold' },
      { title: 'Redeem Voucher', href: '/dashboard/vouchers/redeem' },
    ],
  },
  {
    title: 'Coupons',
    href: '/dashboard/coupons',
    icon: Settings,
    subMenu: [
      { title: 'Analytics', href: '/dashboard/coupons/analytics' },
      { title: 'Coupon Products', href: '/dashboard/coupons/products' },
      { title: 'Sold Coupons', href: '/dashboard/coupons/sold' },
      { title: 'Redeem Coupon', href: '/dashboard/coupons/redeem' },
    ],
  },
  {
    title: 'Hotspot Campaigns',
    href: '/dashboard/hotspot-editor',
    icon: Scan,
    subMenu: [
      { title: 'All Campaigns', href: '/dashboard/hotspot-editor' },
      { title: 'New Campaign', href: '/dashboard/hotspot-editor/new' },
    ],
  },
];
