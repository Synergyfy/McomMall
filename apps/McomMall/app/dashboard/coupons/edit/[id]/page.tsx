'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  Tag,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  ChevronsUpDown,
  Check,
  ChevronRight,
  CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  useGetCoupon,
  useEditCoupon,
} from '@/service/coupons/hook';
import { UpdateCouponDto, DiscountType, CouponSourceType } from '@/service/coupons/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface FormData {
  title: string;
  code: string;
  description: string;
  discountType: DiscountType | '';
  discountValue: string;
  expiresAt: string;
  usageLimit: string;
  perUserLimit: string;
  businessId: string;
}

interface FormErrors {
  title?: string;
  code?: string;
  discountType?: string;
  discountValue?: string;
  expiresAt?: string;
  businessId?: string;
}

function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { coupon, isLoading: isLoadingCoupon } = useGetCoupon(id);
  const { data: listings, isLoading: isLoadingListings } = useGetUserListings();
  const editCoupon = useEditCoupon();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (coupon && !formData) {
      setFormData({
        title: coupon.title,
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType as DiscountType,
        discountValue: coupon.discountValue.toString(),
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : '',
        usageLimit: coupon.usageLimit?.toString() || '',
        perUserLimit: coupon.perUserLimit?.toString() || '1',
        businessId: coupon.business?.id || '',
      });
    }
  }, [coupon, formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData) return {};
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
    }
    if (!formData.businessId) {
      newErrors.businessId = 'Please select a business listing.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const couponData: UpdateCouponDto = {
          title: formData.title,
          description: formData.description,
          code: formData.code.toUpperCase(),
          discountType: formData.discountType as DiscountType,
          discountValue: parseFloat(formData.discountValue),
          expiresAt: formData.expiresAt,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
          perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : 1,
          businessId: formData.businessId,
          sourceType: CouponSourceType.BUSINESS,
        };
        await editCoupon(id, couponData);
        setIsSuccess(true);
      } catch (error) {
        console.error('Failed to update coupon:', error);
      }
    } else {
      console.log('Form has validation errors:', validationErrors);
    }
  };

  if (isLoadingCoupon) {
    return <div>Loading coupon data...</div>;
  }

  if (!formData) {
    return <div>Coupon not found or data could not be loaded.</div>;
  }

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 sm:mb-0">
              Edit Coupon
            </h1>
            <div className="text-base text-gray-500 flex items-center space-x-1">
              <span>Home</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Coupons</span>
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
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                />
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
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                  />
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
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="usageLimit">
                  Usage limit per coupon
                </Label>
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

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3 w-full sm:w-auto text-lg"
            >
              Save Changes <ArrowRight className="h-5 w-5 ml-2" />
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
              Coupon Updated!
            </DialogTitle>
            <DialogDescription className="text-center">
              The coupon has been updated successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => router.push('/dashboard/coupons')}>
              Go to Coupons
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditCouponPage;
