'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  User,
  ChevronDown,
  Heart,
  LogOut,
  Menu as MenuIcon,
  X as XIcon,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { NavMenu, menuItems, ListItem } from './NavMenu';
import { usePathname, useRouter } from 'next/navigation';
import { useWishlist } from '@/hooks/useWishlist';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import UserNav from './UserNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLogout, redirectToMcomSolutionsLogin } from '@/service/auth/hook';
import { useGetMyMembership } from '@/service/membership/hooks';
import { useGetUserProfile } from '@/service/user/hook';
import {
  getInitials,
  getUserMenuLinks,
  getUserRoleLabel,
} from '@/lib/user-menu';

const mobileMenuVariants: Variants = {
  closed: { x: '100%', transition: { duration: 0.3, ease: 'easeInOut' } },
  open: { x: '0%', transition: { duration: 0.3, ease: 'easeInOut' } },
};

interface MobileAccountSectionProps {
  onNavigate: () => void;
}

function MobileAccountSection({ onNavigate }: MobileAccountSectionProps) {
  const router = useRouter();
  const logout = useLogout();
  const { userName, userRole } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetUserProfile();

  const displayName = profile?.name || userName || 'User';
  const links = getUserMenuLinks(userRole);

  const handleLogout = () => {
    logout();
    onNavigate();
    router.push('/');
  };

  return (
    <div className="border-t border-gray-200 my-2 pt-2">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="h-10 w-10 shrink-0">
          {profile?.profilePictureUrl ? (
            <AvatarImage src={profile.profilePictureUrl} alt={displayName} />
          ) : null}
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {displayName}
          </p>
          {profile?.email ? (
            <p className="truncate text-xs text-gray-500">{profile.email}</p>
          ) : null}
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
            {getUserRoleLabel(userRole)}
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/my-profile"
        onClick={onNavigate}
        className="block rounded-md px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
      >
        My Profile
      </Link>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="block rounded-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
        >
          {link.title}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-gray-100"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { cart } = useSelector((state: RootState) => state.cart);
  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const { wishlistCount } = useWishlist();
  const { accessToken, userRole } = useSelector(
    (state: RootState) => state.auth
  );
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(
    null
  );
  const { data: membership } = useGetMyMembership();

  if (
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/getstarted') ||
    pathname?.startsWith('/auth/') ||
    pathname === '/'
  ) {
    return null;
  }

  const MobileMenu = () => (
    <>
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="p-2 text-white transition-colors hover:text-red-400"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-semibold text-gray-900">
                McomMall
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-900"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col space-y-2">
              {menuItems
                .filter(item => {
                  if (userRole === 'customer' && item.title === 'Pricing') return false;
                  return true;
                })
                .map(item => {
                  const isSubMenuOpen = openMobileSubMenu === item.title;

                  if (item.href) {
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md px-4 py-2 text-lg text-gray-900 transition-colors hover:bg-gray-100"
                      >
                        {item.title}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.title}>
                      <button
                        onClick={() =>
                          setOpenMobileSubMenu(isSubMenuOpen ? null : item.title)
                        }
                        className="flex w-full items-center justify-between rounded-md px-4 py-2 text-lg text-gray-900 transition-colors hover:bg-gray-100"
                      >
                        <span>{item.title}</span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${isSubMenuOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isSubMenuOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            <div
                              className="mt-2 border-l-2 border-gray-200 pl-4"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              {!accessToken ? (
                <>
                  <Link
                    href="/getstarted"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-4 py-2 text-lg font-semibold text-orange-600 transition-colors hover:bg-gray-100"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/getstarted#earn-with-us"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-4 py-2 text-lg font-semibold text-orange-600 transition-colors hover:bg-gray-100"
                  >
                    Earn with Us
                  </Link>
                </>
              ) : (
                <MobileAccountSection
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <header className="bg-slate-800 text-white fixed top-0 left-0 right-0 w-full z-50">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold hidden md:block leading-tight">McomMall</span>
            </div>
          </Link>

          {/* Desktop Nav - Placed in the middle for better layout */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <NavMenu role={userRole ?? undefined} />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {userRole === 'owner' && (
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Membership tier removed from public header */}
              </div>
            )}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-white hover:text-red-400"
              >
                <ShoppingCart className="w-5 h-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500"
                >
                  {cartItemCount}
                </Badge>
              </Button>
            </Link>
            <Link href="/dashboard/wishlist">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-white hover:text-red-400"
              >
                <Heart className="w-5 h-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500"
                >
                  {wishlistCount}
                </Badge>
              </Button>
            </Link>
            {accessToken ? (
              <UserNav variant="light" />
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/getstarted">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 border-orange-200"
                  onClick={() => redirectToMcomSolutionsLogin()}
                >
                  Login
                </Button>
              </div>
            )}

            {/* Mobile Nav Trigger */}
            <div className="md:hidden flex items-center">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
