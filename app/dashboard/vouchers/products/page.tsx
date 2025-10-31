'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import {
  useGetVoucherProducts,
  useDeleteVoucherProduct,
} from '@/service/hooks/useVoucherService';
import { VoucherProduct } from '@/service/vouchers/types';
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// --- Reusable UI Components ---

const ActionButton: React.FC<{
  children: React.ReactNode;
  variant: 'edit' | 'delete';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ children, variant, onClick }) => {
  const baseClasses =
    'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-transform duration-200 ease-in-out hover:scale-105';
  const variants = {
    edit: 'bg-green-500 hover:bg-green-600',
    delete: 'bg-red-500 hover:bg-red-600',
  };
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

type VoucherProductRowProps = {
  product: VoucherProduct;
  onDelete: (productId: string) => void;
};

const VoucherProductRow: React.FC<VoucherProductRowProps> = ({
  product,
  onDelete,
}) => {
  const router = useRouter();
  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const renderPricing = () => {
    const parts = [];
    if (product.fixedAmounts && product.fixedAmounts.length > 0) {
      parts.push(`Fixed: ${product.fixedAmounts.join(', ')}`);
    }
    if (product.allowCustomAmount) {
      parts.push(
        `Custom: ${product.minCustomAmount} - ${product.maxCustomAmount}`
      );
    }
    return parts.length > 0 ? parts.join('; ') : 'N/A';
  };

  return (
    <motion.tr
      variants={rowVariants}
      className="border-b border-slate-200 bg-white"
    >
      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
        {product.name}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {renderPricing()}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {product.expiryDays || 'N/A'}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.isEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.isEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.allowReloading
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {product.allowReloading ? 'Yes' : 'No'}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/vouchers/products/edit/${product.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </Link>
          <ActionButton variant="delete" onClick={() => onDelete(product.id)}>
            <Trash2 className="h-3 w-3" />
            <span>Delete</span>
          </ActionButton>
        </div>
      </td>
    </motion.tr>
  );
};

// --- Main Page Component ---

export default function VoucherProductsPage() {
  const { voucherProducts, isLoading, isError, mutate } =
    useGetVoucherProducts();
  const deleteVoucherProduct = useDeleteVoucherProduct();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const handleDeleteClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProductId) {
      try {
        await deleteVoucherProduct(selectedProductId);
        toast.success('Voucher product deleted successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedProductId(null);
        mutate();
      } catch (error) {
        toast.error('Failed to delete voucher product.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-4xl font-bold text-slate-800">
            Voucher Products
          </h1>
          <p className="text-sm text-slate-500">
            Home &gt; Dashboard &gt; Vouchers
          </p>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'Name',
                    'Pricing',
                    'Expiry (Days)',
                    'Status',
                    'Reloadable',
                    'Actions',
                  ].map(header => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-200"
              >
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-red-500">
                      Error loading voucher products.
                    </td>
                  </tr>
                )}
                {voucherProducts?.map(product => (
                  <VoucherProductRow
                    key={product.id}
                    product={product}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </motion.tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-slate-200">
            <span className="text-xs text-gray-600">
              Reloadable vouchers can be topped up by customers.
            </span>
          </div>
        </div>

        <footer className="mt-8 flex justify-start">
          <Link href="/dashboard/vouchers/products/new">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add New Product</span>
            </motion.div>
          </Link>
        </footer>
      </main>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              voucher product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}