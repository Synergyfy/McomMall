'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, MapPin, Sparkles } from 'lucide-react';

interface RotatorControlsProps {
  rotatorProducts: boolean;
  setRotatorProducts: (val: boolean) => void;
  rotatorServices: boolean;
  setRotatorServices: (val: boolean) => void;
  boroughCampaign: boolean;
  setBoroughCampaign: (val: boolean) => void;
}

export const RotatorControls: React.FC<RotatorControlsProps> = ({
  rotatorProducts,
  setRotatorProducts,
  rotatorServices,
  setRotatorServices,
  boroughCampaign,
  setBoroughCampaign,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-orange-500" /> Rotator & Discovery Feed
        </h3>
        <p className="text-xs text-gray-500">Configure how and where your products and services are shown on platform feeds.</p>
      </div>

      <div className="space-y-4">
        {/* Rotator Products */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/30 transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <Label htmlFor="rotator-products-switch" className="font-semibold text-gray-950 text-sm leading-none cursor-pointer">
                Include Products in Local Mall Rotator
              </Label>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Pushes your products to the top-level discovery carousel on the Local Mall home feed.
              </p>
            </div>
          </div>
          <Switch
            id="rotator-products-switch"
            checked={rotatorProducts}
            onCheckedChange={setRotatorProducts}
          />
        </div>

        {/* Rotator Services */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/30 transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <Label htmlFor="rotator-services-switch" className="font-semibold text-gray-950 text-sm leading-none cursor-pointer">
                Include Services in Local Mall Rotator
              </Label>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Pushes your services to the discovery rotator carousel, increasing direct booking opportunities.
              </p>
            </div>
          </div>
          <Switch
            id="rotator-services-switch"
            checked={rotatorServices}
            onCheckedChange={setRotatorServices}
          />
        </div>

        {/* Borough Campaign */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/30 transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <Label htmlFor="borough-campaign-switch" className="font-semibold text-gray-950 text-sm leading-none cursor-pointer">
                Participate in Borough Campaigns
              </Label>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Allows your business to automatically participate in borough-wide discount events and seasonal promotions.
              </p>
            </div>
          </div>
          <Switch
            id="borough-campaign-switch"
            checked={boroughCampaign}
            onCheckedChange={setBoroughCampaign}
          />
        </div>
      </div>
    </div>
  );
};
