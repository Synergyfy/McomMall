"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useGetGiftCardAssets, useDeleteGiftCardAsset } from '@/service/gift-card/asset-hook';
import { GiftCardAsset } from '@/service/gift-card/asset-types';
import { AssetForm } from './components/asset-form'; // This component will be created later

const GiftCardAssetsPage = () => {
  const { data: assets, isPending, isError } = useGetGiftCardAssets();
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteGiftCardAsset();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<GiftCardAsset | null>(null);

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
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAsset(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAsset(null);
  };

  if (isPending) {
    return <div>Loading...</div>;
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

      {isFormOpen && (
        <AssetForm
          asset={selectedAsset}
          onClose={handleFormClose}
        />
      )}

      {assets && assets.length === 0 && !isFormOpen ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">You haven&apos;t created any gift card assets yet.</p>
          <Button onClick={handleAddNew} className="bg-orange-600 hover:bg-orange-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Asset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets && assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0 relative">
                <Image src={asset.url} alt={asset.name} className="w-full h-48 object-cover" width={300} height={200} />
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-grow">
                <CardTitle className="text-lg font-semibold text-gray-800">{asset.name}</CardTitle>
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto">
                <div className="flex justify-end w-full gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(asset)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the gift card asset.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(asset.id)} disabled={isDeleting}>
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftCardAssetsPage;