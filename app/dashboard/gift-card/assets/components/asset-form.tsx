"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddGiftCardAsset, useUpdateGiftCardAsset } from '@/service/gift-card/asset-hook';
import { GiftCardAsset, CreateGiftCardAssetDto, UpdateGiftCardAssetDto } from '@/service/gift-card/asset-types';
import { useGetAssetCategories } from '@/service/gift-card/asset-category-hook';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import axios from 'axios';
import Image from 'next/image';

interface AssetFormProps {
  asset: GiftCardAsset | null;
  onClose: () => void;
}

type FormData = {
    name: string;
    assetCategoryIds: string[];
};

export const AssetForm: React.FC<AssetFormProps> = ({ asset, onClose }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: asset?.name || '',
      assetCategoryIds: asset?.categories?.map(c => c.id) || [],
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(asset ? asset.url : null);

  const { data: categories, isPending: isLoadingCategories } = useGetAssetCategories();
  const addAssetMutation = useAddGiftCardAsset();
  const updateAssetMutation = useUpdateGiftCardAsset();

  const selectedCategoryIds = watch('assetCategoryIds');

  useEffect(() => {
    if (asset) {
      setValue('name', asset.name);
      setValue('assetCategoryIds', asset.categories?.map(c => c.id) || []);
    }
  }, [asset, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/gif') {
        toast.error("Please select a GIF file.");
        event.target.value = ''; // Reset file input
        setPreview(asset?.url ?? null); // Revert preview
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!asset && !selectedFile) {
      toast.error("Please select a GIF to upload for the new asset.");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = asset?.url;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const response = await axios.post('/api/upload/gift-card-assets', formData);
        imageUrl = response.data.secure_url;
      }

      if (!imageUrl) {
        toast.error("Could not determine the image URL. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const assetData: CreateGiftCardAssetDto | UpdateGiftCardAssetDto = {
        name: data.name,
        url: imageUrl,
        assetCategoryIds: data.assetCategoryIds,
      };

      if (asset) {
        updateAssetMutation.mutate({ id: asset.id, assetData: assetData as UpdateGiftCardAssetDto }, {
          onSuccess: () => {
            toast.success("Asset updated successfully!");
            onClose();
          },
          onError: () => {
            toast.error("Failed to update asset. Please try again.");
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        });
      } else {
        addAssetMutation.mutate(assetData as CreateGiftCardAssetDto, {
          onSuccess: () => {
            toast.success("Asset created successfully!");
            onClose();
          },
          onError: () => {
            toast.error("Failed to create asset. Please try again.");
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        });
      }
    } catch {
      toast.error("Failed to upload GIF. Please try again.");
      setIsSubmitting(false);
    }
  };

  const isPending = addAssetMutation.isPending || updateAssetMutation.isPending;
  const isLoading = isPending || isSubmitting;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Asset Name</label>
            <Input id="name" {...register('name', { required: 'Name is required' })} disabled={isLoading} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">Asset GIF</label>
            <Input id="file" type="file" accept="image/gif" onChange={handleFileChange} disabled={isLoading} />
            {preview && (
              <div className="mt-4">
                <Image src={preview} alt="GIF Preview" width={200} height={200} className="rounded-md" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Categories</label>
            {isLoadingCategories ? (
              <p>Loading categories...</p>
            ) : (
              <div className="space-y-2">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategoryIds.includes(category.id)}
                      onCheckedChange={(checked) => {
                        const currentCategoryIds = watch('assetCategoryIds');
                        const newCategoryIds = checked
                          ? [...currentCategoryIds, category.id]
                          : currentCategoryIds.filter((id) => id !== category.id);
                        setValue('assetCategoryIds', newCategoryIds, { shouldValidate: true });
                      }}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : (asset ? 'Update Asset' : 'Create Asset')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};