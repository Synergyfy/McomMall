'use client';

import {
  FormProvider,
  useForm,
  useFieldArray,
  FieldErrors,
  FieldError,
} from 'react-hook-form';
import { useGetUserListings } from '@/service/listings/hook';
import {
  Plus,
  Settings,
  Box,
  Trash2,
  Link as LinkIcon,
  Download,
  X,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

import { useGetProductById, useUpdateProduct } from '@/service/store/products/hook';
import { UpdateSuccessDialog } from '../../components/UpdateSuccessDialog';
import { CreateProductDto } from '@/service/store/products/types';
import VariantManager from '../../components/VariantManager';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { businessCategories } from '@/lib/business-categories';

interface Listing {
  id: string;
  businessName: string;
}

import { ProductVariant } from '@/service/store/products/types';

interface ProductFormValues {
  title: string;
  productType: 'physical' | 'downloadable' | 'virtual';
  category: string;
  subCategories: string[];
  tags: string[];
  price: number;
  discountedPrice?: number;
  shortDescription: string;
  description: string;
  sku: string;
  enableStockManagement: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  allowBackorders: 'no' | 'notify' | 'yes';
  allowSingleOrder: boolean;
  shippingMethod: 'free' | 'pickup' | 'delivery';
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  files?: { fileList: FileList | null }[];
  downloadLimit?: number;
  downloadExpiry?: number;
  productUrl?: string;
  productStatus: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'password-protected';
  purchaseNote?: string;
  enableReviews: boolean;
  media: File[];
  businessId?: string;
  variants: ProductVariant[];
  imageUrls?: string[];
}

const customResolver = (data: ProductFormValues) => {
  const errors: FieldErrors<ProductFormValues> = {};

  if (!data.title?.trim()) {
    errors.title = { type: 'required', message: 'Product title is required.' };
  }
  if (!data.productType) {
    errors.productType = {
      type: 'required',
      message: 'You must select a product type.',
    };
  }
  if (!data.category?.trim()) {
    errors.category = {
      type: 'required',
      message: 'Please select a category.',
    };
  }
    if (!data.subCategories || data.subCategories.length === 0) {
    errors.subCategories = {
      type: 'required',
      message: 'Please select at least one sub-category.',
    };
  }
  if (data.price === undefined || data.price < 0) {
    errors.price = {
      type: 'min',
      message: 'Price must be a positive number.',
    };
  }
  if (!data.shortDescription?.trim()) {
    errors.shortDescription = {
      type: 'required',
      message: 'Short description is required.',
    };
  }
  if (!data.description?.trim()) {
    errors.description = {
      type: 'required',
      message: 'Description is required.',
    };
  }
  if (!data.sku?.trim()) {
    errors.sku = { type: 'required', message: 'SKU is required.' };
  }
  if (data.enableStockManagement && data.stockQuantity === undefined) {
    errors.stockQuantity = {
      type: 'required',
      message: 'Stock quantity is required when stock management is enabled.',
    };
  }
  if (data.productType === 'physical' && data.weight === undefined) {
    errors.weight = {
      type: 'required',
      message: 'Weight is required for physical products.',
    };
  }
  if (data.productType === 'physical') {
    const dimErrors: {
      length?: FieldError;
      width?: FieldError;
      height?: FieldError;
    } = {};
    if (data.dimensions?.length === undefined) {
      dimErrors.length = { type: 'required', message: 'Length is required.' };
    }
    if (data.dimensions?.width === undefined) {
      dimErrors.width = { type: 'required', message: 'Width is required.' };
    }
    if (data.dimensions?.height === undefined) {
      dimErrors.height = { type: 'required', message: 'Height is required.' };
    }
    if (Object.keys(dimErrors).length > 0) {
      errors.dimensions = dimErrors;
    }
  }
  // On the edit page, we don't want to force the user to re-upload an image.
  // The backend should handle keeping the old image if a new one isn't provided.
  if (data.media && data.media.length > 5) {
    (errors.media as unknown as FieldError) = {
      type: 'max',
      message: 'You can upload a maximum of 5 files.',
    };
  }
  if (!data.businessId) {
    errors.businessId = {
      type: 'required',
      message: 'Please select a business.',
    };
  }

  if (data.productType === 'downloadable') {
    if (
      !data.files ||
      data.files.length === 0 ||
      data.files.every(f => f === null)
    ) {
      errors.files = {
        type: 'required',
        message: 'You must add at least one file for a downloadable product.',
      };
    } else {
      let totalSize = 0;
      data.files.forEach(fileObject => {
        if (fileObject && fileObject.fileList) {
          Array.from(fileObject.fileList).forEach(file => {
            totalSize += file.size;
          });
        }
      });

      if (totalSize > 100 * 1024 * 1024) {
        (errors.files as { root?: FieldError }).root = {
          type: 'maxSize',
          message: 'Total file size cannot exceed 100 MB.',
        };
      }
    }
  }

  if (data.productType === 'virtual') {
    if (!data.productUrl || data.productUrl.trim() === '') {
      errors.productUrl = {
        type: 'required',
        message: 'Product URL is required for virtual products.',
      };
    } else {
      try {
        new URL(data.productUrl);
      } catch {
        errors.productUrl = {
          type: 'pattern',
          message: 'Please enter a valid URL.',
        };
      }
    }
  }

  return {
    values: Object.keys(errors).length > 0 ? {} : data,
    errors: errors,
  };
};

import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading: isLoadingProduct } = useGetProductById(id);

  const form = useForm<ProductFormValues>({
    resolver: customResolver,
    defaultValues: {
      title: '',
      productType: 'physical',
      category: '',
      subCategories: [],
      tags: [],
      price: 0,
      discountedPrice: undefined,
      shortDescription: '',
      description: '',
      sku: '',
      enableStockManagement: false,
      stockQuantity: undefined,
      lowStockThreshold: undefined,
      allowBackorders: 'no',
      allowSingleOrder: false,
      shippingMethod: 'free',
      weight: undefined,
      dimensions: {
        length: undefined,
        width: undefined,
        height: undefined,
      },
      files: [],
      productStatus: 'draft',
      visibility: 'public',
      purchaseNote: '',
      enableReviews: true,
      media: [],
      businessId: '',
      variants: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title,
        productType: product.productType as 'physical' | 'downloadable' | 'virtual',
        category: product.category,
        subCategories: product.subCategories || [],
        price: product.price,
        discountedPrice: product.salePrice,
        tags: product.tags || [],
        shortDescription: product.shortDescription,
        description: product.description,
        sku: product.sku,
        shippingMethod: product.shippingMethod || 'free',
        enableStockManagement: product.enableStockManagement,
        stockQuantity: product.stock,
        lowStockThreshold: product.stock, // Assuming this is the case
        allowBackorders: 'no', // Assuming default
        allowSingleOrder: false, // Assuming default
        weight: product.weight,
        dimensions: {
          length: product.length,
          width: product.width,
          height: product.height,
        },
        files: [], // Not handled
        downloadLimit: product.downloadLimit,
        downloadExpiry: product.downloadExpiry,
        productUrl: product.productUrl,
        productStatus: product.productStatus as 'draft' | 'published' | 'archived',
        visibility: product.visibility as 'public' | 'private' | 'password-protected',
        purchaseNote: product.purchaseNote,
        enableReviews: product.enableReviews,
        businessId: product.bussinessId,
        media: [],
        imageUrls: product.fileUrls || [],
        variants: product.variants || [],
      });
    }
  }, [product, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'files',
  });

  const { data: userListings, isLoading: isLoadingListings } =
    useGetUserListings();

  const { mutate: updateProduct, isPending } = useUpdateProduct();

  const productType = form.watch('productType');

  async function onSubmit(data: ProductFormValues) {
    const productData: Partial<CreateProductDto> = {
      bussinessId: data.businessId as string,
      title: data.title,
      category: data.category,
      subCategories: data.subCategories,
      shippingMethod: data.shippingMethod,
      productType: data.productType,
      price: Number(data.price),
      description: data.description,
      sku: data.sku,
      shortDescription: data.shortDescription,
      fileUrls: data.imageUrls,
      productUrl: data.productUrl,
      downloadLimit: data.downloadLimit
        ? Number(data.downloadLimit)
        : undefined,
      downloadExpiry: data.downloadExpiry
        ? Number(data.downloadExpiry)
        : undefined,
      enableStockManagement: data.enableStockManagement,
      weight: data.weight ? Number(data.weight) : undefined,
      length: data.dimensions?.length
        ? Number(data.dimensions.length)
        : undefined,
      width: data.dimensions?.width ? Number(data.dimensions.width) : undefined,
      height: data.dimensions?.height
        ? Number(data.dimensions.height)
        : undefined,
      productStatus: data.productStatus,
      visibility: data.visibility,
      purchaseNote: data.purchaseNote,
      enableReviews: data.enableReviews,
      tags: data.tags,
      variants: data.variants,
    };

    updateProduct(
      { id, ...productData },
      {
        onSuccess: () => {
          setIsSuccessDialogOpen(true);
        },
        onError: (error: Error) => {
          console.error('Failed to save product:', error);
          toast.error(
            error.message || 'Failed to save product. Please try again.',
            {
              style: {
                minWidth: '300px',
                minHeight: '60px',
                fontSize: '1.25rem',
                backgroundColor: 'hsl(var(--destructive))',
                color: 'hsl(var(--destructive-foreground))',
              },
            }
          );
        },
      }
    );
  }

  if (isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Loading product data...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 text-base">
      <div className="max-w-7xl mx-auto">
        <UpdateSuccessDialog
          open={isSuccessDialogOpen}
          onOpenChange={setIsSuccessDialogOpen}
        />
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Edit Product
        </h1>

        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                {/* Product Title */}
                <Card>
                  <CardContent className="p-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel
                            className={cn(
                              'text-xl font-semibold',
                              error && 'text-red-500'
                            )}
                          >
                            Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter product title"
                              {...field}
                              className="text-base py-6"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VariantManager name="variants" />
                  </CardContent>
                </Card>

                {/* Product Data Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Product Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem className="space-y-3">
                          <FormLabel
                            className={cn('text-lg', error && 'text-red-500')}
                          >
                            Product Type
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="physical" />
                                </FormControl>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <FormLabel className="font-normal text-base">
                                      Physical
                                    </FormLabel>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      A physical product that requires shipping.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="downloadable" />
                                </FormControl>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <FormLabel className="font-normal text-base">
                                      Downloadable
                                    </FormLabel>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      A product that can be downloaded after
                                      purchase.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="virtual" />
                                </FormControl>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <FormLabel className="font-normal text-base">
                                      Virtual
                                    </FormLabel>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      A virtual product that does not require
                                      shipping and is not downloadable.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field, fieldState: { error } }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-base',
                                error && 'text-red-500'
                              )}
                            >
                              Price (£)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                className="text-base py-6"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-base font-medium" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                            <FormItem>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <FormLabel className="text-base">
                                            Discounted Price (£)
                                            </FormLabel>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>The lowest price you are willing to sell this product.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <FormControl>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    {...field}
                                    className="text-base py-6"
                                />
                                </FormControl>
                                <FormMessage className="text-red-500 text-base font-medium" />
                            </FormItem>
                        )}
                        />
                    </div>
                  </CardContent>
                </Card>

                {/* Short Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Short Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Write a short description for the product..."
                              className="min-h-[150px] text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Provide a detailed description of the product..."
                              className="min-h-[200px] text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Conditional Sections based on Product Type */}
                {productType === 'physical' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Box className="w-6 h-6" /> Inventory & Shipping
                      </CardTitle>
                      <CardDescription className="text-base">
                        Manage inventory and shipping details for this product.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <FormLabel className="text-base">
                                        SKU (Stock Keeping Unit)
                                        </FormLabel>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>A unique identifier for this product. It can be a barcode, a number, or a combination of letters and numbers.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <FormControl>
                              <Input
                                placeholder="e.g., TSHIRT-RED-L"
                                {...field}
                                className="text-base py-6"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="enableStockManagement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-base">
                              Enable product stock management
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {form.watch('enableStockManagement') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                          <FormField
                            control={form.control}
                            name="stockQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <FormLabel className="text-base">
                                            Stock quantity
                                            </FormLabel>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Total number of this product in stock. This is automatically calculated based on the sum of quantities from all variants. You can also edit it here.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    className="text-base py-6"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-base font-medium" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lowStockThreshold"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  Low stock threshold
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    className="text-base py-6"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="allowBackorders"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  Allow Backorders?
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="text-base py-6">
                                      <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem
                                      value="no"
                                      className="text-base"
                                    >
                                      Do not allow
                                    </SelectItem>
                                    <SelectItem
                                      value="notify"
                                      className="text-base"
                                    >
                                      Allow, but notify customer
                                    </SelectItem>
                                    <SelectItem
                                      value="yes"
                                      className="text-base"
                                    >
                                      Allow
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name="allowSingleOrder"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-base">
                                    Allow only one quantity of this product to
                                    be bought in a single order
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-4 pt-4 border-t">
                        <FormLabel className="text-lg">Shipping</FormLabel>
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-normal text-base">
                                Weight (kg)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  className="text-base py-6"
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-base font-medium" />
                            </FormItem>
                          )}
                        />
                        <div>
                          <FormField
                            control={form.control}
                            name="dimensions"
                            render={() => (
                              <FormItem>
                                <FormLabel className="font-normal text-base">
                                  Dimensions (cm)
                                </FormLabel>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                  <FormField
                                    control={form.control}
                                    name="dimensions.length"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder="Length"
                                            {...field}
                                            className="text-base py-6"
                                          />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-base font-medium" />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="dimensions.width"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder="Width"
                                            {...field}
                                            className="text-base py-6"
                                          />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-base font-medium" />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="dimensions.height"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder="Height"
                                            {...field}
                                            className="text-base py-6"
                                          />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-base font-medium" />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                          <FormLabel className="text-lg">Delivery Details</FormLabel>
                          <FormField
                            control={form.control}
                            name="shippingMethod"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="free" />
                                      </FormControl>
                                      <FormLabel className="font-normal text-base">
                                        Free Delivery
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="pickup" />
                                      </FormControl>
                                      <FormLabel className="font-normal text-base">
                                        Pickup
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="delivery" />
                                      </FormControl>
                                      <FormLabel className="font-normal text-base">
                                        Delivery Options
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {productType === 'downloadable' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Download className="w-6 h-6" />
                        Downloadable Options
                      </CardTitle>
                      <CardDescription className="text-base">
                        Configure your downloadable product settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <FormLabel
                          className={cn(
                            'text-lg',
                            form.formState.errors.files && 'text-red-500'
                          )}
                        >
                          Files
                        </FormLabel>
                        <div className="space-y-4 mt-2">
                          {fields.map((field, index) => (
                            <div
                              key={field.id}
                              className="flex items-center gap-4 p-4 border rounded-md"
                            >
                              <FormField
                                control={form.control}
                                name={`files.${index}.fileList`}
                                render={({
                                  field: { onChange, value, ...rest },
                                }) => (
                                  <div className="w-full">
                                    <div className="flex items-center gap-4">
                                      <Input
                                        type="file"
                                        multiple
                                        {...rest}
                                        onChange={event => {
                                          onChange(event.target.files);
                                        }}
                                        className="w-full"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-600"
                                      >
                                        <Trash2 className="h-6 w-6" />
                                      </Button>
                                    </div>
                                    {value instanceof FileList &&
                                      value.length > 0 &&
                                      Array.from(value).map((file: File) => (
                                        <div
                                          key={file.name}
                                          className="text-sm text-gray-500 mt-2"
                                        >
                                          {file.name} (
                                          {(file.size / 1024 / 1024).toFixed(2)}{' '}
                                          MB)
                                        </div>
                                      ))}
                                  </div>
                                )}
                              />
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="mt-4 text-base"
                          onClick={() => append({ fileList: null })}
                        >
                          <Plus className="mr-2 h-5 w-5" /> Add More Files
                        </Button>
                        <FormMessage className="text-red-500 text-base font-medium mt-2">
                          {form.formState.errors.files?.message}
                        </FormMessage>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <FormField
                          control={form.control}
                          name="downloadLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Download Limit
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="-1"
                                  {...field}
                                  className="text-base py-6"
                                />
                              </FormControl>
                              <FormDescription className="text-sm">
                                Leave blank or -1 for unlimited.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="downloadExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Download Expiry
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="-1"
                                  {...field}
                                  className="text-base py-6"
                                />
                              </FormControl>
                              <FormDescription className="text-sm">
                                Enter number of days. Leave blank or -1 for
                                never.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {productType === 'virtual' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <LinkIcon className="w-6 h-6" />
                        Virtual Product
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="productUrl"
                        render={({ field, fieldState: { error } }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-base',
                                error && 'text-red-500'
                              )}
                            >
                              Product URL
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/virtual-product"
                                {...field}
                                className="text-base py-6"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-base font-medium" />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Other Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Settings className="w-6 h-6" /> Other Options
                    </CardTitle>
                    <CardDescription className="text-base">
                      Set your extra product options.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="productStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Product Status
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-base py-6">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft" className="text-base">
                                  Draft
                                </SelectItem>
                                <SelectItem
                                  value="published"
                                  className="text-base"
                                >
                                  Published
                                </SelectItem>
                                <SelectItem
                                  value="archived"
                                  className="text-base"
                                >
                                  Archived
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Visibility
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-base py-6">
                                  <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem
                                  value="public"
                                  className="text-base"
                                >
                                  Public
                                </SelectItem>
                                <SelectItem
                                  value="private"
                                  className="text-base"
                                >
                                  Private
                                </SelectItem>
                                <SelectItem
                                  value="password-protected"
                                  className="text-base"
                                >
                                  Password Protected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="purchaseNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Purchase Note
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Customer will get this info in their order email."
                              {...field}
                              className="text-base"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="enableReviews"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-base">
                            Enable product reviews
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-8">
                {/* Business Listing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Business</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="businessId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingListings}
                          >
                            <FormControl>
                              <SelectTrigger className="text-base py-6">
                                <SelectValue placeholder="Select a business" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingListings ? (
                                <SelectItem value="loading" disabled>
                                  Loading businesses...
                                </SelectItem>
                              ) : (
                                userListings?.map((listing: Listing) => (
                                  <SelectItem
                                    key={listing.id}
                                    value={listing.id}
                                  >
                                    {listing.businessName}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Product Media */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Product Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="media"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <MultiMediaUpload
                              onMediaChange={field.onChange}
                              initialMedia={product?.fileUrls}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Category */}
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel
                            className={cn(
                              'text-2xl font-semibold',
                              error && 'text-red-500'
                            )}
                          >
                            Category
                          </FormLabel>
                          <FormDescription>
                            Select a category for your product.
                          </FormDescription>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    'w-full justify-between text-base py-6',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value
                                    ? businessCategories.find(
                                        (cat) => cat.name === field.value
                                      )?.name
                                    : 'Select a category'}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                  <CommandEmpty>No category found.</CommandEmpty>
                                  <CommandGroup>
                                    {businessCategories.map((cat) => (
                                      <CommandItem
                                        value={cat.name}
                                        key={cat.name}
                                        onSelect={() => {
                                          form.setValue('category', cat.name, { shouldValidate: true });
                                          form.setValue('subCategories', [], { shouldValidate: true });
                                        }}
                                      >
                                        {cat.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Sub Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Sub Categories</CardTitle>
                    <CardDescription>
                      Select sub-categories for your product.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="subCategories"
                      render={({ field }) => (
                        <FormItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-base py-6"
                                disabled={!form.watch('category')}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                {field.value?.length > 0
                                  ? 'Add more sub-categories'
                                  : 'Select sub-categories'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Search sub-categories..." />
                                <CommandList>
                                  <CommandEmpty>
                                    No sub-categories found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {businessCategories
                                      .find(c => c.name === form.watch('category'))
                                      ?.subCategories.map(sc => (
                                        <CommandItem
                                          key={sc.name}
                                          value={sc.name}
                                          onSelect={() => {
                                            const currentValue = form.getValues('subCategories') || [];
                                            if (!currentValue.includes(sc.name)) {
                                              form.setValue('subCategories', [...currentValue, sc.name], { shouldValidate: true });
                                            }
                                          }}
                                        >
                                          {sc.name}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {field.value?.map(subCategory => (
                              <Badge
                                key={subCategory}
                                variant="secondary"
                                className="text-base"
                              >
                                {subCategory}
                                <button
                                  type="button"
                                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    const currentValue = form.getValues('subCategories') || [];
                                    form.setValue('subCategories', currentValue.filter(s => s !== subCategory), { shouldValidate: true });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <FormMessage className="text-red-500 text-base font-medium" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Tags</CardTitle>
                    <CardDescription>
                      Add tags to your product. Press Enter to add a new tag.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <Input
                            placeholder="e.g., Summer, T-shirt"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value) {
                                e.preventDefault();
                                const newTag = e.currentTarget.value.trim();
                                if (newTag && !field.value.includes(newTag)) {
                                  form.setValue('tags', [...field.value, newTag], { shouldValidate: true });
                                }
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <div className="flex flex-wrap gap-2 mt-4">
                            {field.value?.map(tag => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-base"
                              >
                                {tag}
                                <button
                                  type="button"
                                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    form.setValue('tags', field.value.filter(t => t !== tag), { shouldValidate: true });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submission Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white text-lg py-7 px-8 flex items-center"
                disabled={isPending}
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
        </FormProvider>
      </div>
    </div>
  );
}
