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
  Users,
  MapPin,
  CalendarCheck,
  ClipboardList,
  Clock,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import { useGetUserListings } from '@/service/listings/hook';
import { useAddService } from '@/service/services/hook';
import { UserListing } from '@/service/listings/types';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { uploadFile } from '@/lib/upload';
import { SuccessAnimationDialog } from '@/components/SuccessAnimationDialog';
import Link from 'next/link';
import AvailabilityEditor from './components/AvailabilityEditor';

// --- ZOD SCHEMA ---

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(160, 'Max 160 characters'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  targetAudience: z.string().optional(), // CSV
  tags: z.string().optional(), // CSV

  businessId: z.string().min(1, 'Please select a business'),
  isActive: z.boolean().default(true),

  // Service Type
  deliveryConfig: z.object({
    mode: z.enum(['onsite', 'atShop', 'remote', 'hybrid']),
    cities: z.string().optional(), // CSV
    regions: z.string().optional(), // CSV
    travelFee: z.coerce.number().min(0).optional(),
  }).optional(),

  // Pricing
  pricingModel: z.enum(['fixed', 'perHour', 'perUnit', 'perJob', 'perDistance', 'perSession', 'subscription']),
  fixedPrice: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  pricePerHour: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  pricePerUnit: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  unitName: z.string().optional(),

  pricingRules: z.object({
    weekendMultiplier: z.coerce.number().min(0).optional(),
    nightSurcharge: z.coerce.number().min(0).optional(),
    emergencySurcharge: z.coerce.number().min(0).optional(),
    holidaySurcharge: z.coerce.number().min(0).optional(),
  }).optional(),

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
      endTime: z.string(),
      breaks: z.array(z.object({
        start: z.string(),
        end: z.string(),
      })).optional()
    })),
    slotDuration: z.number().min(5),
    bufferTime: z.number().min(0),
    maxBookingsPerSlot: z.number().min(1),
    serviceRadiusKm: z.number().optional(),
    staffPerBooking: z.number().min(1).optional(),
  }).optional(),

  // Variants
  variants: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    type: z.enum(['time', 'resource']),
    price: z.coerce.number().min(0),
    duration: z.coerce.number().optional(),
  })).optional(),

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

  // Tiered Packages
  enableTieredPackages: z.boolean().default(false),
  tiers: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    features: z.array(z.string())
  })).optional(),

  // Booking Logic
  requireApproval: z.boolean().default(false),
  bookingRequirements: z.object({
    requireAddress: z.boolean().default(false),
    requirePhone: z.boolean().default(false),
    requirePhotos: z.boolean().default(false),
    requireProblemDescription: z.boolean().default(false),
    specialInstructions: z.string().optional(),
  }).optional(),

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
      shortDescription: '',
      description: '',
      category: '',
      subcategory: '',
      targetAudience: '',
      tags: '',
      isActive: true,
      businessId: '',
      pricingModel: 'fixed',
      enableGuestPricing: false,
      guestPricingModel: 'perGuest',
      isQuoteModel: false,
      bundledServices: [],
      configurableAddons: [],
      media: [],
      variants: [],
      availability: undefined,
      enableTieredPackages: false,
      requireApproval: false,
      deliveryConfig: {
        mode: 'onsite',
        cities: '',
        regions: '',
        travelFee: 0
      },
      pricingRules: {
        weekendMultiplier: 1,
        nightSurcharge: 0,
        emergencySurcharge: 0,
        holidaySurcharge: 0
      },
      bookingRequirements: {
        requireAddress: true,
        requirePhone: true,
        requirePhotos: false,
        requireProblemDescription: true,
        specialInstructions: ''
      },
      tiers: [
        { name: 'Basic', description: '', price: 0, features: [] },
        { name: 'Standard', description: '', price: 0, features: [] },
        { name: 'Premium', description: '', price: 0, features: [] }
      ],
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

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const mediaUrls = await Promise.all(
        data.media.map((file: File) => uploadFile(file))
      );

      // Transform CSV strings to arrays
      const targetAudience = data.targetAudience?.split(',').map(s => s.trim()).filter(Boolean);
      const tags = data.tags?.split(',').map(s => s.trim()).filter(Boolean);
      const deliveryConfig = data.deliveryConfig ? {
        ...data.deliveryConfig,
        cities: data.deliveryConfig.cities?.split(',').map(s => s.trim()).filter(Boolean),
        regions: data.deliveryConfig.regions?.split(',').map(s => s.trim()).filter(Boolean),
      } : undefined;

      // Note: TypeScript might complain because DTO expects arrays but form has strings.
      // We cast to any or match DTO structure manually.
      const serviceData: any = {
        ...data,
        targetAudience,
        tags,
        deliveryConfig,
        images: mediaUrls.map(result => result.secure_url),
      };

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
  const enableTieredPackages = form.watch('enableTieredPackages');
  const deliveryMode = form.watch('deliveryConfig.mode');

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

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 h-auto">
                    <TabsTrigger value="basic" className="py-3">Basic</TabsTrigger>
                    <TabsTrigger value="type" className="py-3">Type & Area</TabsTrigger>
                    <TabsTrigger value="pricing" className="py-3">Pricing</TabsTrigger>
                    <TabsTrigger value="availability" className="py-3">Availability</TabsTrigger>
                    <TabsTrigger value="workflow" className="py-3">Workflow</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    {/* Basic Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-primary" />
                          Basic Information
                        </CardTitle>
                        <CardDescription>Service name, description and categorization.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Full Body Massage" {...field} className="py-6 text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Wellness" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="subcategory"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Subcategory</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Massage" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <FormField
                          control={form.control}
                          name="shortDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Short Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief overview (max 150 chars)" {...field} maxLength={150} />
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
                              <FormLabel>Full Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Detailed description of your service..." className="min-h-[120px] text-base" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                            control={form.control}
                            name="targetAudience"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Target Audience (Comma separated)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Families, Seniors, Students" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Tags (Comma separated)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. relaxing, quick, affordable" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="type" className="space-y-6 mt-6">
                    {/* Delivery Mode & Area */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Service Type & Area
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="deliveryConfig.mode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Mode</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="onsite">On-site (Customer Location)</SelectItem>
                                                <SelectItem value="atShop">At Shop/Office</SelectItem>
                                                <SelectItem value="remote">Remote/Online</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {(deliveryMode === 'onsite' || deliveryMode === 'hybrid') && (
                                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                                    <h4 className="font-medium text-sm">Service Area Configuration</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="deliveryConfig.cities"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cities (Comma separated)</FormLabel>
                                                    <FormControl><Input placeholder="e.g. London, Manchester" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deliveryConfig.regions"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Regions (Comma separated)</FormLabel>
                                                    <FormControl><Input placeholder="e.g. Greater London" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deliveryConfig.travelFee"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Travel Fee</FormLabel>
                                                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Note: Set travel radius in the Availability section.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Variants */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListPlus className="w-5 h-5 text-primary" />
                                Service Variants
                            </CardTitle>
                            <CardDescription>Time-based (e.g. 1hr, 2hr) or Resource-based (e.g. 1 Tech, 2 Techs).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {variantFields.map((field, index) => (
                                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end border p-3 rounded-md">
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel className="text-xs">Name</FormLabel>
                                                <FormControl><Input placeholder="e.g. 2 Hours" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem className="w-full md:w-32">
                                                 <FormLabel className="text-xs">Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="time">Time</SelectItem>
                                                        <SelectItem value="resource">Resource</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem className="w-full md:w-28">
                                                <FormLabel className="text-xs">Price</FormLabel>
                                                <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)} className="mb-0.5">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendVariant({ name: '', type: 'time', price: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Tiered Packages */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          Packages
                        </CardTitle>
                        <CardDescription>Does this service have packages/options?</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="enableTieredPackages"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-orange-50/30">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-orange-900">Enable Package Tiers</FormLabel>
                                <FormDescription>Show customers a comparison of different service levels.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {enableTieredPackages && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Basic', 'Standard', 'Premium'].map((tierName, idx) => (
                              <Card key={tierName} className="border-2 hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg">{tierName}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name={`tiers.${idx}.price`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`tiers.${idx}.description`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Brief Pitch</FormLabel>
                                        <FormControl><Input placeholder="Great for..." {...field} /></FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="space-y-2">
                                    <Label className="text-xs">Included Features (CSV)</Label>
                                    <Input
                                      placeholder="Feature A, Feature B..."
                                      onChange={(e) => {
                                        const features = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                                        form.setValue(`tiers.${idx}.features`, features);
                                      }}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-6 mt-6">
                    {/* Pricing */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
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
                                  <SelectItem value="perJob">Per Job</SelectItem>
                                  <SelectItem value="perDistance">Per Distance</SelectItem>
                                  <SelectItem value="perSession">Per Session</SelectItem>
                                  <SelectItem value="subscription">Subscription</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {['fixed', 'perJob', 'perSession', 'subscription'].includes(pricingModel) && (
                          <FormField
                            control={form.control}
                            name="fixedPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
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

                        {/* Dynamic Pricing Rules */}
                        <div className="space-y-4 pt-4 border-t">
                             <h4 className="font-medium">Dynamic Pricing Rules</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="pricingRules.weekendMultiplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weekend Multiplier (1.0 = standard)</FormLabel>
                                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="pricingRules.nightSurcharge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Night Surcharge ($)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="pricingRules.emergencySurcharge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Emergency Surcharge ($)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="pricingRules.holidaySurcharge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Holiday Surcharge ($)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                             </div>
                        </div>

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
                            {/* ... fields for guest pricing details ... */}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Addons */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListPlus className="w-5 h-5 text-primary" />
                                Configurable Add-ons
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {addonFields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-center">
                                     <FormField
                                        control={form.control}
                                        name={`configurableAddons.${index}.name`}
                                        render={({ field }) => (
                                            <FormControl><Input placeholder="Name" {...field} /></FormControl>
                                        )}
                                     />
                                     <FormField
                                        control={form.control}
                                        name={`configurableAddons.${index}.price`}
                                        render={({ field }) => (
                                            <FormControl><Input type="number" placeholder="Price" className="w-24" {...field} /></FormControl>
                                        )}
                                     />
                                     <Button type="button" variant="ghost" size="icon" onClick={() => removeAddon(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                     </Button>
                                </div>
                             ))}
                             <Button type="button" variant="outline" onClick={() => appendAddon({ name: '', price: 0, pricingType: 'oneTime' })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Add-on
                            </Button>
                        </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="availability" className="space-y-6 mt-6">
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
                  </TabsContent>

                  <TabsContent value="workflow" className="space-y-6 mt-6">
                    {/* Booking Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Booking & Job Workflow</CardTitle>
                        <CardDescription>Configure how bookings are handled.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="requireApproval"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Manual Approval Required</FormLabel>
                                <FormDescription>You must manually confirm bookings before they are finalized.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Separator />
                        <h4 className="font-medium mb-4">Customer Input Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="bookingRequirements.requireAddress"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="font-normal">Require Address</FormLabel>
                                    </FormItem>
                                )}
                             />
                             <FormField
                                control={form.control}
                                name="bookingRequirements.requirePhone"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="font-normal">Require Phone</FormLabel>
                                    </FormItem>
                                )}
                             />
                             <FormField
                                control={form.control}
                                name="bookingRequirements.requirePhotos"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="font-normal">Require Photos</FormLabel>
                                    </FormItem>
                                )}
                             />
                             <FormField
                                control={form.control}
                                name="bookingRequirements.requireProblemDescription"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="font-normal">Require Problem Desc</FormLabel>
                                    </FormItem>
                                )}
                             />
                        </div>
                        <div className="pt-4">
                            <FormField
                                control={form.control}
                                name="bookingRequirements.specialInstructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Special Instructions for Customer</FormLabel>
                                        <FormControl><Textarea placeholder="e.g. Please clear the area before arrival." {...field} /></FormControl>
                                    </FormItem>
                                )}
                             />
                        </div>

                      </CardContent>
                    </Card>

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
                  </TabsContent>

                </Tabs>

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
