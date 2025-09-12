'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Edit,
  Copy,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
  Promotion,
} from '@/service/promotions/types';
import { useGetPromotions, useDeletePromotion } from '@/service/promotions/hook';
import { toast } from 'sonner';

// Main Component
export function PromotionsManager() {
  const router = useRouter();
  const {
    data: promotions,
    isLoading,
    error,
  } = useGetPromotions();
  const deletePromotion = useDeletePromotion();

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(
    null
  );

  const handleDeletePromotion = async () => {
    if (promotionToDelete === null) return;
    try {
      await deletePromotion.mutateAsync(promotionToDelete);
      toast.success('Promotion deleted successfully!');
      setDeleteAlertOpen(false);
      setPromotionToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete promotion'
      );
    }
  };

  const openDeleteConfirmation = (id: string) => {
    setPromotionToDelete(id);
    setDeleteAlertOpen(true);
  };

  const formatPromotionType = (type: 'MULTIPLIER' | 'BONUS_POINTS') => {
    if (type === 'MULTIPLIER') return 'Multiplier';
    if (type === 'BONUS_POINTS') return 'Bonus Points';
    return 'N/A';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <p className="text-gray-600 mb-4">
        Promotions are automatically applied to qualifying orders. Use
        promotions to drive sales for specific products or categories.
      </p>
      <Button
        onClick={() => router.push('/dashboard/loyalty/promotion/new')}
        className="mb-6 bg-blue-900 hover:bg-blue-950"
      >
        <PlusCircle className="h-4 w-4 mr-2" /> Create Promotion
      </Button>

      {/* Promotions Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-orange-600">
              <TableRow className="hover:bg-orange-600">
                <TableHead className="text-white font-bold w-[100px]">
                  Status
                </TableHead>
                <TableHead className="text-white font-bold">Name</TableHead>
                <TableHead className="text-white font-bold">
                  Description
                </TableHead>
                <TableHead className="text-white font-bold">Type</TableHead>
                <TableHead className="text-white font-bold">
                  Begin / end dates
                </TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-red-500"
                  >
                    Error loading promotions: {error.message}
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {promotions?.map((promo: Promotion) => (
                    <motion.tr
                      key={promo.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              promo.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          ></span>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href="#"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {promo.name}
                        </a>
                      </TableCell>
                      <TableCell>{promo.description}</TableCell>
                      <TableCell>
                        {formatPromotionType(promo.promotionType)}
                      </TableCell>
                      <TableCell>
                        {promo.beginDate
                          ? new Date(promo.beginDate).toLocaleString()
                          : 'N/A'}{' '}
                        -{' '}
                        {promo.endDate
                          ? new Date(promo.endDate).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteConfirmation(promo.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              promotion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromotionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePromotion}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
