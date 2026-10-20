import {
  Calendar,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Ticket,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface UserMenuLink {
  title: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Links shown in the signed-in account dropdown.
 *
 * Owners and customers see different dashboards, so the menu is derived from
 * the role stored in the auth slice. Admins are treated as business users.
 */
const BUSINESS_LINKS: UserMenuLink[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Storefront', href: '/dashboard/storefront', icon: Store },
  { title: 'Products', href: '/dashboard/store/products', icon: Package },
  { title: 'Orders', href: '/dashboard/store/orders', icon: ShoppingBag },
  { title: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const CUSTOMER_LINKS: UserMenuLink[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar },
  { title: 'My Orders', href: '/dashboard/store/orders', icon: ShoppingBag },
  { title: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
  { title: 'Rewards', href: '/dashboard/rewards', icon: Star },
  {
    title: 'Coupons & Vouchers',
    href: '/dashboard/coupons-vouchers',
    icon: Ticket,
  },
  { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function getUserMenuLinks(role?: string | null): UserMenuLink[] {
  return role === 'owner' || role === 'admin'
    ? BUSINESS_LINKS
    : CUSTOMER_LINKS;
}

export function getUserRoleLabel(role?: string | null): string {
  return role === 'owner' || role === 'admin'
    ? 'Business owner'
    : 'Customer';
}

/** Initials used as the avatar fallback (e.g. "Ada Lovelace" → "AL"). */
export function getInitials(name?: string | null): string {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
