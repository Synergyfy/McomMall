'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, Users, Briefcase } from 'lucide-react';
import { Service } from '@/service/services/types';
import { toast } from 'sonner';

interface ServiceBookingWidgetProps {
  service: Service;
}

export default function ServiceBookingWidget({ service }: ServiceBookingWidgetProps) {
  // State for addons selection
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  // State for quantity/guests depending on model
  const [quantity, setQuantity] = useState<number>(1); // For perUnit or perHour
  const [guests, setGuests] = useState<number>(service.minGuests || 1);

  // Base Price Calculation
  const basePrice = useMemo(() => {
    switch (service.pricingModel) {
      case 'fixed':
        return parseFloat(service.fixedPrice || '0');
      case 'perHour':
        return parseFloat(service.pricePerHour || '0') * quantity;
      case 'perUnit':
        return parseFloat(service.pricePerUnit || '0') * quantity;
      default:
        return 0;
    }
  }, [service, quantity]);

  // Guest Pricing Calculation (simplified)
  const guestPrice = useMemo(() => {
      if (!service.enableGuestPricing) return 0;
      // This is a simplified logic, real logic would handle 'perGuest', 'fixedGroup', etc.
      if (service.guestPricingModel === 'perGuest') {
          return parseFloat(service.pricePerGuest || '0') * guests;
      }
      return 0;
  }, [service, guests]);

  // Addons Price Calculation
  const addonsPrice = useMemo(() => {
      let total = 0;
      service.configurableAddons?.forEach(addon => {
          if (selectedAddons[addon.id]) {
              total += parseFloat(addon.price || '0');
          }
      });
      return total;
  }, [service, selectedAddons]);

  const bookingFee = parseFloat(service.bookingFee || '0');
  const totalPrice = basePrice + guestPrice + addonsPrice + bookingFee;

  const handleAddonToggle = (addonId: string, checked: boolean) => {
      setSelectedAddons(prev => ({ ...prev, [addonId]: checked }));
  };

  const handleBookNow = () => {
      // In a real app, this would add to cart with all booking details
      // For now, we mimic the ProductPage 'Add to Cart' / 'Buy Now' visual
      toast.success("Booking initiated! (Feature in progress)");
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

        {/* Header: Price */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">{service.name}</h1>
            <p className="text-gray-500 mt-1 hidden lg:block">Service</p>

            <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600">
                    £{totalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                    {service.pricingModel === 'perHour' ? '/ hour' :
                     service.pricingModel === 'perUnit' ? `/ ${service.unitName || 'unit'}` :
                     ' total'}
                </span>
            </div>
            {bookingFee > 0 && <p className="text-xs text-gray-400 mt-1">+ £{bookingFee.toFixed(2)} booking fee</p>}
        </div>

        {/* Configuration Inputs */}
        <div className="space-y-6 border-t border-gray-100 pt-6 mb-6">

            {/* Quantity / Hours Input */}
            {service.pricingModel === 'perHour' && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Hours</Label>
                    <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                </div>
            )}

            {service.pricingModel === 'perUnit' && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Number of {service.unitName || 'Units'}</Label>
                    <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                </div>
            )}

            {/* Guests Input */}
            {service.enableGuestPricing && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Users className="w-4 h-4" /> Guests</Label>
                    <Input
                        type="number"
                        min={service.minGuests || 1}
                        max={service.maxGuests || 100}
                        value={guests}
                        onChange={(e) => setGuests(Math.max(service.minGuests || 1, parseInt(e.target.value) || 1))}
                    />
                </div>
            )}

            {/* Addons */}
            {service.configurableAddons && service.configurableAddons.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-sm font-semibold uppercase text-gray-700 tracking-wide">Add-ons</Label>
                    {service.configurableAddons.map(addon => (
                        <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleAddonToggle(addon.id, !selectedAddons[addon.id])}>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`addon-${addon.id}`}
                                    checked={selectedAddons[addon.id] || false}
                                    onCheckedChange={(c) => handleAddonToggle(addon.id, c as boolean)}
                                />
                                <Label htmlFor={`addon-${addon.id}`} className="cursor-pointer font-medium">{addon.name}</Label>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">+£{parseFloat(addon.price || '0').toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
            <Button
                size="lg"
                className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200"
                onClick={handleBookNow}
            >
                Book Now
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="w-full py-6 text-lg border-2 border-orange-100 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
            >
                Contact Provider
            </Button>
        </div>

    </div>
  );
}
