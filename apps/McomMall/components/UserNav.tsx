// components/UserNav.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/service/auth/hook';
import { useGetNotifications } from '@/service/notifications/hook';
import { RootState } from '@/service/store/store';
import { useGetUserProfile } from '@/service/user/hook';
import {
  getInitials,
  getUserMenuLinks,
  getUserRoleLabel,
} from '@/lib/user-menu';

interface UserNavProps {
  align?: 'center' | 'end' | 'start';
  variant?: 'dark' | 'light';
}

export default function UserNav({ align = 'end', variant = 'dark' }: UserNavProps) {
  const router = useRouter();
  const { userName, userRole } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetUserProfile();
  const {
    newBookingsCount,
    newOrdersCount,
    newMessagesCount,
  } = useGetNotifications();
  const logout = useLogout();

  const displayName = profile?.name || userName || 'User';
  const email = profile?.email;
  const roleLabel = getUserRoleLabel(userRole);
  const links = getUserMenuLinks(userRole);
  const isBusiness = userRole === 'owner' || userRole === 'admin';

  const totalNotifications = newBookingsCount + newOrdersCount + newMessagesCount;
  const notificationCounts: Record<string, number> = {
    '/dashboard/bookings': newBookingsCount,
    '/dashboard/store/orders': newOrdersCount,
    '/dashboard/messages': newMessagesCount,
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Open account menu"
          className={`flex items-center relative gap-2 px-2 group ${
            variant === 'light' ? 'hover:bg-white/10 text-white' : ''
          }`}
        >
          {isBusiness && totalNotifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs z-10"
            >
              {totalNotifications}
            </Badge>
          )}
          <Avatar className="w-8 h-8 shrink-0">
            {profile?.profilePictureUrl ? (
              <AvatarImage
                src={profile.profilePictureUrl}
                alt={displayName}
              />
            ) : null}
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <div
              className={`text-sm font-semibold leading-tight ${
                variant === 'light' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {displayName}
            </div>
            <div
              className={`text-xs leading-tight ${
                variant === 'light'
                  ? 'text-white/70 group-hover:text-white'
                  : 'text-gray-500 group-hover:text-gray-900'
              }`}
            >
              {roleLabel}
            </div>
          </div>
          <ChevronDown
            className={`hidden h-4 w-4 sm:block ${
              variant === 'light' ? 'text-white/80' : 'text-gray-700'
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-64 bg-white">
        <DropdownMenuLabel className="p-0 font-normal">
          <Link
            href="/dashboard/my-profile"
            className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-gray-50"
          >
            <Avatar className="h-9 w-9 shrink-0">
              {profile?.profilePictureUrl ? (
                <AvatarImage
                  src={profile.profilePictureUrl}
                  alt={displayName}
                />
              ) : null}
              <AvatarFallback className="text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {displayName}
              </p>
              {email ? (
                <p className="truncate text-xs text-gray-500">{email}</p>
              ) : null}
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                {roleLabel}
              </p>
            </div>
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((link) => {
          const Icon = link.icon;
          const count = notificationCounts[link.href] || 0;

          return (
            <DropdownMenuItem key={link.href} asChild>
              <Link
                href={link.href}
                className="flex w-full items-center justify-between gap-4"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {link.title}
                </span>
                {count > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {count}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
