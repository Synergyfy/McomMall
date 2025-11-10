// app/dashboard/agent/components/TopHeader.tsx
import { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';

const TopHeader: FC = () => {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div>
          <p className="text-sm text-gray-500">Today's Earnings</p>
          <p className="font-semibold">$120.00</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">This Month</p>
          <p className="font-semibold">$1,500.00</p>
        </div>
        <Bell className="w-6 h-6 text-gray-500" />
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default TopHeader;
