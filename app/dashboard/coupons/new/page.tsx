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
} from 'lucide-react';

// --- Proper ShadCN UI Imports ---
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

// --- Main Coupon Form Component ---

interface FormData {
  couponCode: string;
  couponDescription: string;
  widgetBackground: File | null;
  discountType: 'percentage' | 'fixed' | '';
  couponAmount: string;
  expiryDate: string;
  minSpend: string;
  maxSpend: string;
  products: string;
  individualUseOnly: boolean;
  allowedEmails: string;
  usageLimitPerCoupon: string;
  usageLimitPerUser: string;
}

interface FormErrors {
  couponCode?: string;
  discountType?: string;
  couponAmount?: string;
  expiryDate?: string;
}

export default function CouponForm() {
  const [formData, setFormData] = useState<FormData>({
    couponCode: '',
    couponDescription: '',
    widgetBackground: null,
    discountType: '',
    couponAmount: '0',
    expiryDate: '',
    minSpend: '',
    maxSpend: '',
    products: '',
    individualUseOnly: false,
    allowedEmails: '',
    usageLimitPerCoupon: '',
    usageLimitPerUser: '',
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
      // You can add validation for file type and size here if needed
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
      fileInputRef.current.value = ''; // Reset the file input so the same file can be re-added
    }
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
    } else if (new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future.';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted successfully:', formData);
      // Here you would typically send the data to your API
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
                  <Input
                    id="products"
                    name="products"
                    placeholder="Search for a listing"
                    value={formData.products}
                    onChange={handleInputChange}
                  />
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
              Submit Coupon <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
