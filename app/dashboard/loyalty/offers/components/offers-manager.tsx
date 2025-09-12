'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useGetOffers, useDeleteOffer } from '@/service/offers/hook';
import { Offer } from '@/service/offers/types';
import { toast } from 'sonner';

type FormCouponType =
  | 'Fixed cart discount'
  | 'Percentage discount'
  | 'Free product(s)'
  | 'Bonus points';

// Main Component
export function OffersManager() {
  const router = useRouter();
  const { data: offers, isLoading, error } = useGetOffers();
  const { mutateAsync: deleteOffer } = useDeleteOffer();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  const formatCouponTypeFromDto = (
    type: Offer['rewardCouponType']
  ): FormCouponType => {
    switch (type) {
      case 'FIXED_CART_DISCOUNT':
        return 'Fixed cart discount';
      case 'PERCENTAGE_DISCOUNT':
        return 'Percentage discount';
      case 'FREE_PRODUCTS':
        return 'Free product(s)';
      case 'BONUS_POINTS':
        return 'Bonus points';
    }
  };

  const handleDeleteOffer = async () => {
    if (offerToDelete === null) return;
    try {
      await deleteOffer(offerToDelete);
      toast.success('Offer deleted successfully!');
      setDeleteAlertOpen(false);
      setOfferToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete offer'
      );
    }
  };

  const openDeleteConfirmation = (id: string) => {
    setOfferToDelete(id);
    setDeleteAlertOpen(true);
  };

  const categories = useMemo(
    () => ['all', ...new Set(offers?.map(o => o.category.name) || [])],
    [offers]
  );

  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    if (categoryFilter === 'all') return offers;
    return offers.filter(o => o.category.name === categoryFilter);
  }, [offers, categoryFilter]);

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <p className="text-gray-600 mb-4">
          Offers are a great way to reward your customers for their loyalty. You
          can create as many offers as you want and set the number of points
          required to redeem them.
        </p>
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.push('/dashboard/loyalty/offers/new')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Create Offer
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="category-filter">Filter by category</Label>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              disabled={isLoading || !!error}
            >
              <SelectTrigger id="category-filter" className="w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Offers Table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-orange-600">
                <TableRow className="hover:bg-orange-600">
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-white font-bold">
                    Category
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Offer name
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Description
                  </TableHead>
                  <TableHead className="text-white font-bold">Points</TableHead>
                  <TableHead className="text-white font-bold">Coupon</TableHead>
                  <TableHead className="text-white font-bold">
                    Begin / end dates
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-red-500"
                    >
                      Error loading offers: {error.message}
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {filteredOffers.map(offer => (
                      <motion.tr
                        key={offer.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="odd:bg-white even:bg-orange-50/50 hover:bg-gray-100"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-3 w-3 rounded-full ${
                                offer.isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            ></span>
                            {offer.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </TableCell>
                        <TableCell>{offer.category.name}</TableCell>
                        <TableCell>
                          <a
                            href="#"
                            className="font-medium text-orange-600 hover:underline"
                          >
                            {offer.name}
                          </a>
                        </TableCell>
                        <TableCell>{offer.description}</TableCell>
                        <TableCell>{offer.points.toLocaleString()}</TableCell>
                        <TableCell>
                          {formatCouponTypeFromDto(offer.rewardCouponType)}
                        </TableCell>
                        <TableCell>
                          {offer.beginDate
                            ? new Date(offer.beginDate).toLocaleString()
                            : 'N/A'}{' '}
                          -{' '}
                          {offer.endDate
                            ? new Date(offer.endDate).toLocaleString()
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
                              onClick={() => openDeleteConfirmation(offer.id)}
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
                This action cannot be undone. This will permanently delete this
                offer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOfferToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOffer}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
