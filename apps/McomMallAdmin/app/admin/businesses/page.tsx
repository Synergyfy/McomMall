'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sectors } from '../data/mock-data';
import {
    useGetBusinessStats,
    useGetAdminBusinesses,
    useGetBusinessListings,
    useVerifyBusiness,
    useUpdateBusiness,
    useGetBusinessDetail
} from '@/service/admin/hook';
import { AdminBusiness } from '@/service/admin/types';
import { toast } from 'sonner';
import {
    Search,
    MoreHorizontal,
    Eye,
    Edit,
    Ban,
    Download,
    Plus,
    Building2,
    MapPin,
    Phone,
    Mail,
    Star,
    ListChecks,
    Calendar,
    CheckCircle,
    XCircle,
    DollarSign,
    TrendingUp,
    Shield,
    Pause,
    Play,
    ExternalLink,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Status Badge Component
function BusinessStatusBadge({ status }: { status: AdminBusiness['status'] }) {
    const statusConfig = {
        published: { label: 'Published', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
        archived: { label: 'Archived', className: 'bg-red-100 text-red-700 border-red-200' },
        suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700 border-red-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-slate-100 text-slate-700' };

    return (
        <Badge variant="outline" className={cn('font-medium', config.className)}>
            {config.label}
        </Badge>
    );
}

// Edit Business Schema
const editBusinessSchema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    legalName: z.string().min(2, 'Legal name is required'),
    businessEmail: z.string().email('Invalid email address'),
    businessPhone: z.string().min(5, 'Phone number is required'),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    shortDescription: z.string().max(200, 'Too long').optional(),
    about: z.string().optional(),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    status: z.string(),
});

type EditBusinessFormValues = z.infer<typeof editBusinessSchema>;

// Edit Business Sheet
function EditBusinessSheet({
    business,
    open,
    onOpenChange,
}: {
    business: AdminBusiness | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data: fullDetails } = useGetBusinessDetail(business?.id || '');
    const updateMutation = useUpdateBusiness();

    const form = useForm<EditBusinessFormValues>({
        resolver: zodResolver(editBusinessSchema),
        defaultValues: {
            businessName: '',
            legalName: '',
            businessEmail: '',
            businessPhone: '',
            website: '',
            shortDescription: '',
            about: '',
            logoUrl: '',
            bannerUrl: '',
            status: 'draft',
        },
    });

    useEffect(() => {
        if (business) {
            form.reset({
                businessName: fullDetails?.businessName || business.name || '',
                legalName: fullDetails?.legalName || business.name || '',
                businessEmail: fullDetails?.businessEmail || business.email || '',
                businessPhone: fullDetails?.businessPhone || business.phone || '',
                website: fullDetails?.website || '',
                shortDescription: fullDetails?.shortDescription || '',
                about: fullDetails?.about || '',
                logoUrl: fullDetails?.logoUrl || business.logo || '',
                bannerUrl: fullDetails?.bannerUrl || '',
                status: fullDetails?.status || business.status || 'draft',
            });
        }
    }, [business, fullDetails, form]);

    const onSubmit = async (values: EditBusinessFormValues) => {
        if (!business) return;

        // Create partial payload with only dirty fields
        const dirtyFields = form.formState.dirtyFields;
        const payload: Partial<EditBusinessFormValues> = {};

        Object.keys(dirtyFields).forEach((key) => {
            const typedKey = key as keyof EditBusinessFormValues;
            const value = values[typedKey];

            // Avoid sending empty strings for URLs if backend expects valid URL or nothing
            if ((typedKey === 'website' || typedKey === 'logoUrl' || typedKey === 'bannerUrl') && !value) {
                return;
            }

            payload[typedKey] = value;
        });

        if (Object.keys(payload).length === 0) {
            onOpenChange(false);
            return;
        }

        try {
            await updateMutation.mutateAsync({
                id: business.id,
                data: payload,
            });
            onOpenChange(false);
        } catch (error) {
            // Error toast handled in hook
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="pb-6 border-b">
                    <SheetTitle className="text-xl flex items-center gap-2">
                        <Edit className="h-5 w-5 text-orange-500" />
                        Edit Business
                    </SheetTitle>
                    <SheetDescription>
                        Update business information and settings for {business?.name}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Urban Eats" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="legalName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Legal Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Urban Eats LTD" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="businessEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="contact@business.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="businessPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Phone</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="+15551001" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://business.com" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shortDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Brief catchphrase or pitch" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About</FormLabel>
                                        <FormControl>
                                            <textarea
                                                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                                placeholder="Tell us about the business..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="logoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://example.com/logo.jpg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bannerUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Banner URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://example.com/banner.jpg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select business status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-4 border-t mt-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                    disabled={updateMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Business Detail Sheet
function BusinessDetailSheet({
    business,
    open,
    onOpenChange,
    onEditTrigger,
}: {
    business: AdminBusiness | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEditTrigger: () => void;
}) {
    const { data: listings, isLoading: listingsLoading } = useGetBusinessListings(business?.id || '');
    const { data: fullDetails, isLoading: detailsLoading } = useGetBusinessDetail(business?.id || '');
    const verifyMutation = useVerifyBusiness();
    const updateMutation = useUpdateBusiness();

    if (!business) return null;

    const handleVerifyStatus = async () => {
        try {
            await verifyMutation.mutateAsync({
                id: business.id,
                isVerified: !business.verified
            });
        } catch (error) {
            // Error toast handled in hook
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = business.status === 'active' ? 'suspended' : 'active';
        try {
            await updateMutation.mutateAsync({
                id: business.id,
                data: { status: newStatus }
            });
        } catch (error) {
            // Error toast handled in hook
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="pb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-xl">
                            <AvatarImage src={business.logo} className="object-cover" />
                            <AvatarFallback className="text-lg rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                                {business.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle className="text-xl">{business.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                <BusinessStatusBadge status={business.status} />
                                {business.verified && (
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info">Info</TabsTrigger>
                        <TabsTrigger value="listings">Listings</TabsTrigger>
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-6 pt-4">
                        {/* Business Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-lg bg-slate-50">
                                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                                    <Star className="h-4 w-4 fill-amber-500" />
                                    <span className="font-bold">{business.rating.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-slate-500">Rating</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-slate-50">
                                <p className="font-bold text-slate-900">{business.reviewCount}</p>
                                <p className="text-xs text-slate-500">Reviews</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-slate-50">
                                <p className="font-bold text-slate-900">{business.listingCount}</p>
                                <p className="text-xs text-slate-500">Listings</p>
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">Business Information</h4>
                            <div className="grid gap-3">
                                {detailsLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="h-12 w-full bg-slate-50 animate-pulse rounded-lg" />
                                    ))
                                ) : (
                                    <>
                                        {fullDetails?.legalName && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                                <Building2 className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Legal Name</p>
                                                    <p className="text-sm font-medium">{fullDetails.legalName}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                            <Building2 className="h-4 w-4 text-slate-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Category</p>
                                                <p className="text-sm font-medium">{business.sector} → {business.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                                            <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-slate-500">Address</p>
                                                <p className="text-sm font-medium">{business.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                            <Mail className="h-4 w-4 text-slate-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Email</p>
                                                <p className="text-sm font-medium">{business.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                            <Phone className="h-4 w-4 text-slate-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Phone</p>
                                                <p className="text-sm font-medium">{business.phone}</p>
                                            </div>
                                        </div>
                                        {fullDetails?.website && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                                <ExternalLink className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Website</p>
                                                    <a href={fullDetails.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-orange-600 hover:underline">
                                                        {fullDetails.website}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            <div>
                                                <p className="text-xs text-slate-500">Joined</p>
                                                <p className="text-sm font-medium">{new Date(business.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* About */}
                        {fullDetails?.about && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-900">About</h4>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">
                                    {fullDetails.about}
                                </p>
                            </div>
                        )}

                        {/* Owner */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">Owner</h4>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                                        {business.owner.split(' ').map((n) => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-slate-900">{business.owner}</p>
                                    <p className="text-xs text-slate-500">Business Owner ID: {business.ownerId}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="listings" className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">All listings for this business.</p>
                                {listings && listings.length > 0 && (
                                    <Badge variant="secondary">{listings.length} items</Badge>
                                )}
                            </div>

                            <div className="space-y-3">
                                {listingsLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-lg" />
                                    ))
                                ) : listings && listings.length > 0 ? (
                                    listings.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-xs font-bold text-orange-600">${item.price}</p>
                                                    <span className="text-[10px] text-slate-400">•</span>
                                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">{item.type}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                'text-[10px] px-1.5 py-0',
                                                item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                            )}>
                                                {item.status}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">No listings found for this business.</p>
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" className="w-full">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View in Marketplace
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="actions" className="pt-4">
                        <div className="space-y-3">
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    onEditTrigger();
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Business Details
                            </Button>

                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={handleVerifyStatus}
                                disabled={verifyMutation.isPending}
                            >
                                {verifyMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Shield className="h-4 w-4 mr-2" />
                                )}
                                {business.verified ? 'Revoke Verification' : 'Verify Business'}
                            </Button>

                            <Button className="w-full justify-start" variant="outline" onClick={() => toast.info("Feature coming soon")}>
                                <Star className="h-4 w-4 mr-2" />
                                Set as Featured Business
                            </Button>

                            <Button className="w-full justify-start" variant="outline" onClick={() => toast.info("Payouts management coming soon")}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Manage Payouts
                            </Button>

                            <div className="pt-4 border-t space-y-3">
                                <Button
                                    className={cn(
                                        "w-full justify-start",
                                        business.status === 'active' ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    )}
                                    variant="outline"
                                    onClick={handleToggleStatus}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : business.status === 'active' ? (
                                        <Pause className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Play className="h-4 w-4 mr-2" />
                                    )}
                                    {business.status === 'active' ? 'Suspend Business' : 'Activate Business'}
                                </Button>

                                <Button className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" variant="outline" onClick={() => toast.info("Deletion requires confirmation")}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Remove from Marketplace
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}

export default function BusinessesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sectorFilter, setSectorFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedBusiness, setSelectedBusiness] = useState<AdminBusiness | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editSheetOpen, setEditSheetOpen] = useState(false);

    // Mutations
    const verifyMutation = useVerifyBusiness();
    const updateMutation = useUpdateBusiness();

    // Queries
    const { data: stats, isLoading: statsLoading } = useGetBusinessStats();
    const { data: businessesResponse, isLoading: businessesLoading } = useGetAdminBusinesses({
        search: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sector: sectorFilter === 'all' ? undefined : sectorFilter,
        page,
        limit,
    });

    const businesses = businessesResponse?.data || [];
    const totalPages = businessesResponse?.totalPages || 1;

    const handleViewBusiness = (business: AdminBusiness) => {
        setSelectedBusiness(business);
        setSheetOpen(true);
    };

    const handleExport = () => {
        if (!businesses || businesses.length === 0) {
            toast.error('No business data available to export');
            return;
        }

        const exportData = businesses.map(b => ({
            ID: b.id,
            Name: b.name,
            Owner: b.owner,
            Status: b.status,
            Verified: b.verified ? 'Yes' : 'No',
            Rating: b.rating.toFixed(1),
            Reviews: b.reviewCount,
            Listings: b.listingCount,
            Sector: b.sector,
            Category: b.category,
            Email: b.email,
            Phone: b.phone,
            Address: b.address,
            Joined: new Date(b.createdAt).toLocaleDateString(),
        }));

        exportToCSV(exportData, `businesses-export-${new Date().toISOString().split('T')[0]}`);
        toast.success('Business data exported successfully');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
                    <p className="text-slate-500">Manage business accounts and listings</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download businesses as CSV</TooltipContent>
                    </Tooltip>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Business
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.total || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Total Businesses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.active || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100">
                                <ListChecks className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Pending Review</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.verified || 0}</p>
                                )}
                                <p className="text-xs text-slate-500">Verified</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by business or owner name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(val) => {
                            setStatusFilter(val);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sectorFilter} onValueChange={(val) => {
                            setSectorFilter(val);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Sector" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sectors</SelectItem>
                                {sectors.map((sector) => (
                                    <SelectItem key={sector.id} value={sector.name}>
                                        {sector.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Businesses Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Listings</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {businessesLoading ? (
                                    Array(limit).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />
                                                        <div className="h-3 w-32 bg-slate-100 animate-pulse rounded" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell className="text-right"><div className="h-8 w-8 bg-slate-100 animate-pulse rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : businesses.map((business) => (
                                    <TableRow key={business.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleViewBusiness(business)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 rounded-lg">
                                                    <AvatarImage src={business.logo} className="object-cover" />
                                                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 text-white text-sm">
                                                        {business.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900">{business.name}</p>
                                                        {business.verified && (
                                                            <CheckCircle className="h-4 w-4 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500">{business.owner}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">{business.category}</p>
                                                <p className="text-xs text-slate-500">{business.sector}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <BusinessStatusBadge status={business.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                <span className="font-medium">{business.rating.toFixed(1)}</span>
                                                <span className="text-slate-400 text-sm">({business.reviewCount})</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{business.listingCount}</span>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleViewBusiness(business)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedBusiness(business);
                                                        setEditSheetOpen(true);
                                                    }}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Business
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedBusiness(business);
                                                        setSheetOpen(true);
                                                    }}>
                                                        <ListChecks className="h-4 w-4 mr-2" />
                                                        View Listings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {!business.verified ? (
                                                        <DropdownMenuItem
                                                            className="text-blue-600"
                                                            onClick={() => verifyMutation.mutate({ id: business.id, isVerified: true })}
                                                            disabled={verifyMutation.isPending}
                                                        >
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Verify
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-blue-600"
                                                            onClick={() => verifyMutation.mutate({ id: business.id, isVerified: false })}
                                                            disabled={verifyMutation.isPending}
                                                        >
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Revoke Verification
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className={business.status === 'active' ? "text-red-600" : "text-emerald-600"}
                                                        onClick={() => updateMutation.mutate({
                                                            id: business.id,
                                                            data: { status: business.status === 'active' ? 'suspended' : 'active' }
                                                        })}
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        {business.status === 'active' ? (
                                                            <>
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Suspend
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {!businessesLoading && businesses.length === 0 && (
                        <div className="p-8 text-center border-t">
                            <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No businesses found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t bg-slate-50/50">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, businessesResponse?.total || 0)}</span> of <span className="font-medium">{businessesResponse?.total || 0}</span> businesses
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || businessesLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = page - 2 + i;

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            className={cn("w-8 h-8 p-0", page === pageNum && "bg-orange-500 hover:bg-orange-600")}
                                            onClick={() => setPage(pageNum)}
                                            disabled={businessesLoading}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || businessesLoading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Business Detail Sheet */}
            <BusinessDetailSheet
                business={selectedBusiness}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onEditTrigger={() => setEditSheetOpen(true)}
            />

            {/* Edit Business Sheet */}
            <EditBusinessSheet
                business={selectedBusiness}
                open={editSheetOpen}
                onOpenChange={setEditSheetOpen}
            />
        </div>
    );
}
