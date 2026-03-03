'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import {
  FileText,
  Tag,
  ChevronRight,
  HelpCircle,
  UploadCloud,
  ArrowRight,
  X,
  CheckCircle,
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAddCoupon } from '@/service/coupons/hook';
import { DiscountType, CouponSourceType } from '@/service/coupons/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useGetUserListings } from '@/service/listings/hook';
import { InHouseBusiness, UserListing } from '@/service/listings/types';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// --- Main Coupon Form Component ---

interface FormData {
  title: string;
  code: string;
  description: string;
  widgetBackground: File | null;
  discountType: DiscountType | '';
  discountValue: string;
  expiresAt: string;
  minSpend: string;
  maxSpend: string;
  businessId: string;
  individualUseOnly: boolean;
  allowedEmails: string;
  usageLimit: string;
  perUserLimit: string;
}

interface FormErrors {
  title?: string;
  code?: string;
  discountType?: string;
  discountValue?: string;
  expiresAt?: string;
  businessId?: string;
}

export default function CouponForm() {
  const router = useRouter();
  const createCoupon = useAddCoupon();
  const { data: listings, isLoading: isLoadingListings } = useGetUserListings();
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    code: '',
    description: '',
    widgetBackground: null,
    discountType: '',
    discountValue: '0',
    expiresAt: '',
    minSpend: '',
    maxSpend: '',
    businessId: '',
    individualUseOnly: false,
    allowedEmails: '',
    usageLimit: '',
    perUserLimit: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, individualUseOnly: checked }));
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFormData(prev => ({ ...prev, widgetBackground: file }));
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, widgetBackground: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required.';
    }
    if (!formData.discountType) {
      newErrors.discountType = 'Discount type is required.';
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0.';
    }
    if (!formData.expiresAt) {
      newErrors.expiresAt = 'Expiry date is required.';
    } else if (new Date(formData.expiresAt) <= new Date()) {
      newErrors.expiresAt = 'Expiry date must be in the future.';
    }
    if (!formData.businessId) {
      newErrors.businessId = 'Please select a business listing.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        await createCoupon({
          title: formData.title,
          description: formData.description,
          code: formData.code.toUpperCase(),
          sourceType: CouponSourceType.BUSINESS,
          discountValue: parseFloat(formData.discountValue),
          discountType: formData.discountType as DiscountType,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
          perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : 1,
          expiresAt: formData.expiresAt,
          businessId: formData.businessId,
        });
        setIsSuccess(true);
      } catch (error) {
        console.error('Failed to create coupon:', error);
      }
    } else {
      console.log('Form has validation errors:', validationErrors);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 sm:mb-0">
              Coupons
            </h1>
            <div className="text-base text-gray-500 flex items-center space-x-1">
              <span>Home</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Dashboard</span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Coupon Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-gray-500" />
                General Coupon Settings
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Coupon Title</Label>
                <p className="text-sm text-gray-500">
                  A public-facing name for this coupon (e.g., "Winter Special 2026").
                </p>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Winter Sale"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Coupon code</Label>
                <p className="text-sm text-gray-500">
                  The unique code shoppers apply at checkout (e.g. WINTER26).
                </p>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g. WINTER26"
                  className="uppercase"
                  value={formData.code}
                  onChange={handleInputChange}
                />
                {errors.code && (
                  <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Coupon Description</Label>
                <p className="text-sm text-gray-500">
                  Detailed description of the offer (internal or external).
                </p>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>Upload Widget Background</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e =>
                    handleFileChange(e.target.files ? e.target.files[0] : null)
                  }
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />
                {formData.widgetBackground ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={URL.createObjectURL(formData.widgetBackground)}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                      <span className="text-base text-gray-700 truncate">
                        {formData.widgetBackground.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="flex-shrink-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center text-gray-500 hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={handleUploadAreaClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className="h-12 w-12 mb-3 text-gray-400" />
                    <span className="text-base">
                      Drag & drop or click to upload
                    </span>
                    <span className="text-sm mt-1">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="discountType">Discount type</Label>
                  <Select
                    name="discountType"
                    value={formData.discountType}
                    onValueChange={value =>
                      handleSelectChange('discountType', value)
                    }
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DiscountType.PERCENTAGE}>
                        Percentage discount
                      </SelectItem>
                      <SelectItem value={DiscountType.FIXED}>Fixed cart discount</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.discountType && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.discountType}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discountValue">Discount value</Label>
                  <div className="relative">
                    <Input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={e => {
                        if (formData.discountType === DiscountType.PERCENTAGE) {
                          const value = Math.max(
                            0,
                            Math.min(100, Number(e.target.value))
                          );
                          setFormData(prev => ({
                            ...prev,
                            discountValue: value.toString(),
                          }));
                        } else {
                          handleInputChange(e);
                        }
                      }}
                      className={
                        formData.discountType === DiscountType.PERCENTAGE
                          ? 'pr-8'
                          : ''
                      }
                    />
                    {formData.discountType === DiscountType.PERCENTAGE && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        %
                      </span>
                    )}
                  </div>
                  {errors.discountValue && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.discountValue}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiresAt">Coupon expiry date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal h-12',
                          !formData.expiresAt && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiresAt ? (
                          format(new Date(formData.expiresAt), 'PPP p')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.expiresAt
                            ? new Date(formData.expiresAt)
                            : undefined
                        }
                        onSelect={date => {
                          const newDate = date ? new Date(date) : new Date();
                          const oldDate = formData.expiresAt
                            ? new Date(formData.expiresAt)
                            : new Date();
                          newDate.setHours(oldDate.getHours());
                          newDate.setMinutes(oldDate.getMinutes());
                          handleSelectChange(
                            'expiresAt',
                            newDate.toISOString()
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expiresAt && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.expiresAt}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Restrictions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <Tag className="h-6 w-6 mr-3 text-gray-500" />
                Usage restrictions
              </h2>
              <p className="text-sm text-gray-500">
                Set rules for how this coupon can be used.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="grid gap-2">
                  <Label htmlFor="businessId" className="flex items-center">
                    Select Listing{' '}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Choose which listing this coupon is associated with.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {formData.businessId
                          ? listings?.data?.find((l: UserListing) => l.id === formData.businessId)?.businessName || 'Select listing...'
                          : 'Select listing...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search listings..." />
                        <CommandEmpty>No listings found.</CommandEmpty>
                        <CommandGroup>
                          {isLoadingListings ? (
                            <CommandItem>Loading...</CommandItem>
                          ) : (
                            listings?.data?.map((listing: UserListing) => (
                              <CommandItem
                                key={listing.id}
                                onSelect={() => {
                                  setFormData({ ...formData, businessId: listing.id });
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.businessId === listing.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {listing.businessName}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.businessId && (
                    <p className="text-sm text-red-600 mt-1">{errors.businessId}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="individualUseOnly"
                    className="flex items-center"
                  >
                    Individual use only{' '}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          If enabled, this coupon cannot be used in conjunction
                          with other coupons.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="individualUseOnly"
                      checked={formData.individualUseOnly}
                      onCheckedChange={handleSwitchChange}
                    />
                    <span className="text-base text-gray-600">
                      This coupon cannot be used with other coupons.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <Tag className="h-6 w-6 mr-3 text-gray-500" />
                Usage limits
              </h2>
              <p className="text-sm text-gray-500">
                Define how many times the coupon can be used.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="usageLimit">
                  Usage limit per coupon
                </Label>
                <p className="text-sm text-gray-500">
                  The total number of times the coupon can be used.
                </p>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  placeholder="Unlimited usage"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perUserLimit">Usage limit per user</Label>
                <p className="text-sm text-gray-500">
                  The number of times a single user can use the coupon.
                </p>
                <Input
                  id="perUserLimit"
                  name="perUserLimit"
                  placeholder="Unlimited usage"
                  value={formData.perUserLimit}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3 w-full sm:w-auto text-lg"
            >
              Submit Coupon <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent>
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle className="h-6 w-6 text-green-600" />
            </motion.div>
            <DialogTitle className="text-center">
              Coupon Created!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your new coupon has been created successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => router.push('/dashboard/coupons')}>
              Go to Coupons Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
