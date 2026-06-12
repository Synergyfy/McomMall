'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Tag,
  Calendar,
  AlertCircle,
  MoreVertical,
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Promotion } from '@/service/promotions/types';
import { useGetPromotions, useDeletePromotion } from '@/service/promotions/hook';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function PromotionsManager() {
  const router = useRouter();
  const { data: promotions, isLoading, error } = useGetPromotions();
  const deletePromotion = useDeletePromotion();

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

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
    if (type === 'MULTIPLIER') return 'POINT MULTIPLIER';
    if (type === 'BONUS_POINTS') return 'BONUS POINTS';
    return type;
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
        <p>Error loading promotions: {error.message}</p>
      </div>
    );
  }

  const activeCount = promotions?.filter(p => p.isActive).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">
            Create and manage loyalty campaigns to drive engagement.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/promotions/new')} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
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
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions && promotions.length > 0 ? (
                                  promotions.map((promo) => {
                                    const isExpired = promo.endDate && new Date(promo.endDate) < new Date();
                                    const statusLabel = isExpired ? "Expired" : promo.isActive ? "Active" : "Inactive";
                                    const badgeVariant = isExpired ? "destructive" : promo.isActive ? "default" : "secondary";
                                    const badgeClass = isExpired ? "" : promo.isActive ? "bg-green-600 hover:bg-green-700" : "";
                
                                    return (
                                      <TableRow key={promo.id} className="group">
                                        <TableCell>
                                          <Badge variant={badgeVariant} className={badgeClass}>
                                            {statusLabel}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div>
                                            <div className="font-medium text-foreground">{promo.name}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{promo.description}</div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{formatPromotionType(promo.promotionType)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                            {promo.beginDate ? format(new Date(promo.beginDate), 'MMM d, yyyy') : 'Start'} 
                                            {' - '} 
                                            {promo.endDate ? format(new Date(promo.endDate), 'MMM d, yyyy') : 'End'}
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
                                              <DropdownMenuItem onClick={() => router.push(`/dashboard/promotions/edit/${promo.id}`)}>
                                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => openDeleteConfirmation(promo.id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No campaigns found. Create one to get started.
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
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign and remove it from all associated listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromotionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePromotion} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
