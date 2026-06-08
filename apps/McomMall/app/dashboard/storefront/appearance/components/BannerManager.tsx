'use client';

import React, { useState } from 'react';
import { uploadFile } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Image as ImageIcon, Loader2, Calendar, Megaphone, Trash2 } from 'lucide-react';

interface BannerManagerProps {
  bannerUrl: string;
  setBannerUrl: (url: string) => void;
  promoBannerUrl: string;
  setPromoBannerUrl: (url: string) => void;
  enableSeasonal: boolean;
  setEnableSeasonal: (val: boolean) => void;
  seasonalStartDate: string;
  setSeasonalStartDate: (date: string) => void;
  seasonalEndDate: string;
  setSeasonalEndDate: (date: string) => void;
  seasonalBannerUrl: string;
  setSeasonalBannerUrl: (url: string) => void;
}

export const BannerManager: React.FC<BannerManagerProps> = ({
  bannerUrl,
  setBannerUrl,
  promoBannerUrl,
  setPromoBannerUrl,
  enableSeasonal,
  setEnableSeasonal,
  seasonalStartDate,
  setSeasonalStartDate,
  seasonalEndDate,
  setSeasonalEndDate,
  seasonalBannerUrl,
  setSeasonalBannerUrl,
}) => {
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  const [isUploadingSeasonal, setIsUploadingSeasonal] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'promo' | 'seasonal') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'main') setIsUploadingMain(true);
    if (type === 'promo') setIsUploadingPromo(true);
    if (type === 'seasonal') setIsUploadingSeasonal(true);

    try {
      const res = await uploadFile(file);
      if (type === 'main') setBannerUrl(res.secure_url);
      if (type === 'promo') setPromoBannerUrl(res.secure_url);
      if (type === 'seasonal') setSeasonalBannerUrl(res.secure_url);
      toast.success('Banner image uploaded successfully!');
    } catch {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingMain(false);
      setIsUploadingPromo(false);
      setIsUploadingSeasonal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Cover Banner */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-orange-500" /> Store Cover Banner
          </Label>
          <p className="text-xs text-gray-500">Wide banner displayed at the top of your public storefront profile (16:9 ratio recommended).</p>
        </div>

        {bannerUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[16/6] bg-gray-50 group">
            <img src={bannerUrl} alt="Store Cover Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" className="relative cursor-pointer">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'main')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setBannerUrl('')}>
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-[16/6] flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100/30 transition-all relative">
            {isUploadingMain ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                <span className="text-xs text-gray-500 font-medium">Uploading cover...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-gray-700">Upload cover banner</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG or WEBP up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'main')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Promo Banner */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <div>
          <Label className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-orange-500" /> Promo Banner
          </Label>
          <p className="text-xs text-gray-500">Show a promotional banner at the bottom or middle of your storefront page for announcements.</p>
        </div>

        {promoBannerUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[16/4] bg-gray-50 group">
            <img src={promoBannerUrl} alt="Promo Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" className="relative cursor-pointer">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'promo')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setPromoBannerUrl('')}>
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-[16/4] flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100/30 transition-all relative">
            {isUploadingPromo ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                <span className="text-xs text-gray-500 font-medium">Uploading banner...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-xs font-semibold text-gray-700">Upload promotion banner</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'promo')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Seasonal Banner */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" /> Seasonal Banner Schedule
            </Label>
            <p className="text-xs text-gray-500">Temporarily swap your main banner with a seasonal campaign banner (Christmas, Summer sale, etc.).</p>
          </div>
          <Switch checked={enableSeasonal} onCheckedChange={setEnableSeasonal} />
        </div>

        {enableSeasonal && (
          <div className="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="seasonal-start" className="text-xs font-semibold text-gray-700">Start Date</Label>
                <Input
                  type="date"
                  id="seasonal-start"
                  value={seasonalStartDate}
                  onChange={(e) => setSeasonalStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seasonal-end" className="text-xs font-semibold text-gray-700">End Date</Label>
                <Input
                  type="date"
                  id="seasonal-end"
                  value={seasonalEndDate}
                  onChange={(e) => setSeasonalEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Seasonal Cover Banner</Label>
              {seasonalBannerUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[16/6] bg-white group">
                  <img src={seasonalBannerUrl} alt="Seasonal Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" className="relative cursor-pointer">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e, 'seasonal')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setSeasonalBannerUrl('')}>
                      <Trash2 className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-[16/6] flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-100/30 transition-all relative">
                  {isUploadingSeasonal ? (
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-xs font-semibold text-gray-700">Upload seasonal banner</p>
                      <p className="text-[10px] text-gray-400">Replaces cover during selected date range</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'seasonal')}
                    disabled={isUploadingSeasonal}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
