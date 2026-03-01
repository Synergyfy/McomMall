"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useGetGiftCardAssets, useDeleteGiftCardAsset } from '@/service/gift-card/asset-hook';
import { GiftCardAsset } from '@/service/gift-card/asset-types';
import { AssetForm } from './components/asset-form';
import { GiftCardAssetCard } from './components/GiftCardAssetCard';
import { CategoryList } from './components/category-list';

const GiftCardAssetsPage = () => {
  const { data: assets, isPending, isError } = useGetGiftCardAssets();
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteGiftCardAsset();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<GiftCardAsset | null>(null);

  useEffect(() => {
    // Reset selected asset when modal is closed
    if (!isModalOpen) {
      setSelectedAsset(null);
    }
  }, [isModalOpen]);

  const handleDelete = (id: string) => {
    deleteAsset(id, {
      onSuccess: () => {
        toast.success("Asset deleted successfully!");
      },
      onError: () => {
        toast.error("Failed to delete asset. Please try again.");
      },
    });
  };

  const handleEdit = (asset: GiftCardAsset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (isPending) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load gift card assets. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gift Card Assets</h1>
        <Button onClick={handleAddNew} className="bg-orange-600 hover:bg-orange-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Asset
        </Button>
      </div>

      <CategoryList />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          </DialogHeader>
          <AssetForm
            asset={selectedAsset}
            onClose={handleModalClose}
          />
        </DialogContent>
      </Dialog>

      {!assets || assets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">You haven&apos;t created any gift card assets yet.</p>
          <Button onClick={handleAddNew} className="bg-orange-600 hover:bg-orange-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Asset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <GiftCardAssetCard
              key={asset.id}
              asset={asset}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftCardAssetsPage;