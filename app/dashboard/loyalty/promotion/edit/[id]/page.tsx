'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Tag,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetPromotionById, useUpdatePromotion } from '@/service/promotions/hook';
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
import { useRouter, useParams } from 'next/navigation';
import { useGetUserListings } from '@/service/listings/hook';
import { InHouseBusiness } from '@/service/listings/types';
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
import { useGetMyProducts } from '@/service/store/products/hook';
import { Product } from '@/service/store/products/types';

interface FormData {
  name: string;
  description: string;
  termsAndConditions: string;
  isActive: boolean;
  beginDate?: Date;
  endDate?: Date;
  promotionType: 'MULTIPLIER' | 'BONUS_POINTS' | '';
  promotionScope:
    | 'ALL_LISTINGS'
    | 'SPECIFIC_LISTINGS'
    | 'ALL_PRODUCTS'
    | 'SPECIFIC_PRODUCTS'
    | '';
  multiplier: string;
  bonusPoints: string;
  limitPerCustomer: string;
  minimumSpend: string;
  businessIds: string[];
  includedProductIds: string[];
  excludedProductIds: string[];
}

interface FormErrors {
  name?: string;
  promotionType?: string;
  promotionScope?: string;
  multiplier?: string;
  bonusPoints?: string;
  minimumSpend?: string;
}

export default function PromotionEditForm() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.id as string;

  const { data: promotion, isLoading: isLoadingPromotion } = useGetPromotionById(promotionId);
  const updatePromotion = useUpdatePromotion();

  const { data: listings, isLoading: isLoadingListings } =
    useGetUserListings();
  const { data: products, isLoading: isLoadingProducts } = useGetMyProducts();
  const [isSuccess, setIsSuccess] = useState(false);
  const [openBusiness, setOpenBusiness] = React.useState(false);
  const [openIncludedProducts, setOpenIncludedProducts] =
    React.useState(false);
  const [openExcludedProducts, setOpenExcludedProducts] =
    React.useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    termsAndConditions: '',
    isActive: true,
    beginDate: undefined,
    endDate: undefined,
    promotionType: '',
    promotionScope: '',
    multiplier: '',
    bonusPoints: '',
    limitPerCustomer: '',
    minimumSpend: '',
    businessIds: [],
    includedProductIds: [],
    excludedProductIds: [],
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || '',
        description: promotion.description || '',
        termsAndConditions: promotion.termsAndConditions || '',
        isActive: promotion.isActive,
        beginDate: promotion.beginDate ? new Date(promotion.beginDate) : undefined,
        endDate: promotion.endDate ? new Date(promotion.endDate) : undefined,
        promotionType: promotion.promotionType,
        promotionScope: promotion.promotionScope,
        multiplier: promotion.multiplier?.toString() || '',
        bonusPoints: promotion.bonusPoints?.toString() || '',
        limitPerCustomer: promotion.limitPerCustomer?.toString() || '',
        minimumSpend: promotion.minimumSpend.toString(),
        businessIds: promotion.businessIds || [],
        includedProductIds: promotion.includedProducts?.map(p => p.id) || [],
        excludedProductIds: promotion.excludedProducts?.map(p => p.id) || [],
      });
    }
  }, [promotion]);

  const [errors, setErrors] = useState<FormErrors>({});

  const includedProductsOptions = useMemo(() => {
    if (!products) return [];
    return products.filter(p => !formData.excludedProductIds.includes(p.id));
  }, [products, formData.excludedProductIds]);

  const excludedProductsOptions = useMemo(() => {
    if (!products) return [];
    return products.filter(p => !formData.includedProductIds.includes(p.id));
  }, [products, formData.includedProductIds]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = <T extends keyof FormData>(name: T, value: FormData[T]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'promotionType') {
      setFormData(prev => ({ ...prev, multiplier: '', bonusPoints: '' }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Promotion name is required.';
    }
    if (!formData.promotionType) {
      newErrors.promotionType = 'Promotion type is required.';
    }
    if (
      formData.promotionType === 'MULTIPLIER' &&
      (!formData.multiplier || parseFloat(formData.multiplier) <= 0)
    ) {
      newErrors.multiplier = 'Multiplier must be a positive number.';
    }
    if (
      formData.promotionType === 'BONUS_POINTS' &&
      (!formData.bonusPoints || parseInt(formData.bonusPoints, 10) <= 0)
    ) {
      newErrors.bonusPoints = 'Bonus points must be a positive integer.';
    }
    if (!formData.promotionScope) {
      newErrors.promotionScope = 'Promotion scope is required.';
    }
    if (
      !formData.minimumSpend ||
      parseFloat(formData.minimumSpend) < 0
    ) {
      newErrors.minimumSpend =
        'Minimum spend must be a non-negative number.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        await updatePromotion.mutateAsync({
          id: promotionId,
          name: formData.name,
          description: formData.description,
          termsAndConditions: formData.termsAndConditions,
          isActive: formData.isActive,
          beginDate: formData.beginDate,
          endDate: formData.endDate,
          promotionType: formData.promotionType as
            | 'MULTIPLIER'
            | 'BONUS_POINTS',
          promotionScope: formData.promotionScope as
            | 'ALL_LISTINGS'
            | 'SPECIFIC_LISTINGS'
            | 'ALL_PRODUCTS'
            | 'SPECIFIC_PRODUCTS',
          multiplier:
            formData.promotionType === 'MULTIPLIER'
              ? parseFloat(formData.multiplier)
              : undefined,
          bonusPoints:
            formData.promotionType === 'BONUS_POINTS'
              ? parseInt(formData.bonusPoints, 10)
              : undefined,
          limitPerCustomer: formData.limitPerCustomer
            ? parseInt(formData.limitPerCustomer, 10)
            : undefined,
          minimumSpend: parseFloat(formData.minimumSpend),
          businessIds: formData.businessIds,
          includedProductIds: formData.includedProductIds,
          excludedProductIds: formData.excludedProductIds,
        });
        setIsSuccess(true);
      } catch (error) {
        console.error('Failed to update promotion:', error);
      }
    } else {
      console.log('Form has validation errors:', validationErrors);
    }
  };

  const handleMultiSelectChange = (
    field: 'businessIds' | 'includedProductIds' | 'excludedProductIds',
    id: string
  ) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(id)
        ? currentValues.filter(v => v !== id)
        : [...currentValues, id];
      return { ...prev, [field]: newValues };
    });
  };

  if (isLoadingPromotion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 sm:mb-0">
              Edit Promotion
            </h1>
            <div className="text-base text-gray-500 flex items-center space-x-1">
              <span>Home</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Promotions</span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-gray-500" />
                Promotion Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Promotion Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <p className="text-base text-red-600 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="termsAndConditions">
                  Terms and Conditions
                </Label>
                <Textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  placeholder="Terms and Conditions (optional)"
                  value={formData.termsAndConditions}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <Tag className="h-6 w-6 mr-3 text-gray-500" />
                Promotion Rules
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="promotionType">Promotion Type</Label>
                  <Select
                    name="promotionType"
                    value={formData.promotionType}
                    onValueChange={value =>
                      handleSelectChange('promotionType', value as typeof formData.promotionType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLIER">Multiplier</SelectItem>
                      <SelectItem value="BONUS_POINTS">
                        Bonus Points
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.promotionType && (
                    <p className="text-base text-red-600 mt-1">
                      {errors.promotionType}
                    </p>
                  )}
                </div>
                {formData.promotionType === 'MULTIPLIER' && (
                  <div className="grid gap-2">
                    <Label htmlFor="multiplier">Multiplier</Label>
                    <Input
                      id="multiplier"
                      name="multiplier"
                      type="number"
                      value={formData.multiplier}
                      onChange={handleInputChange}
                    />
                    {errors.multiplier && (
                      <p className="text-base text-red-600 mt-1">
                        {errors.multiplier}
                      </p>
                    )}
                  </div>
                )}
                {formData.promotionType === 'BONUS_POINTS' && (
                  <div className="grid gap-2">
                    <Label htmlFor="bonusPoints">Bonus Points</Label>
                    <Input
                      id="bonusPoints"
                      name="bonusPoints"
                      type="number"
                      value={formData.bonusPoints}
                      onChange={handleInputChange}
                    />
                    {errors.bonusPoints && (
                      <p className="text-base text-red-600 mt-1">
                        {errors.bonusPoints}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="promotionScope">Promotion Scope</Label>
                <Select
                  name="promotionScope"
                  value={formData.promotionScope}
                  onValueChange={value =>
                    handleSelectChange('promotionScope', value as typeof formData.promotionScope)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_LISTINGS">All Listings</SelectItem>
                    <SelectItem value="SPECIFIC_LISTINGS">
                      Specific Listings
                    </SelectItem>
                    <SelectItem value="ALL_PRODUCTS">All Products</SelectItem>
                    <SelectItem value="SPECIFIC_PRODUCTS">
                      Specific Products
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.promotionScope && (
                  <p className="text-base text-red-600 mt-1">
                    {errors.promotionScope}
                  </p>
                )}
              </div>

              {formData.promotionScope === 'SPECIFIC_LISTINGS' && (
                <div className="grid gap-2">
                  <Label htmlFor="businessIds">Select Businesses</Label>
                  <Popover open={openBusiness} onOpenChange={setOpenBusiness}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBusiness}
                        className="w-full justify-between"
                      >
                        {formData.businessIds.length > 0
                          ? `${formData.businessIds.length} business(es) selected`
                          : 'Select businesses...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search businesses..." />
                        <CommandEmpty>No businesses found.</CommandEmpty>
                        <CommandGroup>
                          {isLoadingListings ? (
                            <CommandItem>Loading...</CommandItem>
                          ) : (
                            listings?.map((listing: InHouseBusiness) => (
                              <CommandItem
                                key={listing.id}
                                onSelect={() =>
                                  handleMultiSelectChange(
                                    'businessIds',
                                    listing.id
                                  )
                                }
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.businessIds.includes(
                                      listing.id
                                    )
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
              )}

              {formData.promotionScope === 'SPECIFIC_PRODUCTS' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="includedProductIds">
                      Included Products
                    </Label>
                    <Popover
                      open={openIncludedProducts}
                      onOpenChange={setOpenIncludedProducts}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openIncludedProducts}
                          className="w-full justify-between"
                        >
                          {formData.includedProductIds.length > 0
                            ? `${formData.includedProductIds.length} product(s) selected`
                            : 'Select products...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search products..." />
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                            {isLoadingProducts ? (
                              <CommandItem>Loading...</CommandItem>
                            ) : (
                              includedProductsOptions?.map((product: Product) => (
                                <CommandItem
                                  key={product.id}
                                  onSelect={() =>
                                    handleMultiSelectChange(
                                      'includedProductIds',
                                      product.id
                                    )
                                  }
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.includedProductIds.includes(
                                        product.id
                                      )
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {product.title}
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="excludedProductIds">
                      Excluded Products
                    </Label>
                    <Popover
                      open={openExcludedProducts}
                      onOpenChange={setOpenExcludedProducts}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openExcludedProducts}
                          className="w-full justify-between"
                        >
                          {formData.excludedProductIds.length > 0
                            ? `${formData.excludedProductIds.length} product(s) selected`
                            : 'Select products...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search products..." />
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                            {isLoadingProducts ? (
                              <CommandItem>Loading...</CommandItem>
                            ) : (
                              excludedProductsOptions?.map((product: Product) => (
                                <CommandItem
                                  key={product.id}
                                  onSelect={() =>
                                    handleMultiSelectChange(
                                      'excludedProductIds',
                                      product.id
                                    )
                                  }
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.excludedProductIds.includes(
                                        product.id
                                      )
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {product.title}
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <HelpCircle className="h-6 w-6 mr-3 text-gray-500" />
                Conditions
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="minimumSpend">Minimum Spend</Label>
                  <Input
                    id="minimumSpend"
                    name="minimumSpend"
                    type="number"
                    value={formData.minimumSpend}
                    onChange={handleInputChange}
                  />
                  {errors.minimumSpend && (
                    <p className="text-base text-red-600 mt-1">
                      {errors.minimumSpend}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="limitPerCustomer">
                    Limit Per Customer
                  </Label>
                  <Input
                    id="limitPerCustomer"
                    name="limitPerCustomer"
                    type="number"
                    placeholder="No limit"
                    value={formData.limitPerCustomer}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="beginDate">Begin Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.beginDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.beginDate ? (
                          format(formData.beginDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.beginDate}
                        onSelect={(date) => handleSelectChange('beginDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleSelectChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3 w-full sm:w-auto text-lg"
              disabled={updatePromotion.isPending}
            >
              {updatePromotion.isPending
                ? 'Updating...'
                : 'Update Promotion'}
              <ArrowRight className="h-5 w-5 ml-2" />
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
              Promotion Updated!
            </DialogTitle>
            <DialogDescription className="text-center">
              The promotion has been updated successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => router.push('/dashboard/loyalty/promotion')}
            >
              Go to Promotions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
