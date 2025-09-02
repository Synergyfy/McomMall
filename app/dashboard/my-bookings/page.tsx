// app/my-bookings/page.tsx
'use client';

import { useState, useMemo } from 'react';
import type { FC } from 'react';
import {
  Calendar,
  Users,
  User,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react';

// Import Shadcn UI Components
import { Badge } from '@/components/ui/badge';
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
import { useGetOrders } from '@/hooks/useGetOrders';
import { Order } from '@/types/order';
import Image from 'next/image';

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

const OrderCard: FC<{ order: Order }> = ({ order }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
    <CardContent className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {order.product.title}
          </h2>
          <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24">
          <Image
            src={order.product.imageUrl || '/placeholder.svg'}
            alt={order.product.title}
            layout="fill"
            className="object-cover rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <InfoBlock icon={<Calendar className="h-4 w-4" />} title="Order Date">
            <p>{new Date(order.created_at).toLocaleDateString()}</p>
          </InfoBlock>
          <InfoBlock icon={<Users className="h-4 w-4" />} title="Quantity">
            <p>{order.quantity}</p>
          </InfoBlock>
        </div>
      </div>

      <InfoBlock icon={<User className="h-4 w-4" />} title="Customer">
        <p className="font-semibold">{order.user.name}</p>
      </InfoBlock>

      {order.payment && (
        <>
          <InfoBlock
            icon={<DollarSign className="h-4 w-4" />}
            title="Total Price"
          >
            <p className="font-bold text-green-600">
              £{order.payment.amount.toFixed(2)}
            </p>
          </InfoBlock>

          <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t">
            <p>Transaction ID: {order.payment.transactionId}</p>
            <p>Payment Method: {order.payment.paymentMethod}</p>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

// --- 4. MAIN PAGE COMPONENT ---

const MyBookingsPage: FC = () => {
  const { data: orders, isLoading } = useGetOrders();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 4;

  const totalPages: number = Math.ceil((orders?.length || 0) / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    if (!orders) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return orders.slice(startIndex, endIndex);
  }, [currentPage, orders]);

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
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
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
          <h2 className="font-semibold text-gray-700">Your Bookings</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                July 13, 2025 - August 12, 2025
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
              <DropdownMenuItem>Last 90 Days</DropdownMenuItem>
              <DropdownMenuItem>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <main className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {paginatedOrders.map(order => (
            <OrderCard key={order.id} order={order} />
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
      </main>
    </div>
  );
};

export default MyBookingsPage;
