"use client";
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddGiftCardCategory, useUpdateGiftCardCategory } from '@/service/gift-card/category-hook';
import { Category, CreateCategoryDto } from '@/service/gift-card/category-types';
import { toast } from "sonner";

interface CategoryFormProps {
  category: Category | null;
  onClose: () => void;
}

type FormData = {
    name: string;
};

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();

  const addCategoryMutation = useAddGiftCardCategory();
  const updateCategoryMutation = useUpdateGiftCardCategory();

  useEffect(() => {
    if (category) {
      setValue('name', category.name);
    }
  }, [category, setValue]);

  const onSubmit = async (data: FormData) => {
    const categoryData = { name: data.name };

    if (category) {
      updateCategoryMutation.mutate({ id: category.id, categoryData }, {
        onSuccess: () => {
          toast.success("Category updated successfully!");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update category. Please try again.");
        },
      });
    } else {
      addCategoryMutation.mutate(categoryData as CreateCategoryDto, {
        onSuccess: () => {
          toast.success("Category created successfully!");
          onClose();
        },
        onError: () => {
          toast.error("Failed to create category. Please try again.");
        },
      });
    }
  };

  const isPending = addCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
        <Input id="name" {...register('name', { required: 'Name is required' })} disabled={isPending} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : (category ? 'Update Category' : 'Create Category')}
        </Button>
      </div>
    </form>
  );
};