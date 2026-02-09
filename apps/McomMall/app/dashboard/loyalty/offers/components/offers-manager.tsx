'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Gift,
  Tag,
  MoreVertical,
  Calendar,
  AlertCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGetOffers, useDeleteOffer } from '@/service/offers/hook';
import { Offer } from '@/service/offers/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

type FormCouponType =
  | 'FIXED CART DISCOUNT'
  | 'PERCENTAGE DISCOUNT'
  | 'FREE PRODUCT(S)'
  | 'BONUS POINTS';

export function OffersManager() {
  const router = useRouter();
  const { data: offers, isLoading, error } = useGetOffers();
  const { mutateAsync: deleteOffer } = useDeleteOffer();
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  const formatCouponTypeFromDto = (
    type: Offer['rewardCouponType']
  ): FormCouponType => {
    switch (type) {
      case 'FIXED_CART_DISCOUNT':
        return 'FIXED CART DISCOUNT';
      case 'PERCENTAGE_DISCOUNT':
        return 'PERCENTAGE DISCOUNT';
      case 'FREE_PRODUCTS':
        return 'FREE PRODUCT(S)';
      case 'BONUS_POINTS':
        return 'BONUS POINTS';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading offers: {error.message}</p>
      </div>
    );
  }

  const activeCount = offers?.filter(o => o.isActive).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rewards</h2>
          <p className="text-muted-foreground">
            Manage rewards that customers can redeem with their points.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/loyalty/offers/new')} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" /> Create Reward
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Reward Name</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers && offers.length > 0 ? (
                offers.map((offer) => (
                  <TableRow key={offer.id} className="group">
                    <TableCell>
                      <Badge variant={offer.isActive ? "default" : "secondary"} className={offer.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                        {offer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{offer.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{offer.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        {offer.points.toLocaleString()} pts
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatCouponTypeFromDto(offer.rewardCouponType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4 opacity-70" />
                        {offer.beginDate ? format(new Date(offer.beginDate), 'MMM d, yyyy') : 'Start'}
                        {' - '}
                        {offer.endDate ? format(new Date(offer.endDate), 'MMM d, yyyy') : 'End'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/loyalty/offers/edit/${offer.id}`)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteConfirmation(offer.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No rewards found. Create one to let customers redeem points.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this reward option.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOfferToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOffer} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}