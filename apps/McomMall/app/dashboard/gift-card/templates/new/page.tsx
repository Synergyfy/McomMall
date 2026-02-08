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
import { X, Info } from 'lucide-react';
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { SketchPicker, ColorResult } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GiftCardPreview from '@/components/gift-card/gift-card-preview';


const CreateGiftCardTemplatePage = () => {
  const [formData, setFormData] = useState<Partial<CreateGiftCardTemplateDto>>({
    name: '',
    description: '',
    backgroundImageUrl: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fixedAmounts: [],
    allowCustomAmount: false,
    minCustomAmount: undefined,
    maxCustomAmount: undefined,
    allowReloading: false,
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
    if (name === "minCustomAmount" || name === "maxCustomAmount" || name === "bonusThreshold" || name === "bonusAmount") {
      const parsedValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(parsedValue) ? undefined : parsedValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (color: ColorResult, field: 'backgroundColor' | 'textColor') => {
    setFormData((prev) => ({ ...prev, [field]: color.hex }));
  };

  const handleSwitchChange = (checked: boolean, field: 'allowCustomAmount' | 'allowReloading') => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({...prev, backgroundImageUrl: URL.createObjectURL(file)}));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.backgroundImageUrl;
        return newErrors;
      });
    } else {
      setImageFile(null);
      setImagePreview(null);
      setFormData(prev => ({...prev, backgroundImageUrl: ''}));
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

    if (formData.bonusThreshold || formData.bonusAmount) {
        if (!formData.bonusThreshold || formData.bonusThreshold <= 0) {
            newErrors.bonusThreshold = "Bonus threshold must be a positive number.";
        }
        if (!formData.bonusAmount || formData.bonusAmount <= 0) {
            newErrors.bonusAmount = "Bonus amount must be a positive number.";
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

    setIsUploading(true);

    const submissionData: Partial<CreateGiftCardTemplateDto> = {
      ...formData,
      minCustomAmount: formData.allowCustomAmount ? Number(formData.minCustomAmount) : undefined,
      maxCustomAmount: formData.allowCustomAmount ? Number(formData.maxCustomAmount) : undefined,
    };

    if (imageFile) {
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
        submissionData.backgroundImageUrl = result.secure_url;

      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Image upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
    } else {
      submissionData.backgroundImageUrl = undefined;
    }

    mutate(submissionData as CreateGiftCardTemplateDto, {
      onSuccess: () => {
        toast.success("Gift card template created successfully!");
        router.push('/dashboard/gift-card/templates');
      },
      onError: (error) => {
        console.error("Failed to create gift card template:", error);
        toast.error("Failed to create gift card template. Please try again.");
      },
      onSettled: () => {
        setIsUploading(false);
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <Card>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <div className="w-6 h-6 rounded-full border mr-2" style={{ backgroundColor: formData.backgroundColor }} />
                      {formData.backgroundColor}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <SketchPicker color={formData.backgroundColor} onChangeComplete={(color) => handleColorChange(color, 'backgroundColor')} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Text Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <div className="w-6 h-6 rounded-full border mr-2" style={{ backgroundColor: formData.textColor }} />
                      {formData.textColor}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <SketchPicker color={formData.textColor} onChangeComplete={(color) => handleColorChange(color, 'textColor')} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="image">Background Image (optional)</Label>
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
              <Switch id="allowCustomAmount" checked={formData.allowCustomAmount} onCheckedChange={(checked) => handleSwitchChange(checked, 'allowCustomAmount')} />
              <Label htmlFor="allowCustomAmount">Allow Custom Amount</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="allowReloading" checked={formData.allowReloading} onCheckedChange={(checked) => handleSwitchChange(checked, 'allowReloading')} />
              <Label htmlFor="allowReloading">Allow Reloading</Label>
            </div>

    <div>
        <div className="flex items-center space-x-2">
            <Label htmlFor="bonusThreshold">Bonus Threshold</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>If a customer spends at least this much on a single gift card, they will receive a bonus amount.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <Input
            id="bonusThreshold"
            name="bonusThreshold"
            type="number"
            value={formData.bonusThreshold || ''}
            onChange={handleInputChange}
            className="mt-1"
        />
        {errors.bonusThreshold && <p className="text-red-500 text-xs mt-1">{errors.bonusThreshold}</p>}
    </div>

    <div>
        <div className="flex items-center space-x-2">
            <Label htmlFor="bonusAmount">Bonus Amount</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>The extra amount to add to the gift card balance when the bonus threshold is met.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <Input
            id="bonusAmount"
            name="bonusAmount"
            type="number"
            value={formData.bonusAmount || ''}
            onChange={handleInputChange}
            className="mt-1"
        />
        {errors.bonusAmount && <p className="text-red-500 text-xs mt-1">{errors.bonusAmount}</p>}
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
        <div>
          <GiftCardPreview template={formData} />
        </div>
      </div>
    </div>
  );
};

export default CreateGiftCardTemplatePage;