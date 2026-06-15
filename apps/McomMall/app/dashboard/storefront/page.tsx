'use client';

import type { FC } from 'react';
import { useGetUserListings } from '@/service/listings/hook';
import { useGetMyProducts } from '@/service/store/products/hook';
import { useGetServicesByBusiness } from '@/service/services/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Building2,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Eye,
  Store,
  Compass,
  Palette,
  ShieldCheck,
  Percent,
  Plus,
  Rocket,
  QrCode,
  Package,
  Sparkles,
  Ticket,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const StorefrontHubPage: FC = () => {
  const router = useRouter();
  
  // Fetch owner listings (limit 1)
  const { data: listingsData, isLoading: isLoadingListing } = useGetUserListings(1, 1);
  const listing = listingsData?.data?.[0];

  // Fetch products & services to compute completion checklist
  const { data: products = [] } = useGetMyProducts();
  
  // Quick check: if we have a listing, determine if we have services
  const hasProducts = products.length > 0;
  const hasServices = false; // Add real service logic or keep false until services loaded

  const isLoading = isLoadingListing;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 shadow-md border-orange-200">
          <CardHeader className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-2">
              <Store size={36} />
            </div>
            <CardTitle className="text-2xl font-bold">No Storefront Found</CardTitle>
            <CardDescription>
              Create a business profile first to activate your Storefront Hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => router.push('/dashboard/add-listing')}
            >
              Add Business Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Visibility Score calculation ---
  const checklistItems = [
    { label: 'Logo uploaded', done: !!listing.logoUrl },
    { label: 'Cover image uploaded', done: !!listing.bannerUrl },
    { label: 'Business description written', done: !!listing.shortDescription || !!listing.about },
    { label: 'Opening hours set', done: true }, // Simple default
    { label: 'At least 1 product listed', done: hasProducts },
    { label: 'Verified Listing', done: listing.isVerified || listing.isGoogleVerified },
  ];

  const completedCount = checklistItems.filter(item => item.done).length;
  const visibilityScore = Math.round((completedCount / checklistItems.length) * 100);

  const getStatusConfig = (status: string) => {
    const norm = (status || '').toLowerCase();
    switch (norm) {
      case 'published':
        return { label: 'Published', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' };
      case 'draft':
        return { label: 'Draft (Pending Approval)', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' };
      case 'archived':
        return { label: 'Archived', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' };
      default:
        return { label: 'Active', className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-700/30' };
    }
  };
  const statusCfg = getStatusConfig(listing.status);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Premium Compact Header */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-orange-500/15 border-none text-white">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner shrink-0 mt-0.5 sm:mt-0">
            <Store size={22} className="text-white" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
              Storefront Hub
            </h1>
            <p className="text-[11px] sm:text-sm text-orange-50 font-medium leading-relaxed opacity-95">
              Manage your business storefront, themes, and platform promotions.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Identity Card + Setup Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Identity & Status */}
        <Card className="lg:col-span-2 shadow-sm border border-gray-200/60 overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Logo */}
              <div className="w-24 h-24 rounded-2xl border border-gray-100 flex-shrink-0 bg-gray-50 overflow-hidden shadow-inner flex items-center justify-center">
                {listing.logoUrl ? (
                  <img src={listing.logoUrl} alt={listing.businessName} className="object-cover w-full h-full" />
                ) : (
                  <Building2 size={40} className="text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-grow text-center sm:text-left space-y-3">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-950">{listing.businessName}</h2>
                  {listing.isVerified && (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified
                    </Badge>
                  )}
                  {listing.isGoogleVerified && (
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50">
                      Google Connected
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-500 max-w-lg">
                  {listing.shortDescription || 'No description provided. Head to your profile to write one.'}
                </p>

                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
                  <Badge variant="outline" className={`font-bold py-1 px-3 ${statusCfg.className}`}>
                    Status: {statusCfg.label}
                  </Badge>
                  <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50/50 dark:bg-[#291e15] dark:text-orange-400 dark:border-orange-950/40 font-bold py-1 px-3">
                    Category: {listing.category?.name || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Score & Checklist */}
        <Card className="shadow-sm border border-gray-200/60 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">Visibility Score</CardTitle>
              <span className="text-2xl font-black text-orange-600">{visibilityScore}%</span>
            </div>
            <Progress value={visibilityScore} className="h-2 bg-gray-100" />
          </CardHeader>
          <CardContent className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Storefront Checklist</h4>
            <ul className="space-y-2 text-sm">
              {checklistItems.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between text-gray-600">
                  <span className={item.done ? 'line-through text-gray-400' : ''}>{item.label}</span>
                  {item.done ? (
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <PlusCircle
                      size={16}
                      className="text-gray-300 hover:text-orange-500 cursor-pointer flex-shrink-0"
                      onClick={() => router.push('/dashboard/storefront/profile')}
                    />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Add Product',
            desc: 'List physical or digital items',
            icon: <Package className="w-5 h-5" />,
            badgeBg: 'bg-orange-50 text-orange-600 dark:bg-[#3d2414] dark:text-orange-400',
            route: '/dashboard/store/products/add-product',
          },
          {
            title: 'Add Service',
            desc: 'Configure bookings & offerings',
            icon: <Sparkles className="w-5 h-5" />,
            badgeBg: 'bg-indigo-50 text-indigo-600 dark:bg-[#1a1b35] dark:text-indigo-400',
            route: '/dashboard/services/add-service',
          },
          {
            title: 'Create Voucher',
            desc: 'Set up promo codes & discounts',
            icon: <Ticket className="w-5 h-5" />,
            badgeBg: 'bg-emerald-50 text-emerald-600 dark:bg-[#122e1e] dark:text-emerald-400',
            route: '/dashboard/vouchers',
          },
          {
            title: 'Boost Storefront',
            desc: 'Grow search visibility & reach',
            icon: <Zap className="w-5 h-5" />,
            badgeBg: 'bg-violet-50 text-violet-600 dark:bg-[#261638] dark:text-violet-400',
            route: '/dashboard/my-subscription',
          },
        ].map((action, idx) => (
          <button
            key={idx}
            onClick={() => router.push(action.route)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#2d241b] border border-gray-200/60 dark:border-[#4a3b2e] hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all duration-300 text-left group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${action.badgeBg}`}>
              {action.icon}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-bold text-gray-950 dark:text-white line-clamp-1">{action.title}</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium line-clamp-1">{action.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Dashboard Sub-pages Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Business Profile',
            desc: 'Edit name, description, address, social handles, and opening hours.',
            icon: <Building2 className="text-orange-600" />,
            route: '/dashboard/storefront/profile',
          },
          {
            title: 'Storefront Appearance',
            desc: 'Customize theme colors, storefront cover banner, and layout.',
            icon: <Palette className="text-orange-600" />,
            route: '/dashboard/storefront/appearance',
          },
          {
            title: 'Verification Status',
            desc: 'Manage company registration documents and Google Business connection.',
            icon: <ShieldCheck className="text-orange-600" />,
            route: '/dashboard/storefront/verification',
          },
          {
            title: 'Live Preview',
            desc: 'View your live public storefront page as customers see it.',
            icon: <Eye className="text-orange-600" />,
            route: `/business/${listing.id}`,
            external: true,
          },
        ].map((section, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow duration-250 flex flex-col justify-between border-gray-200/60 bg-white">
            <CardHeader className="pb-3 flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                {section.icon}
              </div>
              <CardTitle className="text-base font-bold text-gray-900">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
              <p className="text-sm text-gray-500 leading-relaxed">{section.desc}</p>
              <Button
                variant="outline"
                className="w-full mt-auto border-orange-200 hover:bg-orange-50/50 hover:text-orange-700 text-orange-600 font-semibold"
                onClick={() => {
                  if (section.external) {
                    window.open(section.route, '_blank');
                  } else {
                    router.push(section.route);
                  }
                }}
              >
                {section.title === 'Live Preview' ? 'View Live Store' : 'Manage Section'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StorefrontHubPage;
