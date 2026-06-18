import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  BookOpen,
  Plus,
  List,
  Wallet,
  UserStar,
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
  Scan,
  Gift,
  Coins,
  LifeBuoy,
  Zap,
  MapPin,
  BarChart2,
  Trophy,
  Wrench,
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
  { title: 'Add Profile', href: '/dashboard/add-listing', icon: Plus },
  // { title: 'Ad Campaign', href: '/dashboard/ad-campaign', icon: Megaphone },
  {
    title: 'My Profiles',
    href: '/dashboard/my-listings',
    icon: List,
    subMenu: [
      { title: 'Active', href: '/dashboard/my-listings/active' },
      { title: 'Drafts', href: '/dashboard/my-listings/drafts' },
      { title: 'Pending', href: '/dashboard/my-listings/pending' },
      { title: 'Expired', href: '/dashboard/my-listings/expired' },
    ],
  },
  { title: 'Reviews', href: '/dashboard/reviews', icon: UserStar },
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
    title: 'Engagement',
    href: '/dashboard/engagement',
    icon: BarChart2,
  },
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
  /*
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
  */
  {
    title: 'Group Circles',
    href: '/dashboard/group-circles',
    icon: Zap,
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
    href: '/dashboard/my-subscription',
    icon: CreditCard,
  },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { title: 'Cashback', href: '/dashboard/cashback', icon: Coins },

  { title: 'Logout', href: '/', icon: LogOut },
];

export const pluginMenuItems: MenuItem[] = [
  {
    title: 'Business Tools',
    href: '/dashboard/tools',
    icon: Wrench,
    subMenu: [
      { title: 'Overview', href: '/dashboard/tools' },
      { title: 'Excess Stock', href: '/dashboard/tools/excess-stock' },
      { title: 'Capacity Manager', href: '/dashboard/tools/capacity' },
      { title: 'Campaigns', href: '/dashboard/tools/campaigns' },
      { title: 'Push Alerts', href: '/dashboard/tools/alerts' },
    ],
  },
  {
    title: 'QR Engine',
    href: '/dashboard/qr',
    icon: Scan,
    subMenu: [
      { title: 'QR Dashboard', href: '/dashboard/qr' },
      { title: 'Create QR', href: '/dashboard/qr/new' },
    ],
  },
  {
    title: 'Marketing Automations',
    href: '/dashboard/automations',
    icon: Zap,
    subMenu: [
      { title: 'Dashboard', href: '/dashboard/automations' },
      { title: 'Flow Builder', href: '/dashboard/automations/new' },
    ],
  },
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
    title: 'Rotator Campaigns',
    href: '/dashboard/promotions/rotators',
    icon: Megaphone,
  },
  {
    title: 'Events',
    href: '/dashboard/events',
    icon: Calendar,
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
  {
    title: 'Hotspot Campaigns',
    href: '/dashboard/hotspot-editor',
    icon: Scan,
    subMenu: [
      { title: 'All Campaigns', href: '/dashboard/hotspot-editor' },
      { title: 'New Campaign', href: '/dashboard/hotspot-editor/new' },
    ],
  },
  {
    title: 'Gamification Hub',
    href: '/dashboard/gamification',
    icon: Trophy,
  },
];
