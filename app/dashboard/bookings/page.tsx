'use client';

import { useState, useMemo, useEffect } from 'react';
import type { FC } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useMarkNotificationsAsSeen } from '@/service/notifications/hook';
import { MoreHorizontal } from 'lucide-react';

// Import Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useGetBusinessBookings } from '@/service/bookings/hook';
import BookingCard from './component/BookingCard';

const BookingsPage: FC = () => {
  const [days, setDays] = useState<number | undefined>(undefined);
  const { data: bookings, isLoading } = useGetBusinessBookings(days);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 4;
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  );
  const { mutate: markAsSeen } = useMarkNotificationsAsSeen();

  useEffect(() => {
    if (notifications && notifications.newBookings.count > 0) {
      markAsSeen({ notificationIds: notifications.newBookings.ids });
    }
  }, [notifications, markAsSeen]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (statusParam) {
      if (statusParam === 'approved') {
        return bookings.filter(
          booking =>
            booking.status === 'confirmed' || booking.status === 'approved'
        );
      }
      return bookings.filter(booking => booking.status === statusParam);
    }
    return bookings;
  }, [bookings, statusParam]);

  const totalPages: number = Math.ceil(
    (filteredBookings?.length || 0) / itemsPerPage
  );

  const paginatedBookings = useMemo(() => {
    if (!filteredBookings) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBookings.slice(startIndex, endIndex);
  }, [currentPage, filteredBookings]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Business Bookings</h1>
        <Breadcrumb className="mt-2 sm:mt-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <Card className="mb-8 shadow-sm">
        <CardContent className="p-4 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Your Customer Bookings</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {days ? `Last ${days} Days` : 'All Time'}
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDays(30)}>
                Last 30 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDays(90)}>
                Last 90 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDays(undefined)}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <main className="space-y-6">
        {paginatedBookings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {paginatedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? 'pointer-events-none text-gray-400' : ''
                    }
                  />
                </PaginationItem>
                <div className="hidden sm:flex">
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === i + 1}
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          handlePageChange(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </div>
                <div className="sm:hidden">
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                </div>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none text-gray-400'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No bookings found</h3>
            <p className="text-gray-500">
              There are no bookings with the status &apos;{statusParam}&apos;.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingsPage;
