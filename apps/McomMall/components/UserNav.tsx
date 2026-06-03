// components/UserNav.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { useLogout } from '@/service/auth/hook';
import { useGetNotifications } from '@/service/notifications/hook';
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

interface UserNavProps {
  align?: 'center' | 'end' | 'start';
  variant?: 'dark' | 'light';
}

export default function UserNav({ align = 'end', variant = 'dark' }: UserNavProps) {
  const { userName, userRole, packageInfo } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    newBookingsCount,
    newOrdersCount,
    newMessagesCount,
  } = useGetNotifications();
  const logout = useLogout();

  const totalNotifications = newBookingsCount + newOrdersCount + newMessagesCount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center relative gap-2 px-2 group ${
            variant === 'light' ? 'hover:bg-white/10 text-white' : ''
          }`}
        >
          {userRole === 'owner' && totalNotifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs z-10"
            >
              {totalNotifications}
            </Badge>
          )}
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              {userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <div className={`text-base font-semibold ${
              variant === 'light' ? 'text-white' : 'text-gray-900'
            }`}>{userName}</div>
            <div className={`text-xs ${
              variant === 'light'
                ? 'text-white/70 group-hover:text-white'
                : 'text-gray-500 group-hover:text-gray-900'
            }`}>
              {userRole === 'customer'
                ? 'Customer'
                : packageInfo?.planType}
            </div>
          </div>
          <ChevronDown className={`hidden h-4 w-4 sm:block ${
            variant === 'light' ? 'text-white/80' : 'text-gray-700'
          }`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 bg-white">
        {userRole === 'owner' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/bookings" className="flex justify-between w-full">
                Bookings
                {newBookingsCount > 0 && (
                  <Badge variant="destructive">
                    {newBookingsCount}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/store/orders" className="flex justify-between w-full">
                Orders
                {newOrdersCount > 0 && (
                  <Badge variant="destructive">
                    {newOrdersCount}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/messages" className="flex justify-between w-full">
                Messages
                {newMessagesCount > 0 && (
                  <Badge variant="destructive">
                    {newMessagesCount}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/wallet" className="flex justify-between w-full">
                Wallet
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
  );
}
