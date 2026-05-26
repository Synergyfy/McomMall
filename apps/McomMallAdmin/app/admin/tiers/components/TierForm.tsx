'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tier, CreateTierInput, UpdateTierInput, TierType } from '@/app/admin/types/tier';
import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const tierSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    type: z.nativeEnum(TierType).optional(),
    trialDuration: z.coerce.number().min(0).optional(),
    monthlyPrice: z.coerce.number().min(0, 'Must be 0 or greater'),
    quarterlyPrice: z.coerce.number().min(0, 'Must be 0 or greater'),
    annualPrice: z.coerce.number().min(0, 'Must be 0 or greater'),
    stripeMonthlyPriceId: z.string().optional(),
    stripeQuarterlyPriceId: z.string().optional(),
    stripeAnnualPriceId: z.string().optional(),
    paypalMonthlyPlanId: z.string().optional(),
    paypalQuarterlyPlanId: z.string().optional(),
    paypalAnnualPlanId: z.string().optional(),
    features: z.array(z.string()).optional(),
    configuration: z.object({
        quotas: z.object({
            maxListings: z.coerce.number().min(0),
            allowProductListing: z.boolean(),
            allowServiceListing: z.boolean(),
            maxProducts: z.coerce.number().min(0),
            maxServices: z.coerce.number().min(0),
            maxGiftCardTemplates: z.coerce.number().min(0),
            maxCouponTemplates: z.coerce.number().min(0),
            maxLoyaltyPrograms: z.coerce.number().min(0),
            maxImagesPerListing: z.coerce.number().min(0),
            featuredListingAllowance: z.coerce.number().min(0),
        }),
        featureFlags: z.object({
            priorityInSearch: z.boolean(),
            advancedAnalytics: z.boolean(),
            dedicatedSupport: z.boolean(),
            allowCustomBranding: z.boolean(),
            allowGroupCreation: z.boolean(),
        }),
        disabledNavIds: z.array(z.string()).optional(),
    }),
    isActive: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
}).refine(data => {
    if (data.type === TierType.TRIAL) {
        return !!data.trialDuration && data.trialDuration > 0;
    }
    return true;
}, {
    message: "Trial duration is required and must be greater than 0 for Trial tiers",
    path: ["trialDuration"],
});


const DEFAULT_CONFIGURATION = {
    quotas: {
        maxListings: 10,
        allowProductListing: true,
        allowServiceListing: true,
        maxProducts: 5,
        maxServices: 5,
        maxGiftCardTemplates: 1,
        maxCouponTemplates: 1,
        maxLoyaltyPrograms: 0,
        maxImagesPerListing: 3,
        featuredListingAllowance: 0,
    },
    featureFlags: {
        priorityInSearch: false,
        advancedAnalytics: false,
        dedicatedSupport: false,
        allowCustomBranding: false,
        allowGroupCreation: false,
    },
    disabledNavIds: [],
};

const AVAILABLE_NAVS = [
    { id: 'nav-dashboard', label: 'Dashboard' },
    { id: 'nav-activity-timer', label: 'Activity Timer' },
    { id: 'nav-my-bookings', label: 'My Bookings' },
    { id: 'nav-messages', label: 'Messages' },
    { id: 'nav-wishlist', label: 'My Wishlist' },
    { id: 'nav-coupon-voucher', label: 'Coupon-Voucher' },
    { id: 'nav-support-tickets', label: 'Support Tickets' },
    { id: 'nav-add-listing', label: 'Add Listing' },
    { id: 'nav-my-listings', label: 'My Listings' },
    { id: 'nav-reviews', label: 'Reviews' },
    { id: 'nav-product', label: 'Product' },
    { id: 'nav-add-product', label: 'Add Product' },
    { id: 'nav-orders', label: 'Orders' },
    { id: 'nav-service', label: 'Service' },
    { id: 'nav-add-service', label: 'Add Service' },
    { id: 'nav-bookings', label: 'Bookings' },
    { id: 'nav-loyalty', label: 'Loyalty & Reward' },
    { id: 'nav-gift-card', label: 'Gift Card' },
    { id: 'nav-voucher', label: 'Voucher' },
    { id: 'nav-coupons', label: 'Coupons' },
    { id: 'nav-hotspot', label: 'Hotspot Campaigns' },
    { id: 'nav-partnerships', label: 'Partnerships' },
    { id: 'nav-group-circles', label: 'Group Circles' },
    { id: 'nav-reward-history', label: 'Reward History' },
    { id: 'nav-hist-gift-card', label: 'Gift Card History' },
    { id: 'nav-my-vouchers', label: 'My Vouchers' },
    { id: 'nav-my-coupons', label: 'My Coupons' },
    { id: 'nav-my-profile', label: 'My Profile' },
    { id: 'nav-my-subscription', label: 'My Subscription' },
    { id: 'nav-wallet', label: 'Wallet' },
    { id: 'nav-cashback', label: 'Cashback' },
];

type TierFormValues = z.infer<typeof tierSchema>;

interface TierFormProps {
    formId: string;
    initialData?: Partial<Tier>;
    onSubmit: (data: CreateTierInput | UpdateTierInput) => void;
}

export function TierForm({ formId, initialData, onSubmit }: TierFormProps) {
    const form = useForm<TierFormValues>({
        resolver: zodResolver(tierSchema),
        defaultValues: {
            name: '',
            description: '',
            type: TierType.STANDARD,
            trialDuration: 14,
            monthlyPrice: 0,
            quarterlyPrice: 0,
            annualPrice: 0,
            stripeMonthlyPriceId: '',
            stripeQuarterlyPriceId: '',
            stripeAnnualPriceId: '',
            paypalMonthlyPlanId: '',
            paypalQuarterlyPlanId: '',
            paypalAnnualPlanId: '',
            features: [],
            configuration: DEFAULT_CONFIGURATION,
            isActive: true,
            startDate: '',
            endDate: '',
        },

    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "features" as never,
    });

    useEffect(() => {
        if (initialData) {
            const initialConfig = initialData.configuration || DEFAULT_CONFIGURATION;
            const mergedConfig = {
                quotas: {
                    ...DEFAULT_CONFIGURATION.quotas,
                    ...(initialConfig.quotas || {}),
                },
                featureFlags: {
                    ...DEFAULT_CONFIGURATION.featureFlags,
                    ...(initialConfig.featureFlags || {}),
                },
                disabledNavIds: initialConfig.disabledNavIds || [],
            };

            console.log('Resetting form with config:', mergedConfig); // Debugging

            form.reset({
                ...initialData,
                type: initialData.type || TierType.STANDARD,
                trialDuration: initialData.trialDuration || 14,
                stripeMonthlyPriceId: initialData.stripeMonthlyPriceId || '',
                stripeQuarterlyPriceId: initialData.stripeQuarterlyPriceId || '',
                stripeAnnualPriceId: initialData.stripeAnnualPriceId || '',
                paypalMonthlyPlanId: initialData.paypalMonthlyPlanId || '',
                paypalQuarterlyPlanId: initialData.paypalQuarterlyPlanId || '',
                paypalAnnualPlanId: initialData.paypalAnnualPlanId || '',
                features: initialData.features || [],
                configuration: mergedConfig,
                quarterlyPrice: initialData.quarterlyPrice || 0,
                startDate: initialData.startDate || '',
                endDate: initialData.endDate || '',
            } as TierFormValues);

        }
    }, [initialData, form]);

    const handleSubmit = (values: TierFormValues) => {
        // Ensure configuration is complete on submit if something went wrong
        const config = values.configuration || DEFAULT_CONFIGURATION;
        const mergedConfig = {
            quotas: { ...DEFAULT_CONFIGURATION.quotas, ...(config.quotas || {}) },
            featureFlags: { ...DEFAULT_CONFIGURATION.featureFlags, ...(config.featureFlags || {}) },
            disabledNavIds: config.disabledNavIds || [],
        };
        values.configuration = mergedConfig;

        onSubmit(values);
    };

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 overflow-y-auto min-h-0 p-1">
                <div className="pb-4">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className={`grid w-full mb-4 ${form.watch('type') === TierType.TRIAL ? 'grid-cols-4' : 'grid-cols-5'}`}>
                            <TabsTrigger value="general">General</TabsTrigger>
                            {form.watch('type') !== TierType.TRIAL && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
                            <TabsTrigger value="quotas">Quotas</TabsTrigger>
                            <TabsTrigger value="features">Features</TabsTrigger>
                            <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        </TabsList>

                        {/* General Tab */}
                        <TabsContent value="general" className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tier Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Gold Plan" {...field} />
                                        </FormControl>
                                        <FormDescription>This name will be displayed to users during checkout.</FormDescription>
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
                                            <Input placeholder="Description of the tier" {...field} />
                                        </FormControl>
                                        <FormDescription>A brief description of the tier's benefits.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active</FormLabel>
                                            <FormDescription>
                                                Enable or disable this tier for new subscriptions.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {form.watch('type') === TierType.TRIAL && (
                                <FormField
                                    control={form.control}
                                    name="trialDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trial Duration (Days)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Number of days the free trial lasts.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {form.watch('startDate') && (
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date (Seasonal)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date (Seasonal)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </TabsContent>


                        {/* Pricing Tab */}
                        {form.watch('type') !== TierType.TRIAL && (
                            <TabsContent value="pricing" className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="monthlyPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly Price</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                                                        <Input type="number" step="0.01" className="pl-7" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>Price billed every month.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="quarterlyPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quarterly Price</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                                                        <Input type="number" step="0.01" className="pl-7" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>Price billed every 3 months.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="annualPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Annual Price</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                                                        <Input type="number" step="0.01" className="pl-7" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>Price billed every year.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-medium text-sm text-muted-foreground">Stripe IDs</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="stripeMonthlyPriceId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Monthly Price ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="price_..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="stripeQuarterlyPriceId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quarterly Price ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="price_..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="stripeAnnualPriceId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Annual Price ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="price_..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-medium text-sm text-muted-foreground">PayPal IDs</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="paypalMonthlyPlanId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Monthly Plan ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="P-..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="paypalQuarterlyPlanId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quarterly Plan ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="P-..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="paypalAnnualPlanId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Annual Plan ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="P-..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        )}

                        {/* Quotas Tab */}
                        <TabsContent value="quotas" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.maxListings"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Listings</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.maxProducts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Products</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.maxServices"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Services</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.maxImagesPerListing"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Images per Listing</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.maxGiftCardTemplates"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Gift Card Templates</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.maxCouponTemplates"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Coupon Templates</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.maxLoyaltyPrograms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Loyalty Programs</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.featuredListingAllowance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Featured Listing Allowance</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-6 pt-4">
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.allowProductListing"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Allow Products</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.quotas.allowServiceListing"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Allow Services</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </TabsContent>

                        {/* Features Tab */}
                        <TabsContent value="features" className="space-y-4">
                            <div className="space-y-4 border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <FormLabel className="text-base">Features (Display Only)</FormLabel>
                                        <FormDescription>
                                            Add features that will be displayed in the pricing card.
                                        </FormDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append("")}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`features.${index}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-0">
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g. Advanced Analytics" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div className="text-sm text-slate-500 italic text-center py-4">
                                            No display features added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="font-medium text-sm text-muted-foreground">Feature Flags</h3>
                                <FormField
                                    control={form.control}
                                    name="configuration.featureFlags.priorityInSearch"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel className="text-base">Priority In Search</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.featureFlags.advancedAnalytics"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel className="text-base">Advanced Analytics</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.featureFlags.dedicatedSupport"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel className="text-base">Dedicated Support</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.featureFlags.allowCustomBranding"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel className="text-base">Custom Branding</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="configuration.featureFlags.allowGroupCreation"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel className="text-base">Group Creation</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </TabsContent>

                        {/* Permissions Tab */}
                        <TabsContent value="permissions" className="space-y-4">
                            <div className="rounded-lg border p-4 space-y-4">
                                <div>
                                    <FormLabel className="text-base">Navigation Permissions</FormLabel>
                                    <FormDescription>
                                        Select which navigation items should be **locked** (hidden) for this tier.
                                    </FormDescription>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                                    {AVAILABLE_NAVS.map((nav) => (
                                        <FormField
                                            key={nav.id}
                                            control={form.control}
                                            name="configuration.disabledNavIds"
                                            render={({ field }) => {
                                                const value = field.value || [];
                                                const isChecked = value.includes(nav.id);

                                                return (
                                                    <FormItem
                                                        key={nav.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <FormControl>
                                                            <Switch
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...value, nav.id])
                                                                        : field.onChange(value.filter((v) => v !== nav.id));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel className="text-sm font-medium">
                                                                {nav.label}
                                                            </FormLabel>
                                                            <p className="text-[10px] text-muted-foreground font-mono">
                                                                {nav.id}
                                                            </p>
                                                        </div>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </form>
        </Form>
    );
}
