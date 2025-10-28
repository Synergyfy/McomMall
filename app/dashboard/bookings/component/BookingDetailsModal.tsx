'use client';

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Booking } from '@/service/bookings/types';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  if (!booking) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Full details for booking #{booking.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>
            <strong>Service:</strong> {booking.service.name}
          </p>
          <p>
            <strong>Customer:</strong> {booking.user.name}
          </p>
          <p>
            <strong>Status:</strong> {booking.status}
          </p>
          <p>
            <strong>Date:</strong>{' '}
            {new Date(booking.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Time:</strong>{' '}
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
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
