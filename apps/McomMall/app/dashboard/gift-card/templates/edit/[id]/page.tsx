"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useUpdateGiftCardTemplate, useGetGiftCardTemplateById } from '@/service/gift-card/hook';
import { CreateGiftCardTemplateDto } from '@/service/gift-card/types';
import { Switch } from "@/components/ui/switch";
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GiftCardPreview from '@/components/gift-card/gift-card-preview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllListings } from '@/service/listings/hook';
import { useGetGroupCircles } from '@/service/group-circle/hook';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";


const EditGiftCardTemplatePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: template, isPending: isFetching } = useGetGiftCardTemplateById(id);
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateGiftCardTemplate();

  const [formData, setFormData] = useState<Partial<CreateGiftCardTemplateDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [fixedAmountInput, setFixedAmountInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Spending Locations States & Data
  const { data: allListingsData } = useGetAllListings({ page: 1, limit: 100 });
  const { data: groupCirclesData } = useGetGroupCircles({ page: 1, limit: 100 });

  const [spendingLocations, setSpendingLocations] = useState<any[]>([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`spending-locations-${id}`);
      if (stored) {
        try {
          setSpendingLocations(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse spending locations", e);
        }
      }
    }
  }, [id]);

  // Combine options
  const locationOptions = React.useMemo(() => {
    const opts: any[] = [];
    if (allListingsData?.data) {
      allListingsData.data.forEach(b => {
        opts.push({ id: b.id, label: b.businessName, type: 'Business' });
      });
    }
    if (groupCirclesData?.data) {
      groupCirclesData.data.forEach(gc => {
        gc.members.forEach(m => {
          const contact = m.network;
          if (contact) {
            const label = contact.businessName || contact.fullName;
            if (!opts.find(o => o.id === contact.id)) {
              opts.push({ id: contact.id, label, type: 'Group Circle Contact' });
            }
          }
        });
      });
    }
    return opts;
  }, [allListingsData, groupCirclesData]);

  const toggleLocation = (option: any) => {
    setSpendingLocations(prev => {
      const exists = prev.find(p => p.id === option.id);
      let updated;
      if (exists) {
        updated = prev.filter(p => p.id !== option.id);
      } else {
        updated = [...prev, option];
      }
      localStorage.setItem(`spending-locations-${id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const { data: listings } = useGetAllListings({ page: 1, limit: 100 });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        backgroundColor: template.backgroundColor,
        textColor: template.textColor,
        fixedAmounts: template.fixedAmounts,
        allowCustomAmount: template.allowCustomAmount,
        minCustomAmount: template.minCustomAmount,
        maxCustomAmount: template.maxCustomAmount,
        allowReloading: template.allowReloading,
        logoUrl: template.logoUrl || undefined,
      });
      if (template.backgroundImageUrl) {
        setImagePreview(template.backgroundImageUrl);
      }
      if (template.logoUrl) {
        setLogoPreview(template.logoUrl);
      }
    }
  }, [template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "minCustomAmount" || name === "maxCustomAmount") {
      const parsedValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(parsedValue) ? undefined : parsedValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (hex: string, field: 'backgroundColor' | 'textColor') => {
    setFormData((prev) => ({ ...prev, [field]: hex }));
  };

  const handleSwitchChange = (checked: boolean, field: 'allowCustomAmount' | 'allowReloading') => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, backgroundImageUrl: URL.createObjectURL(file) }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.backgroundImageUrl;
        return newErrors;
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
    } else {
      setLogoFile(null);
      setLogoPreview(null);
      setFormData(prev => ({ ...prev, logoUrl: '' }));
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
      submissionData.backgroundImageUrl = template?.backgroundImageUrl || undefined;
    }

    if (logoFile) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', logoFile);

      try {
        const response = await fetch('/api/upload/gift-card', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error('Logo upload failed');
        }

        const result = await response.json();
        submissionData.logoUrl = result.secure_url;

      } catch (error) {
        console.error("Logo upload error:", error);
        toast.error("Logo upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
    } else {
      submissionData.logoUrl = template?.logoUrl || undefined;
    }

    updateTemplate({ id, templateData: submissionData }, {
      onSuccess: () => {
        if (submissionData.logoUrl) {
          localStorage.setItem(`gift-card-logo-${id}`, submissionData.logoUrl);
        } else if (submissionData.logoUrl === '') {
          localStorage.removeItem(`gift-card-logo-${id}`);
        }
        toast.success("Gift card template updated successfully!");
        router.push('/dashboard/gift-card/templates');
      },
      onError: (error) => {
        console.error("Failed to update gift card template:", error);
        toast.error("Failed to update gift card template. Please try again.");
      },
      onSettled: () => {
        setIsUploading(false);
      },
    });
  };

  if (isFetching) {
    return <div className="p-6">Loading template data...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Edit Gift Card Template</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Template Name (Business Listing)</Label>
                <Select
                  value={formData.name || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a business listing" />
                  </SelectTrigger>
                  <SelectContent>
                    {listings?.data.map((listing) => (
                      <SelectItem key={listing.id} value={listing.businessName}>
                        {listing.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label>Where you can spend your gift card</Label>
                <p className="text-xs text-gray-500 mb-2">Select businesses or group circle contacts (Persisted locally for now)</p>
                <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isLocationOpen}
                      className="w-full justify-between font-normal"
                    >
                      {spendingLocations.length > 0
                        ? `${spendingLocations.length} location(s) selected`
                        : "Select businesses or contacts..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search locations..." />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup heading="Businesses">
                          {locationOptions.filter(o => o.type === 'Business').map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.label}
                              onSelect={() => toggleLocation(option)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  spendingLocations.find(l => l.id === option.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Group Circle Contacts">
                          {locationOptions.filter(o => o.type === 'Group Circle Contact').map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.label}
                              onSelect={() => toggleLocation(option)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  spendingLocations.find(l => l.id === option.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                    <PopoverContent className="p-2">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => handleColorChange(e.target.value, 'backgroundColor')}
                        className="w-40 h-40 cursor-pointer border-0 p-0 bg-transparent"
                      />
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
                    <PopoverContent className="p-2">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => handleColorChange(e.target.value, 'textColor')}
                        className="w-40 h-40 cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="logo">Business Logo (optional)</Label>
                <Input id="logo" type="file" onChange={handleLogoChange} className="mt-1" disabled={isUpdating || isUploading || isFetching} />
                {logoPreview && (
                  <div className="mt-4">
                    <img src={logoPreview} alt="Logo preview" className="w-24 h-24 object-contain rounded-md border" />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="image">Background Image (optional)</Label>
                <Input id="image" type="file" onChange={handleImageChange} className="mt-1" disabled={isUpdating || isUploading || isFetching} />
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Image preview" width={500} height={300} />
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
                <Switch id="allowCustomAmount" checked={!!formData.allowCustomAmount} onCheckedChange={(checked) => handleSwitchChange(checked, 'allowCustomAmount')} />
                <Label htmlFor="allowCustomAmount">Allow Custom Amount</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="allowReloading" checked={!!formData.allowReloading} onCheckedChange={(checked) => handleSwitchChange(checked, 'allowReloading')} />
                <Label htmlFor="allowReloading">Allow Reloading</Label>
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
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isUpdating || isUploading || isFetching}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isUpdating || isUploading || isFetching}>
                  {isUpdating ? 'Updating...' : isUploading ? 'Uploading...' : 'Update Template'}
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

export default EditGiftCardTemplatePage;