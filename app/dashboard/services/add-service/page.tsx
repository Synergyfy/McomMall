'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronRight,
  PlusCircle,
  Trash2,
  Info,
  Save,
  Store,
  Image as ImageIcon,
  DollarSign,
  Settings,
  ListPlus,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

import { useGetUserListings } from '@/service/listings/hook';
import { useAddService } from '@/service/services/hook';
import { UserListing } from '@/service/listings/types';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { uploadFile } from '@/lib/upload';
import { SuccessAnimationDialog } from '@/components/SuccessAnimationDialog';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import AvailabilityEditor from './components/AvailabilityEditor';

// --- ZOD SCHEMA ---

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(160, 'Max 160 characters'),
  description: z.string().optional(),
  businessId: z.string().min(1, 'Please select a business'),
  isActive: z.boolean().default(true),
  pricingModel: z.enum(['fixed', 'perHour', 'perUnit']),
  fixedPrice: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  pricePerHour: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  pricePerUnit: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  unitName: z.string().optional(),

  // Guest Pricing
  enableGuestPricing: z.boolean().default(false),
  minGuests: z.coerce.number().min(1).optional(),
  maxGuests: z.coerce.number().min(1).optional(),
  guestPricingModel: z.enum(['perGuest', 'fixedGroup', 'baseWithAdditional']).optional(),
  pricePerGuest: z.coerce.number().min(0).optional(),
  fixedGroupPrice: z.coerce.number().min(0).optional(),
  basePrice: z.coerce.number().min(0).optional(),
  baseGuests: z.coerce.number().min(1).optional(),
  additionalGuestPrice: z.coerce.number().min(0).optional(),

  // Quote Model
  isQuoteModel: z.boolean().default(false),
  bookingFee: z.coerce.number().min(0).optional(),

  // Availability
  availability: z.object({
    schedule: z.array(z.object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string()
    })),
    slotDuration: z.number().min(5),
    bufferTime: z.number().min(0),
    maxBookingsPerSlot: z.number().min(1),
    serviceRadiusKm: z.number().optional()
  }).optional(),

  // Arrays
  bundledServices: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    price: z.coerce.number().optional(),
  })).optional(),

  configurableAddons: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    price: z.coerce.number().optional(),
    pricingType: z.enum(['oneTime', 'perGuest', 'perUnit']),
    unitName: z.string().optional(),
  })).optional(),

  media: z.array(z.any()).min(1, 'At least one image is required'),
}).superRefine((data, ctx) => {
  // Pricing Model Validation
  if (data.pricingModel === 'fixed' && data.fixedPrice === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Fixed price is required', path: ['fixedPrice'] });
  }
  if (data.pricingModel === 'perHour' && data.pricePerHour === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price per hour is required', path: ['pricePerHour'] });
  }
  if (data.pricingModel === 'perUnit') {
    if (data.pricePerUnit === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price per unit is required', path: ['pricePerUnit'] });
    }
    if (!data.unitName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Unit name is required', path: ['unitName'] });
    }
  }

  // Guest Pricing Validation
  if (data.enableGuestPricing) {
    if (!data.minGuests) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min guests required', path: ['minGuests'] });
    if (!data.maxGuests) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Max guests required', path: ['maxGuests'] });

    if (data.guestPricingModel === 'perGuest' && data.pricePerGuest === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price per guest required', path: ['pricePerGuest'] });
    }
    if (data.guestPricingModel === 'fixedGroup' && data.fixedGroupPrice === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Fixed group price required', path: ['fixedGroupPrice'] });
    }
    if (data.guestPricingModel === 'baseWithAdditional') {
      if (data.basePrice === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Base price required', path: ['basePrice'] });
      if (data.baseGuests === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Base guests required', path: ['baseGuests'] });
      if (data.additionalGuestPrice === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Additional guest price required', path: ['additionalGuestPrice'] });
    }
  }

  // Quote Model Validation
  if (data.isQuoteModel && data.bookingFee === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Booking fee is required', path: ['bookingFee'] });
  }

  // Media Validation
  if (data.media.length > 5) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Max 5 files allowed', path: ['media'] });
  }
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function AddServicePage() {
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newServiceId, setNewServiceId] = useState<string | null>(null);

  const { data: listings, isLoading: isLoadingListings } = useGetUserListings();
  const { mutate: addService, isPending: isAddingService } = useAddService();

  const businesses = listings?.data?.filter((l: UserListing) => l.listingType.includes('service')) || [];

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      businessId: '',
      pricingModel: 'fixed',
      enableGuestPricing: false,
      guestPricingModel: 'perGuest',
      isQuoteModel: false,
      bundledServices: [],
      configurableAddons: [],
      media: [],
      availability: undefined, // Will use component defaults if undefined
    },
  });

  const { fields: bundledFields, append: appendBundled, remove: removeBundled } = useFieldArray({
    control: form.control,
    name: 'bundledServices',
  });

  const { fields: addonFields, append: appendAddon, remove: removeAddon } = useFieldArray({
    control: form.control,
    name: 'configurableAddons',
  });

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const mediaUrls = await Promise.all(
        data.media.map((file: File) => uploadFile(file))
      );

      const serviceData = {
        ...data,
        images: mediaUrls.map(result => result.secure_url),
        // Clean up undefined/optional number fields if they were empty strings in raw input (handled by coerce but good to be safe)
      };

      // CreateServiceDto might have stricter types than form values but logic aligns
      addService(serviceData, {
        onSuccess: (res) => {
          setNewServiceId(res.id);
          setShowSuccessDialog(true);
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to create service');
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during upload');
    }
  };

  const pricingModel = form.watch('pricingModel');
  const enableGuestPricing = form.watch('enableGuestPricing');
  const guestPricingModel = form.watch('guestPricingModel');
  const isQuoteModel = form.watch('isQuoteModel');

  return (
    <div className="font-sans">
       <SuccessAnimationDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          router.push('/dashboard/services');
        }}
      />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Service</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new service offering for your business.
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/dashboard/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium">Add Service</span>
          </div>
        </header>

        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* --- LEFT COLUMN (Main Content) --- */}
              <div className="lg:col-span-2 space-y-8">

                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Basic Information
                    </CardTitle>
                    <CardDescription>Service name and details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Full Body Massage" {...field} className="py-6 text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your service..." className="min-h-[120px] text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Pricing Strategy
                    </CardTitle>
                    <CardDescription>Configure how you charge for this service.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="pricingModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="py-6">
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="perHour">Per Hour</SelectItem>
                              <SelectItem value="perUnit">Per Unit</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {pricingModel === 'fixed' && (
                      <FormField
                        control={form.control}
                        name="fixedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Price</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} className="py-6" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {pricingModel === 'perHour' && (
                      <FormField
                        control={form.control}
                        name="pricePerHour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Per Hour</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} className="py-6" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {pricingModel === 'perUnit' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="pricePerUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Per Unit</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} className="py-6" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="unitName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Session, Item" {...field} className="py-6" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Guest Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Guest Pricing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="enableGuestPricing"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Guest Pricing</FormLabel>
                                        <FormDescription>
                                            Adjust price based on number of guests.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {enableGuestPricing && (
                            <div className="space-y-6 p-4 bg-slate-50 rounded-lg border">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="minGuests"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Min Guests</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="maxGuests"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Max Guests</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="guestPricingModel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Guest Pricing Model</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="perGuest">Per Guest</SelectItem>
                                                    <SelectItem value="fixedGroup">Fixed Group</SelectItem>
                                                    <SelectItem value="baseWithAdditional">Base + Additional</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                {guestPricingModel === 'perGuest' && (
                                    <FormField
                                        control={form.control}
                                        name="pricePerGuest"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price Per Guest</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {guestPricingModel === 'fixedGroup' && (
                                    <FormField
                                        control={form.control}
                                        name="fixedGroupPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fixed Group Price</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {guestPricingModel === 'baseWithAdditional' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="basePrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Base Price</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="baseGuests"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Base Guests</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="additionalGuestPrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Extra Guest Price</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Availability Editor */}
                <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <AvailabilityEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Quote Model */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quote Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="isQuoteModel"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Quote Mode</FormLabel>
                                        <FormDescription>Customers request a quote instead of booking.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         {isQuoteModel && (
                            <FormField
                                control={form.control}
                                name="bookingFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Booking Fee</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Bundled Services */}
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                             <ListPlus className="w-5 h-5 text-primary" />
                             Bundled Services
                         </CardTitle>
                        <CardDescription>Included in this package.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {bundledFields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name={`bundledServices.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl><Input placeholder="Service Name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`bundledServices.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem className="w-32">
                                            <FormControl><Input type="number" placeholder="Price" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeBundled(index)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendBundled({ name: '', price: 0 })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Service
                        </Button>
                    </CardContent>
                </Card>

                 {/* Configurable Addons */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                             <ListPlus className="w-5 h-5 text-primary" />
                             Configurable Add-ons
                         </CardTitle>
                        <CardDescription>Optional extras for customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {addonFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-slate-50/50">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-medium">Add-on #{index + 1}</h4>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAddon(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name={`configurableAddons.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input placeholder="Add-on Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`configurableAddons.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="number" placeholder="Price" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`configurableAddons.${index}.pricingType`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="oneTime">One Time</SelectItem>
                                                        <SelectItem value="perGuest">Per Guest</SelectItem>
                                                        <SelectItem value="perUnit">Per Unit</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    {form.watch(`configurableAddons.${index}.pricingType`) === 'perUnit' && (
                                         <FormField
                                            control={form.control}
                                            name={`configurableAddons.${index}.unitName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="Unit Name" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendAddon({ name: '', price: 0, pricingType: 'oneTime' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Add-on
                        </Button>
                    </CardContent>
                </Card>

              </div>

              {/* --- RIGHT COLUMN (Sticky Sidebar) --- */}
              <div className="space-y-8 sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar">

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Publish</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Button type="submit" className="w-full text-lg py-6" disabled={isAddingService}>
                            {isAddingService ? (
                                <span className="flex items-center gap-2">Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Save Service</span>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Business Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Store className="w-5 h-5 text-primary" />
                        Business
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="businessId"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingListings}>
                            <FormControl>
                              <SelectTrigger className="py-6">
                                <SelectValue placeholder={isLoadingListings ? "Loading..." : "Select Business"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businesses.map((b: UserListing) => (
                                <SelectItem key={b.id} value={b.id}>{b.businessName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Media */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            Media
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="media"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MultiMediaUpload onMediaChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Hotspots */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Hotspots</CardTitle>
                        <CardDescription>Add interactive hotspots after saving.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild variant="outline" className="w-full" disabled={!newServiceId}>
                            <Link href={`/dashboard/hotspot-editor/edit/${newServiceId}?type=service`}>
                                Edit Hotspots
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

              </div>

            </form>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}
