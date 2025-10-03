'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMyAcceptedPartners } from '@/service/partnerships/hooks';
import { IUser } from '@/service/user/types';
import { Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PartnerCardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
                <CardHeader className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
            </Card>
        ))}
    </div>
);

const PartnerCard = ({ partner }: { partner: IUser }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-col items-center text-center p-6">
            <Avatar className="w-20 h-20 mb-4 border-4 border-white shadow-md">
                <AvatarImage src={partner.profilePictureUrl} alt={partner.name} />
                <AvatarFallback className="bg-gray-100 text-gray-500">
                    {partner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl font-bold text-gray-800">{partner.name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">{partner.role === 'owner' ? 'Business Owner' : 'User'}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 text-sm text-gray-600 space-y-3">
            <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${partner.email}`} className="hover:text-red-500">{partner.email}</a>
            </div>
            {/* You can add more details here if available from the API */}
        </CardContent>
    </Card>
);


export default function MyPartnersPage() {
    const { partners, isLoading, isError } = useMyAcceptedPartners();

    const renderContent = () => {
        if (isLoading) {
            return <PartnerCardSkeleton />;
        }
        if (isError) {
            return <div className="text-center text-red-500 py-12">Failed to load your partners.</div>;
        }
        if (!partners || partners.length === 0) {
            return <div className="text-center text-gray-500 py-12">You don&apos;t have any accepted partners yet.</div>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map(partner => (
                    <PartnerCard key={partner.id} partner={partner} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Partners</h1>
                    <p className="text-md text-gray-500 mt-1">
                        A list of all your accepted business partners.
                    </p>
                </div>
                {renderContent()}
            </div>
        </div>
    );
}