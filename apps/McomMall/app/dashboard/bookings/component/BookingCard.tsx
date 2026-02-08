"use client";

import type { FC } from "react";
import { PoundSterling } from "lucide-react";
import {
  Calendar,
  User,
  Clock,
  MoreHorizontal,
  XCircle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ChatIcon from "@/components/ChatIcon";
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
  useDeclineBooking,
  useApproveBooking,
  useMarkBookingComplete,
} from "@/service/bookings/hook";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BookingDetailsModal from "./BookingDetailsModal";

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

import { DollarSign, Briefcase } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const BookingCard: FC<{
  booking: Booking;
  isSelected: boolean;
  onSelectionChange: (bookingId: string, isSelected: boolean) => void;
}> = ({ booking, isSelected, onSelectionChange }) => {
  const router = useRouter();
  const declineBookingMutation = useDeclineBooking();
  const approveBookingMutation = useApproveBooking();
  const markCompleteMutation = useMarkBookingComplete();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleMessage = () => {
    router.push(`/dashboard/messages?receiverId=${booking.user.id}`);
  };

  const handleDecline = () => {
    handleStatusChange("decline", booking.id);
  };

  const handleApprove = () => {
    handleStatusChange("approve", booking.id);
  };

  const handleMarkComplete = () => {
    markCompleteMutation.mutate(booking.id);
    setIsConfirmOpen(false);
  };

  const [confirmationStatus, setConfirmationStatus] = useState<{
    action: "approve" | "decline" | null;
    bookingId: string | null;
  }>({
    action: null,
    bookingId: null,
  });

  const handleStatusChange = (
    action: "approve" | "decline",
    bookingId: string
  ) => {
    setConfirmationStatus({ action, bookingId });
  };

  const confirmStatusChange = () => {
    if (confirmationStatus.action === "approve") {
      approveBookingMutation.mutate(confirmationStatus.bookingId as string);
    } else if (confirmationStatus.action === "decline") {
      declineBookingMutation.mutate(confirmationStatus.bookingId as string);
    }
    setConfirmationStatus({ action: null, bookingId: null });
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
      <Badge variant="outline" className={style.badge}>
        {status}
      </Badge>
    );
  };

  const cardBorderStyle =
    statusStyles[booking.status]?.border || statusStyles.default.border;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onSelectionChange(booking.id, Boolean(checked))
          }
        />
      </div>
      <Card
        onClick={() => setIsModalOpen(true)}
        className={`shadow-sm hover:shadow-md transition-shadow duration-300 w-full ${cardBorderStyle}`}
      >
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="pl-8">
              <h2 className="text-xl font-bold text-gray-800">
                Booking #{booking.id.slice(0, 8)}
              </h2>
              <p className="text-sm text-gray-500">
                for {booking.service.name}
              </p>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove();
                    }}
                    disabled={booking.status.toUpperCase() !== "PENDING"}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Booking
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDecline();
                    }}
                    disabled={booking.status.toUpperCase() !== "PENDING"}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline Booking
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmOpen(true);
                    }}
                    disabled={booking.status.toUpperCase() !== "APPROVED"}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.stopPropagation();
                      handleMessage();
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Customer
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
                  This action will mark the booking as complete. If the customer
                  has also marked it as complete, the payment will be released.
                  This cannot be undone.
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

          <AlertDialog
            open={!!confirmationStatus.action}
            onOpenChange={() =>
              setConfirmationStatus({ action: null, bookingId: null })
            }
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to {confirmationStatus.action} this
                  booking?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() =>
                    setConfirmationStatus({ action: null, bookingId: null })
                  }
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmStatusChange}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(booking.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </InfoBlock>
          </div>

          {booking.user && (
            <InfoBlock icon={<User className="h-4 w-4" />} title="Customer">
              <p className="font-semibold">{booking.user.name}</p>
              <p className="text-xs text-gray-500">{booking.user.email}</p>
            </InfoBlock>
          )}
          {booking.service && (
            <InfoBlock icon={<Briefcase className="h-4 w-4" />} title="Service">
              <p className="font-semibold">{booking.service.name}</p>
              <p className="text-xs text-gray-500">
                {booking.service.description}
              </p>
            </InfoBlock>
          )}
          {booking.payment && (
            <InfoBlock
              icon={<PoundSterling className="h-4 w-4" />}
              title="Payment"
            >
              <p className="font-semibold">
                {new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: "GBP",
                }).format(booking.payment.amount)}
              </p>
              <p className="text-xs text-gray-500">
                via {booking.payment.paymentMethod}
              </p>
            </InfoBlock>
          )}
        </CardContent>
      </Card>
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={booking}
      />
    </div>
  );
};

export default BookingCard;
