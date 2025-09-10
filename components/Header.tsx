// components/Header.tsx (Updated)
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, ChevronDown, Heart } from 'lucide-react';
import AuthWithRedirect from './AuthWithRedirect';
import { Suspense } from 'react';
import { NavMenu } from './NavMenu';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const pathname = usePathname();
  const { cartItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { accessToken, userName, userRole, packageInfo } = useSelector(
    (state: RootState) => state.auth
  );
  const logout = useLogout();

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="bg-slate-800 text-white">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>
                        {userName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-lg">{userName}</div>
                      <div className="text-xs">
                        {userRole === 'customer'
                          ? 'Customer'
                          : packageInfo?.planType}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-lg" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-lg" asChild>
                    <Link href="/wishlist">My Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-lg" onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Suspense fallback={<div>Loading...</div>}>
                <AuthWithRedirect>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </AuthWithRedirect>
              </Suspense>
            )}

            {/* Mobile Nav Trigger is now inside NavMenu */}
            <div className="md:hidden">
              <NavMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
