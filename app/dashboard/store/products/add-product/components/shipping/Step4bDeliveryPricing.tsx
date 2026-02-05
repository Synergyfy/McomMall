"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Truck, CheckCircle2, ChevronRight, ArrowLeft, ArrowRight, Navigation, Search, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useGetShippingAddresses } from '@/service/shipping/hook';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Dynamically import DeliveryMap to avoid SSR issues with Leaflet
const DeliveryMap = dynamic(() => import('./DeliveryMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-orange-50 animate-pulse rounded-xl mt-4 flex items-center justify-center text-orange-300 font-medium">Loading Map...</div>
});

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4bDeliveryPricing({ formData, updateFormData, onNext, onBack }: Props) {
  const { data: addressData } = useGetShippingAddresses(1, 100);
  const addresses = addressData?.data || [];

  const [isFree, setIsFree] = useState<boolean>(formData.isFreeDelivery !== undefined ? formData.isFreeDelivery : (formData.deliveryPricingType === 'free'));
  const [isPaid, setIsPaid] = useState<boolean>(formData.isPaidDelivery !== undefined ? formData.isPaidDelivery : (formData.deliveryPricingType === 'paid'));

  const defaultCenter: [number, number] = [51.505, -0.09]; // London as default

  const [selectedAddressId, setSelectedAddressId] = useState<string>(formData.deliveryOriginAddressId || '');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [newAddress, setNewAddress] = useState({
    addressLine1: formData.deliveryOriginAddressLine1 || '',
    city: formData.deliveryOriginCity || '',
    postalCode: formData.deliveryOriginPostalCode || ''
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

  // Initialize center based on selected address or form data
  useEffect(() => {
    if (formData.deliveryOriginLat && formData.deliveryOriginLng) {
      setMapCenter([parseFloat(formData.deliveryOriginLat), parseFloat(formData.deliveryOriginLng)]);
    }
  }, [formData.deliveryOriginLat, formData.deliveryOriginLng]);

  const handleGeocode = useCallback(async (query: string) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'McomMall/1.0 (contact@mcommall.com)'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name, address } = data[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);
        setMapCenter([newLat, newLon]);

        // Auto-fill address fields if searching for a new address
        if (isAddingNewAddress) {
          const city = address?.city || address?.town || address?.village || address?.suburb || '';
          const postcode = address?.postcode || '';
          const road = address?.road || '';
          const houseNumber = address?.house_number || '';
          const line1 = houseNumber ? `${houseNumber} ${road}` : road;

          setNewAddress({
            addressLine1: line1,
            city: city,
            postalCode: postcode
          });

          updateFormData({
            deliveryOriginAddressLine1: line1,
            deliveryOriginCity: city,
            deliveryOriginPostalCode: postcode,
            deliveryOriginLat: lat,
            deliveryOriginLng: lon
          });
        }
        toast.success(`Found: ${display_name.split(',').slice(0, 2).join(',')}`);
      } else {
        toast.error("Address not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      toast.error("Failed to search address. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [isAddingNewAddress, updateFormData]);

  const handleAddressSelect = (value: string) => {
    if (value === 'add-new') {
      setIsAddingNewAddress(true);
      setSelectedAddressId('');
      setAddressSearchQuery('');
    } else {
      setIsAddingNewAddress(false);
      setSelectedAddressId(value);
      const addr = addresses.find(a => a.id === value);
      if (addr) {
        updateFormData({
          deliveryOriginAddressId: addr.id,
          deliveryOriginAddressLine1: addr.addressLine1,
          deliveryOriginCity: addr.city,
          deliveryOriginPostalCode: addr.postalCode
        });
        // Geocode the existing address to update map
        handleGeocode(`${addr.addressLine1} ${addr.city} ${addr.postalCode}`);
      }
    }
  };

  // Auto-select first address if none is selected
  useEffect(() => {
    if (!selectedAddressId && !isAddingNewAddress && addresses.length > 0 && !formData.deliveryOriginAddressId) {
      handleAddressSelect(addresses[0].id);
    }
  }, [addresses, selectedAddressId, isAddingNewAddress, formData.deliveryOriginAddressId]);

  const toggleFree = () => {
    const nextValue = !isFree;
    setIsFree(nextValue);
    updateFormData({ isFreeDelivery: nextValue });
  };

  const togglePaid = () => {
    const nextValue = !isPaid;
    setIsPaid(nextValue);
    updateFormData({ isPaidDelivery: nextValue });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or non-negative numbers
    if (value === "" || parseFloat(value) >= 0) {
      updateFormData({ freeDeliveryRadius: value });
    }
  };

  const handleContinue = () => {
    if (!isFree && !isPaid) {
      toast.error("Please select at least one delivery option.");
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col max-w-[960px] mx-auto flex-1 px-4 md:px-10 animate-in fade-in duration-500">

      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 p-4">
        <span className="text-[#9c7349] dark:text-[#c4a687] text-sm font-medium hover:text-[#f48c25] transition-colors cursor-pointer">Products</span>
        <ChevronRight size={14} className="text-[#9c7349]" />
        <span className="text-[#9c7349] dark:text-[#c4a687] text-sm font-medium hover:text-[#f48c25] transition-colors cursor-pointer">Create New Product</span>
        <ChevronRight size={14} className="text-[#9c7349]" />
        <span className="text-[#1c140d] dark:text-white text-sm font-bold">Delivery Pricing</span>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-6 justify-between items-end">
          <p className="text-lg font-bold text-[#1c140d] dark:text-white">Product Creation Progress</p>
          <p className="text-sm font-bold text-[#1c140d] dark:text-white">Step 4b of 8</p>
        </div>
        <div className="rounded-full bg-[#e8dbce] dark:bg-[#3d2f25] overflow-hidden h-2.5">
          <div className="h-full rounded-full bg-[#f48c25] transition-all duration-500 shadow-[0_0_10px_rgba(244,140,37,0.4)]" style={{ width: '58%' }}></div>
        </div>
        <p className="text-[#9c7349] dark:text-[#c4a687] text-sm font-medium">Current: Delivery Pricing Strategy</p>
      </div>

      {/* Headline Text */}
      <div className="py-8 text-center">
        <h1 className="text-[#1c140d] dark:text-white tracking-tight text-3xl md:text-4xl font-black leading-tight px-4 mb-3">
          How would you like to handle delivery?
        </h1>
        <p className="text-[#9c7349] dark:text-[#c4a687] text-lg max-w-2xl mx-auto italic font-medium">
          Empower your business by defining exactly how your products reach your customers. Whether you&apos;re offering local warmth with Free Delivery or expanding your reach with flexible Paid Shipping, you&apos;re in full control of your growth strategy.
        </p>
      </div>

      {/* Dynamic Inputs Based on Selection */}
      <div className="flex flex-col gap-6 px-4 mb-10">
        {isFree && (
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-900/30 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <Navigation size={20} />
              </div>
              <h4 className="font-bold dark:text-white">Free Delivery Settings</h4>
            </div>

            <div className="flex flex-col gap-5">
              {/* Address Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#9c7349] uppercase flex items-center gap-1">
                  <MapPin size={12} /> Delivery Origin Address
                </label>
                <Select value={selectedAddressId || (isAddingNewAddress ? 'add-new' : '')} onValueChange={handleAddressSelect}>
                  <SelectTrigger className="w-full p-3 h-12 rounded-xl border-orange-200 dark:bg-[#1c140d] dark:text-white focus:border-orange-500 outline-none shadow-sm">
                    <SelectValue placeholder="Select from your addresses..." />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id}>
                        {addr.addressLine1}, {addr.city}, {addr.postalCode}
                      </SelectItem>
                    ))}
                    <SelectItem value="add-new" className="font-bold text-orange-600">
                      + Add New Business Address
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address Search (Visible when adding new or as a helper) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#9c7349] uppercase">Search by Town, City, Neighborhood or Postal Code</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                    <Input
                      placeholder="e.g. London, SW1A 1AA..."
                      className="pl-10 h-12 rounded-xl border-orange-200 dark:bg-[#1c140d] dark:text-white focus-visible:ring-orange-500 shadow-sm"
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGeocode(addressSearchQuery)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-orange-200 hover:bg-orange-100 text-orange-700 font-bold"
                    onClick={() => handleGeocode(addressSearchQuery)}
                    disabled={isSearching}
                  >
                    {isSearching ? 'Finding...' : 'Find'}
                  </Button>
                </div>
              </div>

              {isAddingNewAddress && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-dashed border-orange-300 dark:border-orange-900/30 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#9c7349] uppercase">Address Line 1</label>
                    <Input
                      placeholder="e.g. 123 Main St"
                      className="h-10 rounded-lg border-orange-100 dark:bg-[#1c140d] dark:text-white focus-visible:ring-orange-500 text-black"
                      value={newAddress.addressLine1}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewAddress(prev => ({ ...prev, addressLine1: val }));
                        updateFormData({ deliveryOriginAddressLine1: val });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#9c7349] uppercase">City</label>
                    <Input
                      placeholder="e.g. London"
                      className="h-10 rounded-lg border-orange-100 dark:bg-[#1c140d] dark:text-white focus-visible:ring-orange-500 text-black"
                      value={newAddress.city}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewAddress(prev => ({ ...prev, city: val }));
                        updateFormData({ deliveryOriginCity: val });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#9c7349] uppercase">Postcode</label>
                    <Input
                      placeholder="e.g. SW1A 1AA"
                      className="h-10 rounded-lg border-orange-100 dark:bg-[#1c140d] dark:text-white focus-visible:ring-orange-500 text-black"
                      value={newAddress.postalCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewAddress(prev => ({ ...prev, postalCode: val }));
                        updateFormData({ deliveryOriginPostalCode: val });
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#9c7349] uppercase flex items-center gap-1">
                   Free Delivery Radius (Miles)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 30"
                  className="w-full h-12 p-3 rounded-xl border border-orange-200 dark:bg-[#1c140d] dark:text-white focus-visible:ring-orange-500 outline-none shadow-sm"
                  value={formData.freeDeliveryRadius || ""}
                  onChange={handleRadiusChange}
                />
                <p className="text-[11px] text-[#9c7349] mt-1 italic font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-green-500" />
                  Customers within <span className="text-orange-600 font-bold">{formData.freeDeliveryRadius || 0} miles</span> will receive Free Delivery automatically.
                </p>

                {/* Map Visualization */}
                <DeliveryMap radiusMiles={parseFloat(formData.freeDeliveryRadius || '0')} center={mapCenter} />
              </div>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/30 animate-in slide-in-from-top-2 duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <Truck size={20} />
              </div>
              <h4 className="font-bold dark:text-white">Paid Delivery Configuration</h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              Standard delivery fees will apply to customers outside your free zone. Rates can be dynamically calculated based on distance or weight in the next steps.
            </p>
          </div>
        )}
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Free Delivery Card */}
        <div
          onClick={toggleFree}
          className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${isFree
              ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/10 shadow-xl shadow-[#f48c25]/10 scale-[1.02]'
              : 'border-[#e8dbce] dark:border-[#3d2f25] bg-white dark:bg-[#2d2116] hover:border-[#f48c25]/50 hover:shadow-lg'
            }`}
        >
          <div className={`size-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${isFree ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3d2f25] text-[#1c140d] dark:text-white'
            }`}>
            <Heart size={28} fill={isFree ? "currentColor" : "none"} />
          </div>

          <h3 className="text-2xl font-bold mb-3 text-[#1c140d] dark:text-white">Free Delivery</h3>
          <p className="text-[#9c7349] dark:text-[#c4a687] text-base leading-relaxed mb-6">
            Incentivize local shoppers by offering zero-cost shipping within your neighborhood. A proven way to increase conversion!
          </p>

          <div className={`mt-auto flex items-center gap-2 font-bold transition-all ${isFree ? 'text-[#f48c25] opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <span>Selected</span>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Paid Delivery Card */}
        <div
          onClick={togglePaid}
          className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${isPaid
              ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/10 shadow-xl shadow-[#f48c25]/10 scale-[1.02]'
              : 'border-[#e8dbce] dark:border-[#3d2f25] bg-white dark:bg-[#2d2116] hover:border-[#f48c25]/50 hover:shadow-lg'
            }`}
        >
          <div className={`size-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${isPaid ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3d2f25] text-[#1c140d] dark:text-white'
            }`}>
            <Truck size={28} />
          </div>

          <h3 className="text-2xl font-bold mb-3 text-[#1c140d] dark:text-white">Paid Delivery</h3>
          <p className="text-[#9c7349] dark:text-[#c4a687] text-base leading-relaxed mb-6">
            Expand your horizon. Charge a fair fee for deliveries beyond your local radius to cover fuel and time.
          </p>

          <div className={`mt-auto flex items-center gap-2 font-bold transition-all ${isPaid ? 'text-[#f48c25] opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <span>Selected</span>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>


      {/* Footer Actions */}
      <div className="flex items-center justify-between px-4 py-10 mt-8 border-t border-[#f4ede7] dark:border-[#3d2f25]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#e8dbce] dark:border-[#524438] font-bold text-[#1c140d] dark:text-white text-sm hover:bg-[#f4ede7] dark:hover:bg-[#3d2f25] transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#f48c25] text-white font-bold text-sm shadow-lg shadow-[#f48c25]/20 hover:bg-[#e07b1a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
