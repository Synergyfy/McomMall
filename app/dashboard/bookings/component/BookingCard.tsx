'use client';

import type { FC } from 'react';
import { Calendar, User, Clock, MoreHorizontal, XCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ChatIcon from '@/components/ChatIcon';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Booking } from '@/service/bookings/types';
import {
  useDeclineBooking,
  useApproveBooking,
  useMarkBookingComplete,
} from '@/service/bookings/hook';
import { useState } from 'react';

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

import { DollarSign, Briefcase } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const BookingCard: FC<{
  booking: Booking;
  isSelected: boolean;
  onSelect: (isSelected: boolean) => void;
}> = ({ booking, isSelected, onSelect }) => {
  const declineBookingMutation = useDeclineBooking();
  const approveBookingMutation = useApproveBooking();
  const markCompleteMutation = useMarkBookingComplete();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDecline = () => {
    declineBookingMutation.mutate(booking.id);
  };

  const handleApprove = () => {
    approveBookingMutation.mutate(booking.id);
  };

  const handleMarkComplete = () => {
    markCompleteMutation.mutate(booking.id);
    setIsConfirmOpen(false);
  };

  const statusStyles: { [key: string]: { badge: string; border: string } } = {
    pending: {
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      border: 'border-t-4 border-yellow-400',
    },
    confirmed: {
      badge: 'bg-green-100 text-green-800 border-green-200',
      border: 'border-t-4 border-green-400',
    },
    approved: {
      badge: 'bg-green-100 text-green-800 border-green-200',
      border: 'border-t-4 border-green-400',
    },
    declined: {
      badge: 'bg-red-100 text-red-800 border-red-200',
      border: 'border-t-4 border-red-400',
    },
    cancelled: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      border: 'border-t-4 border-blue-400',
    },
    default: {
      badge: 'bg-gray-100 text-gray-800 border-gray-200',
      border: 'border-t-4 border-gray-400',
    },
  };

  const getStatusBadge = (status: string) => {
    const style = statusStyles[status] || statusStyles.default;
    const statusExplanation: { [key: string]: string } = {
      pending:
        'Awaiting your approval. You can approve or decline this booking.',
      confirmed:
        'You have approved this booking. It is now awaiting completion.',
      approved:
        'You have approved this booking. It is now awaiting completion.',
      declined: 'You have declined this booking.',
      cancelled: 'The customer has cancelled this booking.',
      completed: 'This booking has been successfully completed.',
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={style.badge}>
              {status}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusExplanation[status] || 'Unknown status'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const cardBorderStyle =
    statusStyles[booking.status]?.border || statusStyles.default.border;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`shadow-sm hover:shadow-md transition-shadow duration-300 w-full ${cardBorderStyle} cursor-pointer`}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className="mt-1"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                  Booking #{booking.id.slice(0, 8)}
                </h2>
                <p className="text-sm text-gray-500">
                  for {booking.service.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
                {getStatusBadge(booking.status)}
                <ChatIcon
                  receiverId={booking.user.id}
                  listingName={booking.service.name}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleApprove}
                      disabled={booking.status.toUpperCase() !== 'PENDING'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Booking
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDecline}
                      disabled={booking.status.toUpperCase() !== 'PENDING'}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Booking
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsConfirmOpen(true)}
                      disabled={booking.status.toUpperCase() !== 'APPROVED'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <InfoBlock
                icon={<Calendar className="h-4 w-4" />}
                title="Booking Date"
              >
                <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
              </InfoBlock>
              <InfoBlock
                icon={<Clock className="h-4 w-4" />}
                title="Booking Time"
              >
                <p>
                  {new Date(booking.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(booking.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </InfoBlock>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {booking.user && (
            <InfoBlock icon={<User className="h-4 w-4" />} title="Customer">
              <p className="font-semibold">{booking.user.name}</p>
              <p className="text-xs text-gray-500">{booking.user.email}</p>
            </InfoBlock>
          )}
          {booking.service && (
            <InfoBlock
              icon={<Briefcase className="h-4 w-4" />}
              title="Service"
            >
              <p className="font-semibold">{booking.service.name}</p>
              <p className="text-xs text-gray-500">
                {booking.service.description}
              </p>
            </InfoBlock>
          )}
          {booking.payment && (
            <InfoBlock
              icon={<DollarSign className="h-4 w-4" />}
              title="Payment"
            >
              <p className="font-semibold">
                {new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: booking.payment.currency,
                }).format(booking.payment.amount)}
              </p>
              <p className="text-xs text-gray-500">
                via {booking.payment.paymentMethod}
              </p>
            </InfoBlock>
          )}
        </div>
      </DialogContent>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the booking as complete. If the customer
              has also marked it as complete, the payment will be released. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkComplete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default BookingCard;
