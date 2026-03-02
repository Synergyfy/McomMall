'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Users, 
    Briefcase, 
    Timer, 
    Loader2, 
    MapPin, 
    ShieldCheck, 
    Info,
    Package
} from 'lucide-react';
import { Service, AvailabilityProfile } from '@/service/services/types';
import { toast } from 'sonner';
import BookingCalendar from './BookingCalendar';
import TimeSlotGenerator from './TimeSlotGenerator';
import { differenceInMinutes, parse } from 'date-fns';
import { useCreateBooking, useCheckAvailability } from '@/service/bookings/hook';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import BookingPaymentModal from '@/components/BookingPaymentModal';

interface ServiceBookingWidgetProps {
    service: Service;
}

const DEFAULT_AVAILABILITY: AvailabilityProfile = {
    schedule: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => ({
        day: day as any,
        enabled: true,
        startTime: '09:00',
        endTime: '17:00'
    })),
    slotDuration: 60,
    bufferTime: 0,
    maxBookingsPerSlot: 1
};

export default function ServiceBookingWidget({ service }: ServiceBookingWidgetProps) {
    const router = useRouter();
    
    // Configuration State
    const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
    const [selectedTier, setSelectedTier] = useState<string | undefined>(undefined);
    const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
    const [quantity, setQuantity] = useState<number>(1);
    const [guests, setGuests] = useState<number>(service.minGuests || 1);

    // Booking State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);
    const [availabilityStatus, setAvailabilityStatus] = useState<{ isAvailable: boolean; reason?: string } | null>(null);

    const { mutateAsync: createBooking, isPending: isCreating } = useCreateBooking();
    const { mutateAsync: checkAvailability, isPending: isChecking } = useCheckAvailability();

    const showCalendar = !!service.availability || ['perHour', 'perUnit'].includes(service.pricingModel);
    const availabilityProfile = service.availability || DEFAULT_AVAILABILITY;

    // Derived Selection Data
    const activeVariant = useMemo(() => 
        service.variants?.find(v => v.id === selectedVariant), [service.variants, selectedVariant]);
    
    const activeTier = useMemo(() => 
        service.tiers?.find(t => t.id === selectedTier), [service.tiers, selectedTier]);

    // Metadata Display
    const meta = {
        duration: service.duration || availabilityProfile.slotDuration || 60,
        buffer: availabilityProfile.bufferTime || 0,
        maxBookings: availabilityProfile.maxBookingsPerSlot || 1,
        radius: availabilityProfile.serviceRadiusKm || 0,
        staff: availabilityProfile.staffPerBooking || 1
    };

    // Helper to format minutes into human readable duration
    const formatDuration = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        let result = '';
        if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''}`;
        if (mins > 0) result += `${hours > 0 ? ' ' : ''}${mins} minute${mins > 1 ? 's' : ''}`;
        return result || '0 minutes';
    };

    // Automatic availability check when time range changes
    useEffect(() => {
        const verifySlot = async () => {
            if (selectedDate && startTime && endTime) {
                const [sH, sM] = startTime.split(':').map(Number);
                const [eH, eM] = endTime.split(':').map(Number);
                
                const start = new Date(selectedDate);
                start.setHours(sH, sM, 0, 0);
                
                const end = new Date(selectedDate);
                end.setHours(eH, eM, 0, 0);

                if (start >= end) {
                    setAvailabilityStatus({ isAvailable: false, reason: 'End time must be after start time' });
                    return;
                }

                try {
                    const res = await checkAvailability({
                        serviceId: service.id,
                        startTime: start.toISOString(),
                        endTime: end.toISOString()
                    });
                    setAvailabilityStatus(res);
                } catch (e) {
                    setAvailabilityStatus({ isAvailable: false, reason: 'Failed to verify availability' });
                }
            } else {
                setAvailabilityStatus(null);
            }
        };

        const timeoutId = setTimeout(verifySlot, 500); // Debounce check
        return () => clearTimeout(timeoutId);
    }, [selectedDate, startTime, endTime, service.id, checkAvailability]);

    // Dynamic Price Calculation
    const pricingBreakdown = useMemo(() => {
        let base = 0;
        if (selectedTier && activeTier) base = parseFloat(activeTier.price);
        else if (selectedVariant && activeVariant) base = parseFloat(activeVariant.price);
        else {
            if (service.pricingModel === 'fixed') base = parseFloat(service.fixedPrice || '0');
            else if (service.pricingModel === 'perHour') base = parseFloat(service.pricePerHour || '0');
            else if (service.pricingModel === 'perUnit') base = parseFloat(service.pricePerUnit || '0');
        }

        let durationMins = 0;
        let units = 1;
        if (startTime && endTime) {
            const startMins = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
            const endMins = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
            durationMins = endMins - startMins;
            
            if (service.pricingModel === 'perHour') {
                units = Math.max(0, durationMins / 60);
            }
        }
        
        if (service.pricingModel === 'perUnit') {
            units = quantity;
        }

        const calculatedBase = base * units;

        let guestPrice = 0;
        if (service.enableGuestPricing) {
            if (service.guestPricingModel === 'perGuest') {
                guestPrice = parseFloat(service.pricePerGuest || '0') * guests;
            } else if (service.guestPricingModel === 'baseWithAdditional') {
                const extra = Math.max(0, guests - (service.baseGuests || 0));
                guestPrice = extra * parseFloat(service.additionalGuestPrice || '0');
            }
        }

        let addonsPrice = 0;
        service.configurableAddons?.forEach(addon => {
            if (selectedAddons[addon.id]) addonsPrice += parseFloat(addon.price || '0');
        });

        const fee = parseFloat(service.bookingFee || '0');
        const travelFee = (service.deliveryConfig?.mode === 'onsite' ? service.deliveryConfig?.travelFee : 0) || 0;
        const total = calculatedBase + guestPrice + addonsPrice + fee + travelFee;

        return { calculatedBase, guestPrice, addonsPrice, fee, total, units, durationMins };
    }, [service, selectedVariant, activeVariant, selectedTier, activeTier, selectedAddons, quantity, guests, startTime, endTime]);

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

    const handleBookNow = async () => {
        if (showCalendar && (!selectedDate || !startTime || !endTime)) {
            toast.error("Please select a date and valid time range.");
            return;
        }

        if (availabilityStatus && !availabilityStatus.isAvailable) {
            toast.error(availabilityStatus.reason || "Slot is not available.");
            return;
        }

        try {
            let start = new Date();
            let end = new Date();
            
            if (selectedDate && startTime && endTime) {
               const [sH, sM] = startTime.split(':').map(Number);
               const [eH, eM] = endTime.split(':').map(Number);
               start = new Date(selectedDate);
               start.setHours(sH, sM, 0, 0);
               end = new Date(selectedDate);
               end.setHours(eH, eM, 0, 0);
            }

            const payload = {
                serviceId: service.id,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                numberOfGuests: guests,
                quantity: quantity,
                variantId: selectedVariant,
                tierId: selectedTier,
                addonIds: Object.keys(selectedAddons).filter(id => selectedAddons[id])
            };

            const booking = await createBooking(payload);
            if (booking && booking.id) {
                setCreatedBookingId(booking.id);
                setPaymentModalOpen(true);
            }
        } catch (error) {}
    };

    return (
        <div className="bg-white rounded-2xl p-5 md:p-8 border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6 sticky top-24">
            
            {/* Price Display */}
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                        £{pricingBreakdown.total.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        {service.pricingModel === 'perHour' ? 'Total Est.' : 'Total'}
                    </span>
                </div>
                {pricingBreakdown.fee > 0 && (
                    <p className="text-xs text-slate-400 font-medium">Includes £{pricingBreakdown.fee.toFixed(2)} platform fee</p>
                )}
            </div>

            {/* Service Metadata Chips */}
            <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                    <Timer className="w-3.5 h-3.5" /> {meta.duration}m Duration
                </div>
                {meta.buffer > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 text-[11px] font-bold text-amber-700 uppercase">
                        <ShieldCheck className="w-3.5 h-3.5" /> {meta.buffer}m Buffer
                    </div>
                )}
                {meta.radius > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-[11px] font-bold text-blue-700 uppercase">
                        <MapPin className="w-3.5 h-3.5" /> {meta.radius}km Radius
                    </div>
                )}
            </div>

            <div className="h-px bg-slate-100" />

            {/* Selection Steps */}
            <div className="flex flex-col gap-8">
                
                {/* 1. Tiers / Packages */}
                {service.tiers && service.tiers.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Package className="w-4 h-4" /> Select Package
                        </Label>
                        <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="grid grid-cols-1 gap-2">
                            {service.tiers.map(tier => (
                                <Label key={tier.id} htmlFor={tier.id} className={cn(
                                    "flex flex-col gap-1 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50",
                                    selectedTier === tier.id ? "border-orange-500 bg-orange-50/30" : "border-slate-100"
                                )}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-900">{tier.name}</span>
                                        <RadioGroupItem value={tier.id} id={tier.id} className="sr-only" />
                                        <span className="font-black text-orange-600">£{parseFloat(tier.price).toFixed(2)}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 leading-relaxed">{tier.description}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                    </div>
                )}

                {/* 2. Variants */}
                {service.variants && service.variants.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Options</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {service.variants.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(selectedVariant === v.id ? undefined : v.id)}
                                    className={cn(
                                        "px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-left",
                                        selectedVariant === v.id ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-100 text-slate-600 hover:border-slate-200"
                                    )}
                                >
                                    {v.name}
                                    <div className="text-xs font-normal opacity-70">£{parseFloat(v.price).toFixed(2)}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Date & Time Range */}
                {showCalendar && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" /> Schedule Slot
                            </Label>
                            {isChecking && <Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
                        </div>
                        
                        <BookingCalendar
                            availability={availabilityProfile}
                            selectedDate={selectedDate}
                            onDateSelect={(d) => { setSelectedDate(d); setStartTime(undefined); setEndTime(undefined); }}
                        />
                        
                        {selectedDate && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Start Time</Label>
                                        <TimeSlotGenerator
                                            availability={availabilityProfile}
                                            selectedDate={selectedDate}
                                            selectedSlot={startTime}
                                            onSlotSelect={setStartTime}
                                            serviceId={service.id}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase">End Time</Label>
                                        <TimeSlotGenerator
                                            availability={availabilityProfile}
                                            selectedDate={selectedDate}
                                            selectedSlot={endTime}
                                            onSlotSelect={setEndTime}
                                            minTime={startTime}
                                            serviceId={service.id}
                                        />
                                    </div>
                                </div>
                                
                                {startTime && endTime && (
                                    <div className={cn(
                                        "flex flex-col gap-1 p-3 rounded-xl border transition-all",
                                        availabilityStatus?.isAvailable === false ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
                                    )}>
                                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                                            {availabilityStatus?.isAvailable === false ? (
                                                <><XCircle className="w-3.5 h-3.5 text-red-600" /> <span className="text-red-700">Not Available</span></>
                                            ) : (
                                                <><Info className="w-3.5 h-3.5 text-emerald-600" /> <span className="text-emerald-700">Slot Available</span></>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            availabilityStatus?.isAvailable === false ? "text-red-600" : "text-emerald-600"
                                        )}>
                                            {availabilityStatus?.isAvailable === false 
                                                ? availabilityStatus.reason 
                                                : `Booking for ${formatDuration(pricingBreakdown.durationMins)}`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Guests & Units */}
                <div className="grid grid-cols-2 gap-4">
                    {service.enableGuestPricing && (
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> Guests
                            </Label>
                            <Input
                                type="number"
                                min={service.minGuests || 1}
                                max={service.maxGuests || 100}
                                value={guests}
                                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                                className="bg-slate-50 border-none h-12 font-bold"
                            />
                        </div>
                    )}
                    {service.pricingModel === 'perUnit' && (
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> {service.unitName || 'Units'}
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="bg-slate-50 border-none h-12 font-bold"
                            />
                        </div>
                    )}
                </div>

                {/* 5. Add-ons */}
                {service.configurableAddons && service.configurableAddons.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Extra Add-ons</Label>
                        <div className="grid gap-2">
                            {service.configurableAddons.map(addon => (
                                <div 
                                    key={addon.id} 
                                    onClick={() => setSelectedAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer",
                                        selectedAddons[addon.id] ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox checked={selectedAddons[addon.id] || false} className="border-slate-300" />
                                        <span className="text-sm font-bold">{addon.name}</span>
                                    </div>
                                    <span className="text-xs font-black opacity-80">+£{parseFloat(addon.price).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 pt-4">
                <Button
                    size="lg"
                    disabled={isCreating || isChecking || (availabilityStatus?.isAvailable === false)}
                    className="w-full py-8 text-lg font-black bg-orange-600 hover:bg-orange-700 text-white rounded-2xl shadow-lg shadow-orange-200 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                    onClick={handleBookNow}
                >
                    {isCreating || isChecking ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                </Button>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                    Funds held in escrow until completion
                </p>
            </div>

            {/* Payment Modal */}
            {createdBookingId && (
                <BookingPaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        router.push('/dashboard/my-bookings');
                    }}
                    bookingId={createdBookingId}
                    onSuccess={() => {
                        toast.success('Payment successful! Your booking is confirmed.');
                        router.push('/dashboard/my-bookings');
                    }}
                />
            )}

        </div>
    );
}

import { XCircle } from 'lucide-react';
