'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor, MapPin, Phone, Globe, Star, ShoppingBag, Trophy } from 'lucide-react';
import { Product } from '@/service/listings/types';
import { Service } from '@/service/services/types';

interface StorefrontPreviewPanelProps {
  businessName: string;
  logoUrl: string;
  bannerUrl: string;
  shortDescription: string;
  theme: 'light' | 'dark' | 'brand';
  brandColor: string;
  featuredProducts: Product[];
  featuredServices: Service[];
  spinWheelEnabled: boolean;
  groupCircleEnabled: boolean;
}

export const StorefrontPreviewPanel: React.FC<StorefrontPreviewPanelProps> = ({
  businessName = 'My Business',
  logoUrl,
  bannerUrl,
  shortDescription = 'Your catchy description will display here.',
  theme,
  brandColor,
  featuredProducts = [],
  featuredServices = [],
  spinWheelEnabled,
  groupCircleEnabled,
}) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Determine styles based on selected theme
  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        bg: 'bg-gray-900',
        text: 'text-white',
        textMuted: 'text-gray-400',
        border: 'border-gray-800',
        cardBg: 'bg-gray-800/80',
        accentBg: brandColor,
        accentText: '#ffffff',
      };
    }
    // For light & brand
    return {
      bg: 'bg-white',
      text: 'text-gray-900',
      textMuted: 'text-gray-500',
      border: 'border-gray-100',
      cardBg: 'bg-gray-50/50',
      accentBg: theme === 'brand' ? brandColor : '#ea580c', // orange-600 default
      accentText: '#ffffff',
    };
  };

  const styles = getThemeStyles();

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Live Preview</h3>
          <p className="text-[10px] text-gray-400">Updates instantly as you customize appearance settings.</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'desktop' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 bg-gray-100/50 border border-gray-200/40 rounded-2xl overflow-hidden min-h-[480px]">
        {viewMode === 'mobile' ? (
          /* MOBILE VIEW CONTAINER */
          <div className="w-[280px] h-[520px] rounded-[36px] border-[8px] border-gray-950 bg-white overflow-hidden shadow-2xl relative flex flex-col font-sans">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-950 rounded-b-xl z-20"></div>

            {/* Scrollable Content */}
            <div className={`flex-grow overflow-y-auto overflow-x-hidden ${styles.bg} ${styles.text} text-xs scrollbar-none`}>
              {/* Cover Image */}
              <div className="h-28 bg-gray-200 relative overflow-hidden flex-shrink-0">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
                )}
              </div>

              {/* Logo & Headline */}
              <div className="px-4 -mt-8 relative z-10 space-y-2 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-xl border-2 border-white bg-white overflow-hidden shadow-md flex items-center justify-center">
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-gray-400 text-base">{businessName.substring(0, 2)}</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm leading-tight">{businessName}</h4>
                  <p className={`${styles.textMuted} text-[10px] leading-relaxed line-clamp-2`}>{shortDescription}</p>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-gray-400">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>High Street Mall, Borough</span>
                </div>
              </div>

              {/* Spin Wheel Teaser */}
              {spinWheelEnabled && (
                <div className="m-3 p-2.5 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between text-orange-950 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-[10px]">Daily Spin & Win</p>
                      <p className="text-[9px] opacity-75">Spin for discounts!</p>
                    </div>
                  </div>
                  <button
                    style={{ backgroundColor: styles.accentBg, color: styles.accentText }}
                    className="px-2.5 py-1 rounded-lg font-bold text-[9px] shadow-sm shrink-0"
                  >
                    Play
                  </button>
                </div>
              )}

              {/* Featured Showcase */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px]">Featured Items</span>
                  <span className="text-[9px] text-orange-500 font-semibold">View All</span>
                </div>

                {featuredProducts.length === 0 && featuredServices.length === 0 ? (
                  <p className="text-[10px] text-gray-400 text-center py-4">No featured items selected.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Products */}
                    {featuredProducts.slice(0, 2).map((product) => {
                      const img = product.media?.[0] || product.images?.[0];
                      return (
                        <div key={product.id} className={`p-2 rounded-xl border ${styles.border} ${styles.cardBg} space-y-1.5`}>
                          <div className="h-16 rounded-lg bg-gray-200 overflow-hidden relative">
                            {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                            <div className="absolute top-1 right-1 bg-amber-500/90 text-white rounded-full p-0.5">
                              <Star className="w-2.5 h-2.5 fill-white text-white" />
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold truncate text-[9px]">{product.title}</p>
                            <p className="text-[9px] font-extrabold text-orange-600">£{(product.price || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {/* Services */}
                    {featuredServices.slice(0, 2).map((service) => {
                      const img = service.media?.[0] || service.images?.[0];
                      return (
                        <div key={service.id} className={`p-2 rounded-xl border ${styles.border} ${styles.cardBg} space-y-1.5`}>
                          <div className="h-16 rounded-lg bg-gray-200 overflow-hidden relative">
                            {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                            <div className="absolute top-1 right-1 bg-amber-500/90 text-white rounded-full p-0.5">
                              <Star className="w-2.5 h-2.5 fill-white text-white" />
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold truncate text-[9px]">{service.name}</p>
                            <p className="text-[9px] font-extrabold text-orange-600">
                              {service.pricingModel === 'fixed' ? `£${service.fixedPrice}` : 'Book now'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* DESKTOP VIEW CONTAINER (Mock storefront) */
          <div className="w-[450px] h-[340px] rounded-xl border border-gray-300 bg-white overflow-hidden shadow-2xl flex flex-col font-sans">
            {/* Browser Header */}
            <div className="h-7 bg-gray-100 border-b border-gray-200 px-3 flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="h-4 bg-white border border-gray-200/80 rounded px-2 text-[8px] text-gray-400 flex items-center w-52 truncate ml-4">
                mcom-mall.com/business/{businessName.toLowerCase().replace(/\s+/g, '-')}
              </div>
            </div>

            {/* Browser Content */}
            <div className={`flex-grow overflow-y-auto ${styles.bg} ${styles.text} text-xs scrollbar-none`}>
              {/* Banner */}
              <div className="h-20 bg-gray-200 relative overflow-hidden flex-shrink-0">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
                )}
              </div>

              <div className="p-4 flex gap-4 border-b border-gray-100">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl border-2 border-white bg-white overflow-hidden shadow-md flex items-center justify-center shrink-0 -mt-10 relative z-10">
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-gray-400 text-sm">{businessName.substring(0, 2)}</span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm leading-none">{businessName}</h4>
                  <p className={`${styles.textMuted} text-[10px] leading-relaxed line-clamp-2`}>{shortDescription}</p>
                </div>
              </div>

              {/* Showcase */}
              <div className="p-4 space-y-2">
                <span className="font-bold text-[10px]">Featured Showcase</span>
                {featuredProducts.length === 0 && featuredServices.length === 0 ? (
                  <p className="text-[9px] text-gray-400 py-2">No featured items selected.</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {featuredProducts.map((p) => {
                      const img = p.media?.[0] || p.images?.[0];
                      return (
                        <div key={p.id} className={`w-28 p-1.5 rounded-lg border ${styles.border} ${styles.cardBg} flex-shrink-0 space-y-1`}>
                          <div className="h-12 rounded bg-gray-200 overflow-hidden">
                            {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <p className="font-semibold text-[8px] truncate leading-tight">{p.title}</p>
                        </div>
                      );
                    })}
                    {featuredServices.map((s) => {
                      const img = s.media?.[0] || s.images?.[0];
                      return (
                        <div key={s.id} className={`w-28 p-1.5 rounded-lg border ${styles.border} ${styles.cardBg} flex-shrink-0 space-y-1`}>
                          <div className="h-12 rounded bg-gray-200 overflow-hidden">
                            {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <p className="font-semibold text-[8px] truncate leading-tight">{s.name}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
