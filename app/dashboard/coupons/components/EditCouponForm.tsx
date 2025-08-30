'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Tag,
  HelpCircle,
  UploadCloud,
  ArrowRight,
  X,
  CheckCircle,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditCoupon } from '@/service/coupons/hook';
import { Coupon, UpdateCouponDto } from '@/service/coupons/types';
import { InHouseBusiness } from '@/service/listings/types';
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
import { cn } from '@/lib/utils';

interface EditCouponFormProps {
  coupon: Coupon;
  onSuccess: () => void;
}

interface FormData {
  couponCode: string;
  couponDescription: string;
  discountType: 'percentage' | 'fixed' | '';
  couponAmount: string;
  expiryDate: string;
  minSpend: string;
  maxSpend: string;
  individualUseOnly: boolean;
  allowedEmails: string;
  usageLimitPerCoupon: string;
  usageLimitPerUser: string;
  businessIds: string[];
}

interface FormErrors {
  couponCode?: string;
  discountType?: string;
  couponAmount?: string;
  expiryDate?: string;
}

export default function EditCouponForm({
  coupon,
  onSuccess,
}: EditCouponFormProps) {
  const updateCoupon = useEditCoupon();
  const { data: listings, isLoading: isLoadingListings } = useGetUserListings();
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);

  const [formData, setFormData] = useState<FormData>({
    couponCode: coupon.couponCode,
    couponDescription: coupon.couponDescription || '',
    discountType: coupon.discountType,
    couponAmount: coupon.couponAmount.toString(),
    expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
    minSpend: coupon.minSpend?.toString() || '',
    maxSpend: coupon.maxSpend?.toString() || '',
    individualUseOnly: coupon.individualUseOnly,
    allowedEmails: coupon.allowedEmails || '',
    usageLimitPerCoupon: coupon.usageLimitPerCoupon?.toString() || '',
    usageLimitPerUser: coupon.usageLimitPerUser?.toString() || '',
    businessIds: coupon.businesses?.map(b => b.id) || [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.couponCode.trim()) {
      newErrors.couponCode = 'Coupon code is required.';
    }
    if (!formData.discountType) {
      newErrors.discountType = 'Discount type is required.';
    }
    if (!formData.couponAmount || parseFloat(formData.couponAmount) <= 0) {
      newErrors.couponAmount = 'Coupon amount must be greater than 0.';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const couponData: UpdateCouponDto = {
          couponCode: formData.couponCode,
          couponDescription: formData.couponDescription,
          discountType: formData.discountType as 'percentage' | 'fixed',
          couponAmount: parseFloat(formData.couponAmount),
          expiryDate: new Date(formData.expiryDate).getTime(),
          minSpend: formData.minSpend
            ? parseFloat(formData.minSpend)
            : undefined,
          maxSpend: formData.maxSpend
            ? parseFloat(formData.maxSpend)
            : undefined,
          individualUseOnly: formData.individualUseOnly,
          allowedEmails: formData.allowedEmails,
          usageLimitPerCoupon: formData.usageLimitPerCoupon
            ? parseInt(formData.usageLimitPerCoupon)
            : undefined,
          usageLimitPerUser: formData.usageLimitPerUser
            ? parseInt(formData.usageLimitPerUser)
            : undefined,
          businessIds: formData.businessIds,
        };
        await updateCoupon(coupon.id, couponData);
        setIsSuccess(true);
      } catch (error) {
        console.error('Failed to update coupon:', error);
      }
    } else {
      console.log('Form has validation errors:', validationErrors);
    }
  };

  return (
    <div className="bg-gray-50/50 p-4 sm:p-6 md:p-8">
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
              <Label htmlFor="couponCode">Coupon code</Label>
              <Input
                id="couponCode"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleInputChange}
              />
              {errors.couponCode && (
                <p className="text-base text-red-600 mt-1">
                  {errors.couponCode}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="couponDescription">Coupon Description</Label>
              <Textarea
                id="couponDescription"
                name="couponDescription"
                placeholder="Description (optional)"
                value={formData.couponDescription}
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
                    <SelectItem value="percentage">
                      Percentage discount
                    </SelectItem>
                    <SelectItem value="fixed">Fixed cart discount</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && (
                  <p className="text-base text-red-600 mt-1">
                    {errors.discountType}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="couponAmount">Coupon amount</Label>
                <Input
                  id="couponAmount"
                  name="couponAmount"
                  type="number"
                  value={formData.couponAmount}
                  onChange={handleInputChange}
                />
                {errors.couponAmount && (
                  <p className="text-base text-red-600 mt-1">
                    {errors.couponAmount}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Coupon expiry date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
                {errors.expiryDate && (
                  <p className="text-base text-red-600 mt-1">
                    {errors.expiryDate}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="minSpend">Minimum spend</Label>
                <Input
                  id="minSpend"
                  name="minSpend"
                  placeholder="No minimum"
                  value={formData.minSpend}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxSpend">Maximum spend</Label>
                <Input
                  id="maxSpend"
                  name="maxSpend"
                  placeholder="No maximum"
                  value={formData.maxSpend}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="grid gap-2">
                <Label htmlFor="products" className="flex items-center">
                  For products{' '}
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {formData.businessIds.length > 0
                        ? `${formData.businessIds.length} listing(s) selected`
                        : 'Select listings...'}
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
                          listings?.map((listing: InHouseBusiness) => (
                            <CommandItem
                              key={listing.id}
                              onSelect={() => {
                                const businessIds = formData.businessIds.includes(
                                  listing.id
                                )
                                  ? formData.businessIds.filter(
                                      id => id !== listing.id
                                    )
                                  : [...formData.businessIds, listing.id];
                                setFormData({ ...formData, businessIds });
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.businessIds.includes(listing.id)
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
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="individualUseOnly"
                  className="flex items-center"
                >
                  Individual use only{' '}
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
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
            <div className="grid gap-2">
              <Label htmlFor="allowedEmails" className="flex items-center">
                Allowed emails{' '}
                <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
              </Label>
              <Input
                id="allowedEmails"
                name="allowedEmails"
                placeholder="No restrictions"
                value={formData.allowedEmails}
                onChange={handleInputChange}
              />
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
              <Label htmlFor="usageLimitPerCoupon">
                Usage limit per coupon
              </Label>
              <Input
                id="usageLimitPerCoupon"
                name="usageLimitPerCoupon"
                placeholder="Unlimited usage"
                value={formData.usageLimitPerCoupon}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="usageLimitPerUser">Usage limit per user</Label>
              <Input
                id="usageLimitPerUser"
                name="usageLimitPerUser"
                placeholder="Unlimited usage"
                value={formData.usageLimitPerUser}
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
            Save Changes <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </form>
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
            <Button onClick={onSuccess}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
