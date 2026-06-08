'use client';

import React, { useState, useEffect } from 'react';
import { useGetUserListings, useEditListing } from '@/service/listings/hook';
import { useGetMyProducts } from '@/service/store/products/hook';
import { useGetMyServices } from '@/service/services/hook';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Palette,
  Image as ImageIcon,
  Star,
  RefreshCw,
  Trophy,
  Loader2,
  ChevronRight,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemePicker } from './components/ThemePicker';
import { BannerManager } from './components/BannerManager';
import { FeaturedItemsSelector } from './components/FeaturedItemsSelector';
import { RotatorControls } from './components/RotatorControls';
import { GamificationControls } from './components/GamificationControls';
import { StorefrontPreviewPanel } from './components/StorefrontPreviewPanel';

export default function StorefrontAppearancePage() {
  const router = useRouter();

  // Fetch listing data
  const { data: listingsData, isLoading: isLoadingListing } = useGetUserListings(1, 1);
  const listing = listingsData?.data?.[0];

  // Fetch products & services
  const { data: products = [], isLoading: isLoadingProducts } = useGetMyProducts();
  const { data: services = [], isLoading: isLoadingServices } = useGetMyServices();

  const { mutateAsync: editListing, isPending: isSaving } = useEditListing();

  // State variables for appearance
  const [activeTab, setActiveTab] = useState<'theme' | 'banners' | 'featured' | 'rotator' | 'games'>('theme');
  const [theme, setTheme] = useState<'light' | 'dark' | 'brand'>('light');
  const [brandColor, setBrandColor] = useState('#ea580c');
  const [bannerUrl, setBannerUrl] = useState('');
  const [promoBannerUrl, setPromoBannerUrl] = useState('');
  const [enableSeasonal, setEnableSeasonal] = useState(false);
  const [seasonalStartDate, setSeasonalStartDate] = useState('');
  const [seasonalEndDate, setSeasonalEndDate] = useState('');
  const [seasonalBannerUrl, setSeasonalBannerUrl] = useState('');
  const [rotatorProducts, setRotatorProducts] = useState(false);
  const [rotatorServices, setRotatorServices] = useState(false);
  const [boroughCampaign, setBoroughCampaign] = useState(false);
  const [spinWheelEnabled, setSpinWheelEnabled] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [groupCircleEnabled, setGroupCircleEnabled] = useState(false);

  // Sync with listing cover and localStorage configuration on load
  useEffect(() => {
    if (listing) {
      setBannerUrl(listing.bannerUrl || '');

      // Load other visual configuration from localStorage
      const localConfig = localStorage.getItem(`storefront_appearance_${listing.id}`);
      if (localConfig) {
        try {
          const config = JSON.parse(localConfig);
          if (config.theme) setTheme(config.theme);
          if (config.brandColor) setBrandColor(config.brandColor);
          if (config.promoBannerUrl) setPromoBannerUrl(config.promoBannerUrl);
          if (config.enableSeasonal !== undefined) setEnableSeasonal(config.enableSeasonal);
          if (config.seasonalStartDate) setSeasonalStartDate(config.seasonalStartDate);
          if (config.seasonalEndDate) setSeasonalEndDate(config.seasonalEndDate);
          if (config.seasonalBannerUrl) setSeasonalBannerUrl(config.seasonalBannerUrl);
          if (config.rotatorProducts !== undefined) setRotatorProducts(config.rotatorProducts);
          if (config.rotatorServices !== undefined) setRotatorServices(config.rotatorServices);
          if (config.boroughCampaign !== undefined) setBoroughCampaign(config.boroughCampaign);
          if (config.spinWheelEnabled !== undefined) setSpinWheelEnabled(config.spinWheelEnabled);
          if (config.showPrizes !== undefined) setShowPrizes(config.showPrizes);
          if (config.groupCircleEnabled !== undefined) setGroupCircleEnabled(config.groupCircleEnabled);
        } catch (e) {
          console.error('Failed to parse storefront appearance local storage settings', e);
        }
      }
    }
  }, [listing]);

  if (isLoadingListing || isLoadingProducts || isLoadingServices) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 shadow-md border-orange-200">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold">No Storefront Found</h2>
            <p className="text-gray-500">Create a business profile first to customize appearance.</p>
            <Button className="w-full bg-orange-600" onClick={() => router.push('/dashboard/add-listing')}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      // 1. Save main banner to backend listing entity
      await editListing({
        listingId: listing.id,
        payload: {
          ...listing,
          bannerUrl: bannerUrl,
        } as any,
      });

      // 2. Persist other styling & config variables to localStorage
      const config = {
        theme,
        brandColor,
        promoBannerUrl,
        enableSeasonal,
        seasonalStartDate,
        seasonalEndDate,
        seasonalBannerUrl,
        rotatorProducts,
        rotatorServices,
        boroughCampaign,
        spinWheelEnabled,
        showPrizes,
        groupCircleEnabled,
      };
      localStorage.setItem(`storefront_appearance_${listing.id}`, JSON.stringify(config));

      toast.success('Appearance settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/storefront')}
            className="text-gray-500 hover:text-gray-900 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Storefront</span>
              <ChevronRight className="w-3 h-3" />
              <span>Appearance</span>
            </div>
            <h1 className="text-lg font-bold text-gray-950">Storefront Customize</h1>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 shadow-sm rounded-lg"
          id="appearance-save-btn"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </header>

      {/* Main split dashboard panel */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left side editor navigation and controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col md:flex-row h-full">
            {/* Tab navigation list */}
            <div className="md:w-56 border-r border-gray-150 bg-gray-50/50 flex flex-row md:flex-col p-2 gap-1 overflow-x-auto shrink-0 md:overflow-x-visible">
              {[
                { id: 'theme', label: 'Theme Styling', icon: <Palette className="w-4 h-4" /> },
                { id: 'banners', label: 'Store Banners', icon: <ImageIcon className="w-4 h-4" /> },
                { id: 'featured', label: 'Featured Items', icon: <Star className="w-4 h-4" /> },
                { id: 'rotator', label: 'Discover Feeds', icon: <RefreshCw className="w-4 h-4" /> },
                { id: 'games', label: 'Gamification', icon: <Trophy className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-700 font-bold'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content window */}
            <div className="flex-grow p-6">
              {activeTab === 'theme' && (
                <ThemePicker
                  theme={theme}
                  setTheme={setTheme}
                  brandColor={brandColor}
                  setBrandColor={setBrandColor}
                />
              )}
              {activeTab === 'banners' && (
                <BannerManager
                  bannerUrl={bannerUrl}
                  setBannerUrl={setBannerUrl}
                  promoBannerUrl={promoBannerUrl}
                  setPromoBannerUrl={setPromoBannerUrl}
                  enableSeasonal={enableSeasonal}
                  setEnableSeasonal={setEnableSeasonal}
                  seasonalStartDate={seasonalStartDate}
                  setSeasonalStartDate={setSeasonalStartDate}
                  seasonalEndDate={seasonalEndDate}
                  setSeasonalEndDate={setSeasonalEndDate}
                  seasonalBannerUrl={seasonalBannerUrl}
                  setSeasonalBannerUrl={setSeasonalBannerUrl}
                />
              )}
              {activeTab === 'featured' && (
                <FeaturedItemsSelector products={products} services={services} />
              )}
              {activeTab === 'rotator' && (
                <RotatorControls
                  rotatorProducts={rotatorProducts}
                  setRotatorProducts={setRotatorProducts}
                  rotatorServices={rotatorServices}
                  setRotatorServices={setRotatorServices}
                  boroughCampaign={boroughCampaign}
                  setBoroughCampaign={setBoroughCampaign}
                />
              )}
              {activeTab === 'games' && (
                <GamificationControls
                  spinWheelEnabled={spinWheelEnabled}
                  setSpinWheelEnabled={setSpinWheelEnabled}
                  showPrizes={showPrizes}
                  setShowPrizes={setShowPrizes}
                  groupCircleEnabled={groupCircleEnabled}
                  setGroupCircleEnabled={setGroupCircleEnabled}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right side live simulator */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <Card className="rounded-2xl border border-gray-200/60 shadow-sm bg-white overflow-hidden p-6">
            <StorefrontPreviewPanel
              businessName={listing.businessName}
              logoUrl={listing.logoUrl || ''}
              bannerUrl={bannerUrl}
              shortDescription={listing.shortDescription}
              theme={theme}
              brandColor={brandColor}
              featuredProducts={products.filter((p) => p.isFeatured)}
              featuredServices={services.filter((s) => s.isFeatured)}
              spinWheelEnabled={spinWheelEnabled}
              groupCircleEnabled={groupCircleEnabled}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}
