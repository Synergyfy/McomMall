'use client';

import { useGetListingsByUserId } from '@/service/listings/hook';
import { useGetPublicUserProfile } from '@/service/user/hook';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ListingCard from '@/components/listingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Package, Wrench, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { id } = useParams();
    const userId = id as string;

    const { data: user, isLoading: isUserLoading } = useGetPublicUserProfile(userId);
    const { data: listings, isLoading: isListingsLoading } = useGetListingsByUserId({
        userId,
    });

    if (isUserLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="w-full md:w-1/3 h-64 rounded-xl" />
                    <Skeleton className="w-full md:w-2/3 h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">User not found</h1>
            </div>
        );
    }

    // Filter listings by type
    const products = listings?.filter((l) => l.listingType?.includes('product')) || [];
    const services = listings?.filter((l) => l.listingType?.includes('service')) || [];
    const otherListings = listings?.filter((l) =>
        !l.listingType?.includes('product') && !l.listingType?.includes('service')
    ) || [];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero / Header Section */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                                <AvatarImage src={user.profilePictureUrl || undefined} alt={user.name} />
                                <AvatarFallback className="text-4xl bg-gradient-to-br from-green-400 to-blue-500 text-white">
                                    {user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                    {user.role}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 mb-4">
                                {user.created_at && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {format(new Date(user.created_at), 'MMMM yyyy')}</span>
                                    </div>
                                )}
                                {user.email && (
                                    <div className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        <span>Verified Email</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar / Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-gray-900 border-b pb-2">Contact Info</h3>
                                {user.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-gray-600">{user.email}</span>
                                    </div>
                                )}
                                {user.phoneNumber && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-gray-600">{user.phoneNumber}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {user.socials && Object.values(user.socials).some(Boolean) && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">Social Profiles</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Render social links if they exist */}
                                        {/* This depends on the structure of user.socials */}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="w-full justify-start mb-6 bg-white border p-1 h-auto flex-wrap">
                                <TabsTrigger
                                    value="all"
                                    className="flex-1 min-w-[100px] data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                                >
                                    All Listings ({listings?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="products"
                                    className="flex-1 min-w-[100px] data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                    disabled={products.length === 0}
                                >
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Products ({products.length})
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="services"
                                    className="flex-1 min-w-[100px] data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                                    disabled={services.length === 0}
                                >
                                    <div className="flex items-center gap-2">
                                        <Wrench className="w-4 h-4" />
                                        Services ({services.length})
                                    </div>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-0">
                                {isListingsLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
                                        ))}
                                    </div>
                                ) : listings && listings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {listings.map((listing) => (
                                            <ListingCard key={listing.id} listing={listing} layout="grid" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                                        <p className="text-gray-500">No listings found for this user.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="products" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((listing) => (
                                        <ListingCard key={listing.id} listing={listing} layout="grid" />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="services" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.map((listing) => (
                                        <ListingCard key={listing.id} listing={listing} layout="grid" />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
