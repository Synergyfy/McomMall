'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useLogout } from '@/service/auth/hook';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const UserAvatar = () => {
  const { userName, userRole, packageInfo } = useSelector(
    (state: RootState) => state.auth
  );
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center text-white hover:text-white"
        >
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{userName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg">{userName}</div>
            <div className="text-xs">
              {userRole === 'customer' ? 'Customer' : packageInfo?.planType}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="text-lg" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-lg" onClick={logout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
