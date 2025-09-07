'use client';

import type { FC } from 'react';
import { Calendar, User, Clock, MoreHorizontal, XCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Booking } from '@/service/bookings/types';
import { useDeclineBooking, useApproveBooking } from '@/service/bookings/hook';

const InfoBlock: FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="bg-gray-50/70 p-3 rounded-lg flex-1">
    <h3 className="text-sm font-semibold text-gray-600 flex items-center mb-2">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    <div className="text-sm text-gray-800">{children}</div>
  </div>
);

const BookingCard: FC<{ booking: Booking }> = ({ booking }) => {
  const declineBookingMutation = useDeclineBooking();
  const approveBookingMutation = useApproveBooking();

  const handleDecline = () => {
    declineBookingMutation.mutate(booking.id);
  };

  const handleApprove = () => {
    approveBookingMutation.mutate(booking.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case 'DECLINED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Booking #{booking.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-gray-500">
              with {booking.business.businessName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(booking.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleApprove} disabled={booking.status.toUpperCase() !== 'PENDING'}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Booking
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDecline} disabled={booking.status.toUpperCase() !== 'PENDING'}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline Booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <InfoBlock icon={<Calendar className="h-4 w-4" />} title="Booking Date">
            <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
          </InfoBlock>
          <InfoBlock icon={<Clock className="h-4 w-4" />} title="Booking Time">
            <p>
              {new Date(booking.startTime).toLocaleTimeString()} -{' '}
              {new Date(booking.endTime).toLocaleTimeString()}
            </p>
          </InfoBlock>
        </div>

        {booking.user && (
          <InfoBlock icon={<User className="h-4 w-4" />} title="Customer">
            <p className="font-semibold">{booking.user.name}</p>
            <p className="text-xs text-gray-500">{booking.user.email}</p>
          </InfoBlock>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCard;
