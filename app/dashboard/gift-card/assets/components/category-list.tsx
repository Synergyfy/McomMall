"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
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
import { useGetAssetCategories, useDeleteAssetCategory } from '@/service/gift-card/asset-category-hook';
import { AssetCategory } from '@/service/gift-card/asset-category-types';
import { CategoryForm } from './category-form';

export const CategoryList = () => {
  const { data: categories, isPending, isError } = useGetAssetCategories();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteAssetCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);

  const handleDelete = (id: string) => {
    deleteCategory(id, {
      onSuccess: () => {
        toast.success("Category deleted successfully!");
      },
      onError: () => {
        toast.error("Failed to delete category. Please try again.");
      },
    });
  };

  const handleEdit = (category: AssetCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Asset Categories</CardTitle>
          <Button onClick={handleAddNew} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory}
              onClose={handleModalClose}
            />
          </DialogContent>
        </Dialog>

        {isPending ? (
          <p>Loading categories...</p>
        ) : isError ? (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load categories.
            </AlertDescription>
          </Alert>
        ) : !categories || categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories created yet.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-2 border rounded-md">
                <span className="text-sm font-medium">{category.name}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-7 w-7" disabled={isDeleting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the category.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category.id)} disabled={isDeleting}>
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};