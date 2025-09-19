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
  BanknoteArrowDown,
  ShoppingBag,
  SquareDashedKanban,
  Settings,
  LucideIcon,
  UserPen,
  Heart,
  LogOut,
  Megaphone,
  CreditCard,
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
  { title: 'Store', href: '/dashboard/store', icon: LayoutDashboard },
];

export const listingMenuItems: MenuItem[] = [
  { title: 'Add listing', href: '/dashboard/add-listing', icon: Plus },
  { title: 'Ad Campaign', href: '/dashboard/ad-campaign', icon: Megaphone },
  {
    title: 'My listings',
    href: '/dashboard/my-listings',
    icon: List,
    subMenu: [
      { title: 'Active', href: '/dashboard/bookings/qr-scanner' },
      { title: 'Pending', href: '/dashboard/bookings/qr-scanner' },
      { title: 'Expired', href: '/dashboard/bookings/qr-scanner' },
    ],
  },
  { title: 'Coupons', href: '/dashboard/coupons', icon: ShoppingCart },
  { title: 'Reviews', href: '/dashboard/reviews', icon: UserStar },
  { title: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark }, // Typo corrected: "Boomarks" -> "Bookmarks"
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
      { title: 'QR Scanner', href: '/dashboard/bookings/qr-scanner' },
      { title: 'Pending', href: '/dashboard/bookings?status=pending' },
      { title: 'Approved', href: '/dashboard/bookings?status=approved' },
      { title: 'Cancelled', href: '/dashboard/bookings?status=cancelled' },
    ],
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

export const pluginMenuItems: MenuItem[] = [
  {
    title: 'Loyalty & Reward',
    href: '/dashboard/loyalty',
    icon: Settings,
    subMenu: [
      { title: 'Dashboard', href: '/dashboard/loyalty' },
      { title: 'Customer view', href: '/dashboard/loyalty/customer' },
      { title: 'Members', href: '/dashboard/loyalty/members' },
      { title: 'Promotion', href: '/dashboard/loyalty/promotion' },
      { title: 'Time Bonus', href: '/dashboard/loyalty/time-bonus' },
      { title: 'Offers', href: '/dashboard/loyalty/offers' },
      { title: 'Settings', href: '/dashboard/loyalty/settings' },
    ],
  },
  {
    title: 'Gift Card',
    href: '/dashboard/gift-card',
    icon: Settings,
    subMenu: [
      { title: 'Dashboard', href: '/dashboard/gift-card' },
      { title: 'Admin', href: '/dashboard/gift-card/admin' },
      { title: 'Check Balance', href: '/dashboard/gift-card/check-balance' },
      { title: 'Email Designs', href: '/dashboard/gift-card/email-design' },
      { title: 'Settings', href: '/dashboard/gift-card/settings' },
    ],
  },

  {
    title: 'Voucher',
    href: '/dashboard/voucher',
    icon: Settings,
    subMenu: [
      { title: 'Dashboard', href: '/dashboard/voucher' },
      { title: 'Admin', href: '/dashboard/gift-card/admin' },
      { title: 'Reports', href: '/dashboard/voucher/reports' },
      { title: 'Offers', href: '/dashboard/loyalty/offers' },
      { title: 'Pay your price', href: '/dashboard/voucher/pay-your-price' },
      { title: 'Vendor', href: '/dashboard/voucher/vendor-settings' },
      { title: 'Settings', href: '/dashboard/voucher/settings' },
      { title: 'Notification', href: '/dashboard/voucher/notification' },
    ],
  },
];
