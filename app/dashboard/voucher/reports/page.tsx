'use client';

import React, { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

declare global {
  interface Window {
    jspdf: {
      jsPDF: new () => jsPDFWithAutoTable;
    };
  }
}

// Interface for the jsPDF instance with the autoTable plugin
interface jsPDFWithAutoTable {
  text: (text: string, x: number, y: number) => void;
  autoTable: (options: {
    head: string[][];
    body: (string | number)[][];
    startY: number;
  }) => void;
  save: (filename: string) => void;
}

// --- TYPE DEFINITIONS ---
interface Customer {
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface Order {
  id: string;
  date: string;
  paymentMethod: string;
  total: number;
  discount: number;
}

interface Voucher {
  id: string;
  code: string;
  productName: string;
  price: number;
  purchaseDate: string;
  status: 'used' | 'purchased' | 'expired';
  customer: Customer;
  order: Order;
}

// --- MOCK DATA ---
const mockVouchers: Voucher[] = [
  {
    id: '1',
    code: 'VOU-123-ABC',
    productName: 'Premium T-Shirt',
    price: 29.99,
    purchaseDate: '2023-10-26',
    status: 'used',
    customer: {
      name: 'John Doe',
      email: 'john.d@example.com',
      address: '123 Main St, Anytown, USA',
      phone: '555-1234',
    },
    order: {
      id: 'ORD-001',
      date: '2023-10-26',
      paymentMethod: 'Credit Card',
      total: 29.99,
      discount: 0,
    },
  },
  {
    id: '2',
    code: 'VOU-456-DEF',
    productName: 'Leather Wallet',
    price: 49.99,
    purchaseDate: '2023-11-15',
    status: 'purchased',
    customer: {
      name: 'Jane Smith',
      email: 'jane.s@example.com',
      address: '456 Oak Ave, Someville, USA',
      phone: '555-5678',
    },
    order: {
      id: 'ORD-002',
      date: '2023-11-15',
      paymentMethod: 'PayPal',
      total: 49.99,
      discount: 5.0,
    },
  },
  {
    id: '3',
    code: 'VOU-789-GHI',
    productName: 'Wireless Headphones',
    price: 99.99,
    purchaseDate: '2023-09-01',
    status: 'expired',
    customer: {
      name: 'Peter Jones',
      email: 'peter.j@example.com',
      address: '789 Pine Ln, Othertown, USA',
      phone: '555-9012',
    },
    order: {
      id: 'ORD-003',
      date: '2023-09-01',
      paymentMethod: 'Credit Card',
      total: 99.99,
      discount: 0,
    },
  },
  {
    id: '4',
    code: 'VOU-101-JKL',
    productName: 'Coffee Mug',
    price: 12.5,
    purchaseDate: '2023-11-20',
    status: 'used',
    customer: {
      name: 'Alice Williams',
      email: 'alice.w@example.com',
      address: '101 Maple Dr, Anytown, USA',
      phone: '555-3456',
    },
    order: {
      id: 'ORD-004',
      date: '2023-11-20',
      paymentMethod: 'Debit Card',
      total: 12.5,
      discount: 0,
    },
  },
  {
    id: '5',
    code: 'VOU-112-MNO',
    productName: 'Scented Candle',
    price: 18.0,
    purchaseDate: '2023-12-01',
    status: 'purchased',
    customer: {
      name: 'Bob Brown',
      email: 'bob.b@example.com',
      address: '112 Birch Rd, Someville, USA',
      phone: '555-7890',
    },
    order: {
      id: 'ORD-005',
      date: '2023-12-01',
      paymentMethod: 'PayPal',
      total: 18.0,
      discount: 0,
    },
  },
];

// --- MAIN COMPONENT ---
export default function ExportReportsPage() {
  const [vouchers] = useState<Voucher[]>(mockVouchers);
  const [voucherCode, setVoucherCode] = useState('');
  const [productName, setProductName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const purchaseDate = new Date(v.purchaseDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (
        v.code.toLowerCase().includes(voucherCode.toLowerCase()) &&
        v.productName.toLowerCase().includes(productName.toLowerCase()) &&
        v.customer.name.toLowerCase().includes(customerName.toLowerCase()) &&
        (!start || purchaseDate >= start) &&
        (!end || purchaseDate <= end) &&
        (status === '' || v.status === status)
      );
    });
  }, [
    vouchers,
    voucherCode,
    productName,
    customerName,
    startDate,
    endDate,
    status,
  ]);

  const exportToPDF = () => {
    if (typeof window !== 'undefined' && window.jspdf) {
      const { jsPDF } = window.jspdf;
      const doc: jsPDFWithAutoTable = new jsPDF();
      doc.text('Voucher Report', 14, 16);
      doc.autoTable({
        head: [
          ['Voucher Code', 'Product', 'Customer', 'Purchase Date', 'Status'],
        ],
        body: filteredVouchers.map(v => [
          v.code,
          v.productName,
          v.customer.name,
          v.purchaseDate,
          v.status,
        ]),
        startY: 20,
      });
      doc.save('voucher-report.pdf');
    } else {
      console.error("jsPDF library not found. Please ensure it's loaded.");
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Voucher Code',
      'Product Name',
      'Price',
      'Purchase Date',
      'Status',
      'Customer Name',
      'Customer Email',
      'Customer Address',
      'Customer Phone',
      'Order ID',
      'Order Date',
      'Payment Method',
      'Order Total',
      'Order Discount',
    ];
    const rows = filteredVouchers.map(v =>
      [
        v.code,
        v.productName,
        v.price,
        v.purchaseDate,
        v.status,
        v.customer.name,
        v.customer.email,
        `"${v.customer.address}"`,
        v.customer.phone,
        v.order.id,
        v.order.date,
        v.order.paymentMethod,
        v.order.total,
        v.order.discount,
      ].join(',')
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'voucher-report-detailed.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DetailRow = ({ voucher }: { voucher: Voucher }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-normal p-4">
      <div>
        <h4 className="font-semibold mb-2">Voucher Details</h4>
        <p>
          <strong>Code:</strong> {voucher.code}
        </p>
        <p>
          <strong>Product:</strong> {voucher.productName}
        </p>
        <p>
          <strong>Price:</strong> £{voucher.price.toFixed(2)}
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Customer Details</h4>
        <p>
          <strong>Name:</strong> {voucher.customer.name}
        </p>
        <p>
          <strong>Email:</strong> {voucher.customer.email}
        </p>
        <p>
          <strong>Address:</strong> {voucher.customer.address}
        </p>
        <p>
          <strong>Phone:</strong> {voucher.customer.phone}
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Order Details</h4>
        <p>
          <strong>Order ID:</strong> {voucher.order.id}
        </p>
        <p>
          <strong>Date:</strong> {voucher.order.date}
        </p>
        <p>
          <strong>Payment:</strong> {voucher.order.paymentMethod}
        </p>
        <p>
          <strong>Total:</strong> £{voucher.order.total.toFixed(2)}
        </p>
        <p>
          <strong>Discount:</strong> £{voucher.order.discount.toFixed(2)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Export Reports</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6 p-4 border rounded-lg bg-gray-50">
          <div className="space-y-1.5">
            <Label htmlFor="voucher-code">Voucher Code</Label>
            <Input
              id="voucher-code"
              value={voucherCode}
              onChange={e => setVoucherCode(e.target.value)}
              placeholder="Voucher code..."
              className="text-base py-5"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Product name..."
              className="text-base py-5"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Customer name..."
              className="text-base py-5"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal text-base py-5 h-auto',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal text-base py-5 h-auto',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="text-base py-5">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="purchased">Purchased</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-2 sm:mb-0">
            {filteredVouchers.length} items found
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportToPDF}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Generate PDF
            </Button>
            <Button
              onClick={exportToCSV}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table className="md:text-lg">
            <TableHeader className="bg-orange-600 text-white">
              <TableRow>
                <TableHead>Voucher Code</TableHead>
                <TableHead>Product Information</TableHead>
                <TableHead>{"Buyer's Information"}</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map(voucher => (
                <React.Fragment key={voucher.id}>
                  <TableRow
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === voucher.id ? null : voucher.id
                      )
                    }
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {voucher.code}
                    </TableCell>
                    <TableCell>
                      {voucher.productName} (£{voucher.price.toFixed(2)})
                    </TableCell>
                    <TableCell>
                      {voucher.customer.name} ({voucher.customer.email})
                    </TableCell>
                    <TableCell>{voucher.purchaseDate}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          voucher.status === 'used'
                            ? 'bg-green-100 text-green-800'
                            : voucher.status === 'purchased'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {voucher.status}
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedRow === voucher.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <div className="bg-gray-50 p-4">
                          <DetailRow voucher={voucher} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
