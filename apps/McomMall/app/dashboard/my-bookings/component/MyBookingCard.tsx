"use client";

import type { FC } from "react";
import {
  Calendar,
  Clock,
  MoreHorizontal,
  XCircle,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { Booking } from "@/service/bookings/types";
import {
  useCancelBooking,
  useMarkBookingComplete,
} from "@/service/bookings/hook";
import { useState } from "react";

const InfoBlock: FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="flex items-center space-x-3 bg-gray-50/50 p-2.5 rounded-md border border-gray-100/80">
    <div className="flex-shrink-0 text-gray-400">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 font-medium">{title}</span>
      <div className="text-sm font-semibold text-gray-800 leading-tight mt-0.5">{children}</div>
    </div>
  </div>
);

import { PoundSterling, Briefcase, CheckCircle } from "lucide-react";

const MyBookingCard: FC<{ booking: Booking }> = ({ booking }) => {
  const cancelBookingMutation = useCancelBooking();
  const markCompleteMutation = useMarkBookingComplete();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCancel = () => {
    cancelBookingMutation.mutate(booking.id);
  };

  const handleMarkComplete = () => {
    markCompleteMutation.mutate(booking.id);
    setIsConfirmOpen(false);
  };

  const statusStyles: { [key: string]: { badge: string; border: string } } = {
    pending: {
      badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
      border: "border-t-4 border-yellow-400",
    },
    confirmed: {
      badge: "bg-green-100 text-green-800 border-green-200",
      border: "border-t-4 border-green-400",
    },
    approved: {
      badge: "bg-green-100 text-green-800 border-green-200",
      border: "border-t-4 border-green-400",
    },
    declined: {
      badge: "bg-red-100 text-red-800 border-red-200",
      border: "border-t-4 border-red-400",
    },
    cancelled: {
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      border: "border-t-4 border-blue-400",
    },
    default: {
      badge: "bg-gray-100 text-gray-800 border-gray-200",
      border: "border-t-4 border-gray-400",
    },
  };

  const getStatusBadge = (status: string) => {
    const style = statusStyles[status] || statusStyles.default;
    return (
      <Badge variant="outline" className={`${style.badge} text-[10px] px-1.5 py-0 h-5`}>
        {status}
      </Badge>
    );
  };

  const cardBorderStyle =
    statusStyles[booking.status]?.border || statusStyles.default.border;

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow duration-300 w-full ${cardBorderStyle} overflow-hidden`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">
              Booking #{booking.id.slice(0, 8)}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">for {booking.service.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(booking.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleCancel}
                  disabled={
                    booking.status !== "pending" &&
                    booking.status !== "confirmed"
                  }
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Booking
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={booking.status.toUpperCase() !== "APPROVED"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Complete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will mark the booking as complete and release the
                payment to the business owner. This cannot be undone.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 w-full">
          <InfoBlock
            icon={<Calendar className="h-4 w-4" />}
            title="Booking Date"
          >
            <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
          </InfoBlock>
          <InfoBlock icon={<Clock className="h-4 w-4" />} title="Booking Time">
            <span>
              {new Date(booking.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(booking.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </InfoBlock>

          {booking.service && (
            <InfoBlock icon={<Briefcase className="h-4 w-4" />} title={`Service: ${booking.service.name}`}>
              <span className="text-xs text-gray-500 line-clamp-1">
                {booking.service.description}
              </span>
            </InfoBlock>
          )}

          {booking.payment && (
            <InfoBlock
              icon={<PoundSterling className="h-4 w-4" />}
              title={`Payment: ${booking.payment.paymentMethod}`}
            >
              <span>
                {new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: "GBP",
                }).format(booking.payment.amount)}
              </span>
            </InfoBlock>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyBookingCard;
