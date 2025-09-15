// components/Header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  User,
  ChevronDown,
  Heart,
  Menu as MenuIcon,
  X as XIcon,
} from 'lucide-react';
import AuthWithRedirect from './AuthWithRedirect';
import { Suspense, useState } from 'react';
import { NavMenu, menuItems, ListItem } from './NavMenu';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/service/auth/hook';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { useWishlist } from '@/hooks/useWishlist';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const mobileMenuVariants: Variants = {
  closed: { x: '100%', transition: { duration: 0.3, ease: 'easeInOut' } },
  open: { x: '0%', transition: { duration: 0.3, ease: 'easeInOut' } },
};

export default function Header() {
  const pathname = usePathname();
  const { cartItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { accessToken, userName, userRole, packageInfo } = useSelector(
    (state: RootState) => state.auth
  );
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  );
  const logout = useLogout();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(
    null
  );

  if (pathname.startsWith('/dashboard')) {
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
              {menuItems.map(item => {
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
                        className={`h-5 w-5 transition-transform ${
                          isSubMenuOpen ? 'rotate-180' : ''
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <header className="bg-slate-800 text-white fixed top-0 left-0 right-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-semibold">McomMall</span>
          </Link>

          {/* Desktop Nav - Placed in the middle for better layout */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <NavMenu />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
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
            <Link href="/wishlist">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center relative">
                    {userRole === 'owner' && notifications && notifications.total > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500"
                      >
                        {notifications.total}
                      </Badge>
                    )}
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>
                        {userName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                      <div className="text-sm font-semibold">{userName}</div>
                      <div className="text-xs text-gray-400">
                        {userRole === 'customer'
                          ? 'Customer'
                          : packageInfo?.planType}
                      </div>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 sm:block ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userRole === 'owner' && notifications && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/bookings" className="flex justify-between w-full">
                          Bookings <Badge>{notifications.newBookings.count}</Badge>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/store/orders" className="flex justify-between w-full">
                          Orders <Badge>{notifications.newOrders.count}</Badge>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/messages" className="flex justify-between w-full">
                          Messages <Badge>{notifications.newMessages.total}</Badge>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">My Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Suspense fallback={<div>Loading...</div>}>
                <AuthWithRedirect>
                  <div className="hidden sm:flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </div>
                  <div className="sm:hidden">
                    <User className="w-5 h-5" />
                  </div>
                </AuthWithRedirect>
              </Suspense>
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
