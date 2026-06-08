'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trophy, Compass, HelpCircle } from 'lucide-react';

interface GamificationControlsProps {
  spinWheelEnabled: boolean;
  setSpinWheelEnabled: (val: boolean) => void;
  showPrizes: boolean;
  setShowPrizes: (val: boolean) => void;
  groupCircleEnabled: boolean;
  setGroupCircleEnabled: (val: boolean) => void;
}

export const GamificationControls: React.FC<GamificationControlsProps> = ({
  spinWheelEnabled,
  setSpinWheelEnabled,
  showPrizes,
  setShowPrizes,
  groupCircleEnabled,
  setGroupCircleEnabled,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-500" /> Gamification & Rewards
        </h3>
        <p className="text-xs text-gray-500">Enable interactive games and group loyalty circles to keep customers engaged.</p>
      </div>

      <div className="space-y-4">
        {/* Spin Wheel */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/30 transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div>
              <Label htmlFor="spin-wheel-switch" className="font-semibold text-gray-950 text-sm leading-none cursor-pointer">
                Enable Spin Wheel Game
              </Label>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Add an interactive spin wheel to your storefront page. Customers can spin once daily for vouchers or points.
              </p>
            </div>
          </div>
          <Switch
            id="spin-wheel-switch"
            checked={spinWheelEnabled}
            onCheckedChange={setSpinWheelEnabled}
          />
        </div>

        {/* Show Prizes */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/30 transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div>
              <Label htmlFor="show-prizes-switch" className="font-semibold text-gray-950 text-sm leading-none cursor-pointer">
                Display Prize Pool
              </Label>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Publicly showcase the discount vouchers or rewards currently active in your spin wheel pool.
              </p>
            </div>
          </div>
          <Switch
            id="show-prizes-switch"
            checked={showPrizes}
            onCheckedChange={setShowPrizes}
          />
        </div>

        {/* Group Loyalty Circle */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/30 transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <Label htmlFor="group-circle-switch" className="font-semibold text-gray-950 text-sm leading-none cursor-pointer">
                Enable Group Circle Discounts
              </Label>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Allow customers to form group buying circles for your products, unlocking higher discount tiers collectively.
              </p>
            </div>
          </div>
          <Switch
            id="group-circle-switch"
            checked={groupCircleEnabled}
            onCheckedChange={setGroupCircleEnabled}
          />
        </div>
      </div>
    </div>
  );
};
