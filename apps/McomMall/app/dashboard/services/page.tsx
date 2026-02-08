'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronRight,
  PlusCircle,
  MoreHorizontal,
  Trash2,
  Edit,
} from 'lucide-react';
import { useGetMyServices, useDeleteService } from '@/service/services/hook';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Service } from '@/service/services/types';

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export default function ServicesDashboard() {
  const { data: services = [], isLoading, isError, error } = useGetMyServices();
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);
  const [selectedService, setSelectedService] = React.useState<string | null>(
    null
  );

  const router = useRouter();
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

  const handleDelete = () => {
    if (selectedService) {
      deleteService(selectedService, {
        onSuccess: () => {
          setShowDeleteConfirmation(false);
          setSelectedService(null);
        },
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? services.map(s => s.id) : []);
  };

  const handleSelectRow = (serviceId: string, checked: boolean) => {
    setSelectedRows(prev =>
      checked ? [...prev, serviceId] : prev.filter(id => id !== serviceId)
    );
  };

  const isAllSelected =
    selectedRows.length > 0 && services && selectedRows.length === services.length;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
        <AlertDialog
          open={showDeleteConfirmation}
          onOpenChange={setShowDeleteConfirmation}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                service.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Services Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Manage your services, view their status, and perform actions like editing or deleting them.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span>Home</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-700">Dashboard</span>
            </div>
          </header>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4">
              <div className="flex flex-wrap items-center text-sm text-gray-600 -mb-2">
                {/* Tabs can be added here if needed in the future */}
              </div>
              <Button
                className="mt-4 sm:mt-0 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                onClick={() =>
                  router.push('/dashboard/services/add-service')
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add new service
              </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="hidden md:table-header-group bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        onCheckedChange={handleSelectAll}
                        checked={isAllSelected}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pricing Model</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="block md:table-row-group">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Loading services...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-red-500"
                      >
                        Error loading services: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : services.length > 0 ? (
                    services.map(service => {
                      const firstImageUrl = service.media?.find(isImageUrl);
                      return (
                      <TableRow
                        key={service.id}
                        className="mobile-table-card md:table-row"
                        data-state={
                          selectedRows.includes(service.id) ? 'selected' : ''
                        }
                      >
                        <TableCell className="mobile-table-cell-checkbox md:table-cell">
                          <Checkbox
                            checked={selectedRows.includes(service.id)}
                            onCheckedChange={checked =>
                              handleSelectRow(service.id, !!checked)
                            }
                            aria-label={`Select row for ${service.name}`}
                          />
                        </TableCell>
                        <TableCell
                            data-label="Image"
                            className="mobile-table-cell md:table-cell"
                        >
                            <Link href={`/services/${service.id}`} passHref>
                                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer">
                                    {firstImageUrl ? (
                                        <img
                                            src={firstImageUrl}
                                            alt={service.name}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                            </Link>
                        </TableCell>
                        <TableCell
                          data-label="Name"
                          className="mobile-table-cell md:table-cell font-medium text-gray-800"
                        >
                          <Link
                            href={`/services/${service.id}`}
                            className="hover:underline"
                          >
                            {service.name}
                          </Link>
                        </TableCell>
                        <TableCell
                          data-label="Status"
                          className="mobile-table-cell md:table-cell"
                        >
                          <Badge
                            variant={
                              service.isActive ? 'default' : 'secondary'
                            }
                            className={
                              service.isActive
                                ? 'bg-green-100 text-green-800'
                                : ''
                            }
                          >
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell
                          data-label="Pricing Model"
                          className="mobile-table-cell md:table-cell text-gray-600"
                        >
                          {service.pricingModel}
                        </TableCell>
                        <TableCell
                          data-label="Price"
                          className="mobile-table-cell md:table-cell text-gray-600"
                        >
                          {service.pricingModel === 'fixed' &&
                            `£${service.fixedPrice}`}
                          {service.pricingModel === 'perHour' &&
                            `£${service.pricePerHour}/hr`}
                          {service.pricingModel === 'perUnit' &&
                            `£${service.pricePerUnit}/${service.unitName}`}
                        </TableCell>
                        <TableCell
                          data-label="Date"
                          className="mobile-table-cell md:table-cell text-gray-600"
                        >
                          <div className="flex flex-col text-xs items-end md:items-start">
                            <span>
                              {formatDate(
                                service.updated_at || service.created_at || ''
                              )}
                            </span>
                            <span className="text-gray-400">Last Modified</span>
                          </div>
                        </TableCell>
                        <TableCell className="mobile-table-cell md:table-cell">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() =>
                                  router.push(
                                    `/dashboard/services/edit/${service.id}`
                                  )
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setSelectedService(service.id);
                                  setShowDeleteConfirmation(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )})
                  ) : (
                    <TableRow className="block md:table-row">
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center block md:table-cell"
                      >
                        No services found.
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
