"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddGiftCardAsset, useUpdateGiftCardAsset } from '@/service/gift-card/asset-hook';
import { GiftCardAsset, CreateGiftCardAssetDto, UpdateGiftCardAssetDto } from '@/service/gift-card/asset-types';
import { toast } from "sonner";
import axios from 'axios';
import Image from 'next/image';

interface AssetFormProps {
  asset: GiftCardAsset | null;
  onClose: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({ asset, onClose }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateGiftCardAssetDto | UpdateGiftCardAssetDto>();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(asset ? asset.url : null);

  const addAssetMutation = useAddGiftCardAsset();
  const updateAssetMutation = useUpdateGiftCardAsset();

  useEffect(() => {
    if (asset) {
      setValue('name', asset.name);
      setValue('url', asset.url);
    }
  }, [asset, setValue]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/gif') {
        toast.error("Please select a GIF file.");
        return;
      }
      setPreview(URL.createObjectURL(file));
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`/api/upload/gift-card-assets`, formData);
        setValue('url', response.data.secure_url);
        toast.success("GIF uploaded successfully!");
      } catch {
        toast.error("Failed to upload GIF. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = (data: CreateGiftCardAssetDto | UpdateGiftCardAssetDto) => {
    if (asset) {
      updateAssetMutation.mutate({ id: asset.id, assetData: data }, {
        onSuccess: () => {
          toast.success("Asset updated successfully!");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update asset. Please try again.");
        }
      });
    } else {
      addAssetMutation.mutate(data as CreateGiftCardAssetDto, {
        onSuccess: () => {
          toast.success("Asset created successfully!");
          onClose();
        },
        onError: () => {
          toast.error("Failed to create asset. Please try again.");
        }
      });
    }
  };

  const isPending = addAssetMutation.isPending || updateAssetMutation.isPending;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Asset Name</label>
            <Input id="name" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">Asset GIF</label>
            <Input id="file" type="file" accept="image/gif" onChange={handleFileChange} />
             {preview && (
              <div className="mt-4">
                <Image src={preview} alt="GIF Preview" width={200} height={200} className="rounded-md" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending || isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isUploading}>
              {isUploading ? 'Uploading...' : (isPending ? (asset ? 'Updating...' : 'Creating...') : (asset ? 'Update Asset' : 'Create Asset'))}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};