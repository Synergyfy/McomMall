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
  Shield,
  BarChart3,
  Scale,
  FileText,
  Users,
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
      { title: 'Active', href: '/dashboard/my-listings/active' },
      { title: 'Pending', href: '/dashboard/my-listings/pending' },
      { title: 'Expired', href: '/dashboard/my-listings/expired' },
    ],
  },
  { title: 'Coupons', href: '/dashboard/coupons', icon: ShoppingCart },
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


// ✅ unified menu items
export const barterExchangeMenuItems: MenuItem[] = [
  // ---- Customer/General ----
  {
    title: "Barter Exchange",
    href: "/dashboard/barter-exchange",
    icon: ShoppingCart,
  },
  {
    title: "Add Exchange",
    href: "/dashboard/barter-exchange/add-exchange",
    icon: Plus,
  },
  {
    title: "Exchange History",
    href: "/dashboard/barter-exchange/history",
    icon: History,
  },
  {
    title: "Proposals",
    href: "/dashboard/barter-exchange/proposals/create",
    icon: Users,
    subMenu: [
      { title: "Manage Proposal", href: "/dashboard/barter-exchange/proposals/manage" },
    ]
  },
  {
    title: "Items listing",
    href: "/dashboard/barter-exchange/items",
    icon: Scale,
  },
  {
    title: "Messages",
    href: "/dashboard/barter-exchange/messages",
    icon: MessageSquare,
  },
  {
    title: "Rules & Policies",
    href: "/dashboard/barter-exchange/rules",
    icon: FileText,
  },

  // ---- Admin Only ----
  {
    title: "Admin Dashboard",
    href: "/dashboard/barter-exchange/admin",
    icon: BarChart3,
  },
  {
    title: "User Management",
    href: "/dashboard/barter-exchange/admin/users",
    icon: Users,
  },
  {
    title: "Fraud & Safety",
    href: "/dashboard/barter-exchange/admin/fraud",
    icon: Shield,
  },
  {
    title: "Settings & Integrations",
    href: "/dashboard/barter-exchange/admin/settings",
    icon: Settings,
  },
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
      { title: 'Templates', href: '/dashboard/gift-card/templates' },
      { title: 'Assets', href: '/dashboard/gift-card/assets' },
      { title: 'Admin', href: '/dashboard/gift-card/admin' },
      { title: 'Check Balance', href: '/dashboard/gift-card/check-balance' },
      { title: 'Email Designs', href: '/dashboard/gift-card/email-design' },
      { title: 'Settings', href: '/dashboard/gift-card/settings' },
    ],
  },

  {
    title: 'Voucher',
    href: '/dashboard/vouchers',
    icon: Settings,
    subMenu: [
      { title: 'Voucher Products', href: '/dashboard/vouchers/products' },
      { title: 'Sold Vouchers', href: '/dashboard/vouchers/sold' },
      { title: 'Redeem Voucher', href: '/dashboard/vouchers/redeem' },
    ],
  },
];
