// components/UserNav.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { useLogout } from '@/service/auth/hook';
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

export default function UserNav() {
  const { userName, userRole, packageInfo } = useSelector(
    (state: RootState) => state.auth
  );
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  );
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center relative w-56">
          {userRole === 'owner' && notifications && notifications.total > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
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
          <div className="hidden sm:block text-left">
            <div className="text-base font-semibold text-white">{userName}</div>
            <div className="text-xs text-gray-400">
              {userRole === 'customer'
                ? 'Customer'
                : packageInfo?.planType}
            </div>
          </div>
          <ChevronDown className="hidden h-4 w-4 sm:block ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userRole === 'owner' && notifications && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/bookings" className="flex justify-between w-full">
                Bookings
                {notifications.newBookings.count > 0 && (
                  <Badge variant="destructive">
                    {notifications.newBookings.count}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/store/orders" className="flex justify-between w-full">
                Orders
                {notifications.newOrders.count > 0 && (
                  <Badge variant="destructive">
                    {notifications.newOrders.count}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/messages" className="flex justify-between w-full">
                Messages
                {notifications.newMessages.total > 0 && (
                  <Badge variant="destructive">
                    {notifications.newMessages.total}
                  </Badge>
                )}
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
