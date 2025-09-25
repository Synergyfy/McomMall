"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useAddGiftCardTemplate } from '@/service/gift-card/hook';
import { CreateGiftCardTemplateDto } from '@/service/gift-card/types';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';
import { toast } from "sonner";
import Image from "next/image";

const CreateGiftCardTemplatePage = () => {
  const [formData, setFormData] = useState<Partial<CreateGiftCardTemplateDto>>({
    name: '',
    description: '',
    imageUrl: '',
    fixedAmounts: [],
    allowCustomAmount: false,
    minCustomAmount: undefined,
    maxCustomAmount: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [fixedAmountInput, setFixedAmountInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();
  const { mutate, isPending } = useAddGiftCardTemplate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, allowCustomAmount: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.imageUrl;
        return newErrors;
      });
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleFixedAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const value = parseFloat(fixedAmountInput.trim());
      if (!isNaN(value) && value > 0 && !formData.fixedAmounts?.includes(value)) {
        setFormData((prev) => ({
          ...prev,
          fixedAmounts: [...(prev.fixedAmounts || []), value],
        }));
      }
      setFixedAmountInput('');
    }
  };

  const removeFixedAmount = (amount: number) => {
    setFormData((prev) => ({
      ...prev,
      fixedAmounts: prev.fixedAmounts?.filter((a) => a !== amount),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Template name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!imageFile) newErrors.imageUrl = "Image is required";
    if (!formData.allowCustomAmount && (!formData.fixedAmounts || formData.fixedAmounts.length === 0)) {
      newErrors.fixedAmounts = "At least one fixed amount is required if custom amounts are not allowed.";
    }
    if (formData.allowCustomAmount) {
      if (!formData.minCustomAmount || formData.minCustomAmount < 0.01) {
        newErrors.minCustomAmount = "Minimum custom amount must be at least £0.01.";
      }
      if (!formData.maxCustomAmount || formData.maxCustomAmount < 0.01) {
        newErrors.maxCustomAmount = "Maximum custom amount must be at least £0.01.";
      }
      if (formData.minCustomAmount && formData.maxCustomAmount && formData.minCustomAmount >= formData.maxCustomAmount) {
        newErrors.maxCustomAmount = "Maximum amount must be greater than the minimum amount.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    if (!imageFile) {
        toast.error("Please select an image to upload.");
        return;
    }

    setIsUploading(true);

    const uploadFormData = new FormData();
    uploadFormData.append('file', imageFile);

    try {
      const response = await fetch('/api/upload/gift-card', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const result = await response.json();

      const finalFormData = { ...formData, imageUrl: result.secure_url };

      mutate(finalFormData as CreateGiftCardTemplateDto, {
        onSuccess: () => {
          toast.success("Gift card template created successfully!");
          router.push('/dashboard/gift-card/templates');
        },
        onError: (error) => {
          console.error("Failed to create gift card template:", error);
          toast.error("Failed to create gift card template. Please try again.");
        },
      });

    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Create New Gift Card Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className="mt-1" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" onChange={handleImageChange} className="mt-1" disabled={isPending || isUploading} />
              {imagePreview && (
                <div className="mt-4">
                  <Image src={imagePreview} alt="Image preview" className="w-full h-48 object-cover rounded-md" width={500} height={300} />
                </div>
              )}
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
            </div>

            <div>
              <Label htmlFor="fixedAmounts">Fixed Amounts (£)</Label>
              <Input
                id="fixedAmounts"
                value={fixedAmountInput}
                onChange={(e) => setFixedAmountInput(e.target.value)}
                onKeyDown={handleFixedAmountKeyDown}
                placeholder="Enter amount and press , or Enter"
                className="mt-1"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.fixedAmounts?.map((amount) => (
                  <div key={amount} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm">
                    £{amount}
                    <button type="button" onClick={() => removeFixedAmount(amount)} className="ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.fixedAmounts && <p className="text-red-500 text-xs mt-1">{errors.fixedAmounts}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="allowCustomAmount" checked={formData.allowCustomAmount} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="allowCustomAmount">Allow Custom Amount</Label>
            </div>

            {formData.allowCustomAmount && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minCustomAmount">Min Custom Amount (£)</Label>
                  <Input
                    id="minCustomAmount"
                    name="minCustomAmount"
                    type="number"
                    value={formData.minCustomAmount || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  {errors.minCustomAmount && <p className="text-red-500 text-xs mt-1">{errors.minCustomAmount}</p>}
                </div>
                <div>
                  <Label htmlFor="maxCustomAmount">Max Custom Amount (£)</Label>
                  <Input
                    id="maxCustomAmount"
                    name="maxCustomAmount"
                    type="number"
                    value={formData.maxCustomAmount || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  {errors.maxCustomAmount && <p className="text-red-500 text-xs mt-1">{errors.maxCustomAmount}</p>}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending || isUploading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isPending || isUploading}>
                {isPending ? 'Creating...' : isUploading ? 'Uploading...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGiftCardTemplatePage;