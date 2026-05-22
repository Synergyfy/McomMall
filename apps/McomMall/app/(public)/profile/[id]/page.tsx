'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetUserById } from '@/service/user/hook';
import { User, ChevronLeft, Mail, Twitter, Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

const socialIcons = {
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    instagram: Instagram,
    youtube: Youtube,
};

export default function PublicProfilePage() {
    const { id } = useParams();
    const userId = id as string;

    const { data: user, isLoading, isError } = useGetUserById(userId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
                        <p className="text-gray-600 mb-6">
                            The profile you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href="/marketplace">
                            <Button className="bg-orange-600 hover:bg-orange-700">
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Marketplace
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    const hasSocials = user.socials && Object.values(user.socials).some(url => url);

    return (
        <div className="min-h-screen bg-gray-50 pb-12 pt-3">
            {/* Navigation */}
            <div className="bg-white border-b shadow-sm mb-6">
                <div className="container mx-auto px-4 h-14 flex items-center">
                    <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Marketplace
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header with gradient background */}
                    <div className="relative w-full h-32 bg-gradient-to-r from-orange-500 to-red-500"></div>

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Profile Picture */}
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex-shrink-0 -mt-20 md:-mt-24">
                                {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt={displayName} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 mt-4 md:mt-0">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {displayName}
                                </h1>

                                {user.email && (
                                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                )}

                                {/* Role Badge */}
                                {user.role && (
                                    <div className="inline-block">
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        {hasSocials && (
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Connect</h2>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(user.socials).map(([platform, url]) => {
                                        if (!url) return null;
                                        const Icon = socialIcons[platform as keyof typeof socialIcons];
                                        if (!Icon) return null;

                                        return (
                                            <a
                                                key={platform}
                                                href={url as string}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-sm font-medium capitalize">{platform}</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.phoneNumber && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                        <p className="text-gray-900 font-medium">{user.phoneNumber}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Account Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        <p className="text-gray-900 font-medium">{user.isActive ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
