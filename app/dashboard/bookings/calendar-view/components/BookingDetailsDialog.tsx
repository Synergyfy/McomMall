'use client';

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Booking } from '@/service/bookings/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface BookingDetailsDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DetailItem: FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-500">{label}</span>
    <span className="text-md text-gray-800">{value}</span>
  </div>
);

export const BookingDetailsDialog: FC<BookingDetailsDialogProps> = ({
  booking,
  isOpen,
  onOpenChange,
}) => {
  if (!booking) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Booking Details
            <Badge variant="secondary" className="ml-3">
              {booking.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            ID: {booking.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="p-4 border rounded-lg bg-gray-50/50">
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Name" value={booking.user.name} />
              <DetailItem label="Email" value={booking.user.email} />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-gray-50/50">
            <h3 className="text-lg font-semibold mb-3">Booking Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Date"
                value={format(new Date(booking.startTime), 'PPP')}
              />
              <DetailItem
                label="Time"
                value={`${format(
                  new Date(booking.startTime),
                  'p'
                )} - ${format(new Date(booking.endTime), 'p')}`}
              />
              <DetailItem
                label="Business"
                value={booking.business.businessName}
              />
            </div>
          </div>

          {booking.payment && (
            <div className="p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Amount"
                  value={`${booking.payment.amount} ${booking.payment.currency.toUpperCase()}`}
                />
                <DetailItem
                  label="Method"
                  value={booking.payment.paymentMethod
                    .split('_')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ')}
                />
                <DetailItem
                  label="Transaction ID"
                  value={booking.payment.transactionId.slice(0, 15)}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
