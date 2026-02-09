'use client';

import * as React from 'react';
import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight, Search, MoreHorizontal, Download } from 'lucide-react';
import { useGetStoreOrders } from '@/service/store/orders/hook';
import Papa from 'papaparse';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useMarkNotificationsAsSeen, useGetNotifications } from '@/service/notifications/hook';
import { type Order as ApiOrder } from '@/service/store/orders/types';

// In a real Next.js app with shadcn/ui, you would import components like this:
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';

// --- Type Definitions ---
type ActualOrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type OrderStatus = 'All' | ActualOrderStatus;
type BadgeStatus = ActualOrderStatus;
type Order = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: ActualOrderStatus;
  itemCount: number;
  total: number;
  date: string;
  productName: string;
};

// --- HELPER COMPONENTS ---
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      main: 'Invalid Date',
      sub: 'Last Modified',
    };
  }
  return {
    main: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date),
    sub: 'Last Modified', // Or calculate time ago
  };
};

const StatusBadge: React.FC<{ status: BadgeStatus }> = ({ status }) => {
  const variants: Record<
    BadgeStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    Delivered: 'default',
    Shipped: 'secondary',
    Processing: 'outline',
    Cancelled: 'destructive',
  };
  const classNames: Record<BadgeStatus, string> = {
    Delivered: 'bg-green-100 text-green-800 border-green-200',
    Shipped: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Processing: 'bg-blue-100 text-blue-800 border-blue-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant={variants[status]} className={classNames[status]}>
      {status}
    </Badge>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function OrdersDashboard() {
  const { userRole } = useSelector((state: RootState) => state.auth);
  const { data: apiOrders, isLoading } = useGetStoreOrders();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<OrderStatus>('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const { newOrdersCount, newOrderIds } = useGetNotifications();
  const { mutate: markAsSeen } = useMarkNotificationsAsSeen();

  const isMerchant = userRole !== 'customer';

  useEffect(() => {
    if (newOrdersCount > 0 && isMerchant) {
      markAsSeen({ notificationIds: newOrderIds });
    }
  }, [newOrdersCount, newOrderIds, markAsSeen, isMerchant]);

  const orders = useMemo(() => {
    if (!apiOrders) return [];
    return apiOrders.map((order: ApiOrder) => ({
      id: order.id,
      userId: order.user?.id || '',
      customerName: order.user?.name || 'N/A',
      customerEmail: order.user?.email || 'N/A',
      // TODO: The API does not provide an order status. Defaulting to 'Processing'.
      status: 'Processing' as ActualOrderStatus,
      itemCount: order.quantity,
      total: order.payment?.amount || 0,
      date: order.created_at,
      // TODO: The API does not provide product details in the order response.
      // Defaulting to 'N/A'. A backend change is required to include this.
      productName: 'N/A',
    }));
  }, [apiOrders]);

  const filteredOrders = React.useMemo(() => {
    let tempOrders = [...orders];
    if (activeTab !== 'All')
      tempOrders = tempOrders.filter(o => o.status === activeTab);
    if (searchTerm)
      tempOrders = tempOrders.filter(
        o =>
          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return tempOrders;
  }, [orders, activeTab, searchTerm]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setSelectedRows(checked === true ? filteredOrders.map(o => o.id) : []);
  };

  const handleSelectRow = (orderId: string) => {
    setSelectedRows(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) {
      return;
    }
    toast.info(`'${action}' action is not yet implemented.`);
  };

  const handleExport = () => {
    if (!orders) return;
    const csv = Papa.unparse(
      orders.map(order => ({
        ID: order.id,
        [isMerchant ? 'Customer' : 'Store/Merchant']: order.customerName,
        Email: order.customerEmail,
        Product: order.productName,
        Status: order.status,
        Items: order.itemCount,
        Total: order.total,
        Date: order.date,
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-t;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${isMerchant ? 'sales' : 'purchases'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TABS: OrderStatus[] = [
    'All',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];
  const isAllSelected =
    selectedRows.length > 0 && selectedRows.length === filteredOrders.length;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < filteredOrders.length;

  return (
    <>
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Full details for order #{selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p><strong>{isMerchant ? 'Customer' : 'Store'}:</strong> {selectedOrder.customerName}</p>
              <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
              <p><strong>Product:</strong> {selectedOrder.productName}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Items:</strong> {selectedOrder.itemCount}</p>
              <p><strong>Total:</strong> £{selectedOrder.total.toFixed(2)}</p>
              <p><strong>Date:</strong> {formatDate(selectedOrder.date).main}</p>
              {isMerchant && (
                <Button onClick={() => router.push(`/dashboard/messages?receiverId=${selectedOrder.userId}`)}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Message Customer
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .responsive-table thead {
            display: none;
          }
          .responsive-table tr {
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          }
          .responsive-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #f1f5f9;
            text-align: right;
          }
          .responsive-table td:last-child {
            border-bottom: none;
          }
          .responsive-table td::before {
            content: attr(data-label);
            font-weight: 600;
            text-align: left;
            margin-right: 1rem;
            color: #475569;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isMerchant ? 'Sales Dashboard' : 'My Purchases'}
              </h1>
              <TooltipProvider>
                <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <span>Order Status Flow:</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">Processing</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Initial status of an order after it has been placed.</p>
                    </TooltipContent>
                  </Tooltip>
                  <span>→</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary">Shipped</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Status after the order has been shipped to the customer.</p>
                    </TooltipContent>
                  </Tooltip>
                  <span>→</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="default">Delivered</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Status when the order has been successfully delivered.</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="destructive">Cancelled</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Status if the order is cancelled.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>Home</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>Dashboard</span>
            </div>
          </header>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4">
              <div className="flex flex-wrap items-center text-sm text-gray-600 -mb-2">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === 'All') {
                        setActiveTab(tab);
                      } else {
                        toast.info('Filtering by status is not yet available.');
                      }
                    }}
                    className={`pb-2 sm:pb-0 px-3 py-2 rounded-md mb-2 ${activeTab === tab
                      ? 'bg-gray-100 font-semibold text-gray-800'
                      : ''
                      }`}
                  >
                    {tab} (
                    {tab === 'All'
                      ? orders.length
                      : orders.filter(o => o.status === tab).length}
                    )
                  </button>
                ))}
              </div>
              <Button className="mt-4 sm:mt-0 w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white" onClick={handleExport} disabled={!orders || orders.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export {isMerchant ? 'Orders' : 'History'}
              </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                {isMerchant && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      onCheckedChange={handleSelectAll}
                      checked={
                        isAllSelected ||
                        (isIndeterminate ? 'indeterminate' : false)
                      }
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All
                    </label>
                  </div>
                )}
                {isMerchant && (
                  <Select onValueChange={handleBulkAction} disabled={selectedRows.length === 0}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Bulk Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delete">
                        Delete Selected
                      </SelectItem>
                      <SelectItem value="mark-shipped">
                        Mark as Shipped
                      </SelectItem>
                      <SelectItem value="mark-delivered">
                        Mark as Delivered
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="relative flex-grow md:flex-grow-0 md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder={isMerchant ? "Search Orders by ID or Customer..." : "Search by ID or Product..."}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-full responsive-table">
                <TableHeader className="hidden md:table-header-group bg-gray-50">
                  <TableRow>
                    {isMerchant && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          onCheckedChange={handleSelectAll}
                          checked={
                            isAllSelected ||
                            (isIndeterminate ? 'indeterminate' : false)
                          }
                        />
                      </TableHead>
                    )}
                    <TableHead>Order ID</TableHead>
                    <TableHead>{isMerchant ? 'Customer' : 'Store'}</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="block md:table-row-group">
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center block md:table-cell"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <TableRow
                        key={order.id}
                        className="mobile-table-card md:table-row hover:bg-gray-50 transition-colors"
                        data-state={
                          selectedRows.includes(order.id) ? 'selected' : ''
                        }
                      >
                        {isMerchant && (
                          <TableCell
                            data-label="Select"
                            className="responsive-cell"
                          >
                            <Checkbox
                              checked={selectedRows.includes(order.id)}
                              onCheckedChange={() => handleSelectRow(order.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell
                          data-label="Order ID"
                          className="responsive-cell font-medium text-gray-800"
                        >
                          {order.id}
                        </TableCell>
                        <TableCell
                          data-label={isMerchant ? "Customer" : "Store"}
                          className="responsive-cell"
                        >
                          <div className="flex flex-col items-end md:items-start">
                            <span className="font-medium text-blue-600">
                              {order.customerName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.customerEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          data-label="Product Name"
                          className="responsive-cell font-medium text-gray-800"
                        >
                          {order.productName}
                        </TableCell>
                        <TableCell
                          data-label="Status"
                          className="responsive-cell"
                        >
                          <StatusBadge status={order.status as BadgeStatus} />
                        </TableCell>
                        <TableCell
                          data-label="Items"
                          className="responsive-cell text-gray-600"
                        >
                          {order.itemCount}
                        </TableCell>
                        <TableCell
                          data-label="Total"
                          className="responsive-cell font-medium text-gray-800"
                        >
                          £{order.total.toFixed(2)}
                        </TableCell>
                        <TableCell
                          data-label="Date"
                          className="responsive-cell text-gray-600"
                        >
                          <div className="flex flex-col text-xs items-end md:items-start">
                            <span className="font-medium">{formatDate(order.date).main}</span>
                            <span className="text-gray-400">
                              {formatDate(order.date).sub}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="responsive-cell">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="block md:table-row">
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center block md:table-cell text-gray-500"
                      >
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
