'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, Users, Briefcase, Timer, Loader2 } from 'lucide-react';
import { Service, AvailabilityProfile } from '@/service/services/types';
import { toast } from 'sonner';
import BookingCalendar from './BookingCalendar';
import TimeSlotGenerator from './TimeSlotGenerator';
import { format } from 'date-fns';
import { useCreateBooking } from '@/service/bookings/hook';
import { useRouter } from 'next/navigation';
import BookingPaymentModal from '@/components/BookingPaymentModal';

interface ServiceBookingWidgetProps {
    service: Service;
}

// Default profile for services that don't have one yet but need booking
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
    // State for addons selection
    const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

    // State for quantity/guests depending on model
    const [quantity, setQuantity] = useState<number>(1); // For perUnit or perHour
    const [guests, setGuests] = useState<number>(service.minGuests || 1);

    // Booking State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
    const [lockExpiry, setLockExpiry] = useState<Date | null>(null);

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

    const { mutateAsync: createBooking, isPending } = useCreateBooking();

    // Determine if we should show booking calendar
    // Show if explicit availability exists OR if pricing model implies time/booking
    const showCalendar = !!service.availability || ['perHour', 'perUnit'].includes(service.pricingModel);
    const availabilityProfile = service.availability || DEFAULT_AVAILABILITY;

    // Simulate Slot Locking
    useEffect(() => {
        if (selectedDate && selectedTime) {
            // Lock for 15 minutes from now
            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 15);
            setLockExpiry(expiry);
            toast.success(`Slot ${selectedTime} selected. Proceed to book.`);
        } else {
            setLockExpiry(null);
        }
    }, [selectedDate, selectedTime]);

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

    const handleBookNow = async () => {
        if (showCalendar && (!selectedDate || !selectedTime)) {
            toast.error("Please select a date and time.");
            return;
        }

        try {
            // Parse start time and end time
            let start = new Date();
            let end = new Date();
            
            if (selectedDate && selectedTime) {
               const [hours, minutes] = selectedTime.split(':').map(Number);
               start = new Date(selectedDate);
               start.setHours(hours, minutes, 0, 0);
               
               end = new Date(start);
               const duration = service.duration || 60; // default 60 mins
               end.setMinutes(start.getMinutes() + duration);
            }

            const payload = {
                serviceId: service.id,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                numberOfGuests: guests,
                addonIds: Object.keys(selectedAddons).filter(id => selectedAddons[id])
            };

            const booking = await createBooking(payload);
            
            if (booking && booking.id) {
                setCreatedBookingId(booking.id);
                setPaymentModalOpen(true);
            }
        } catch (error) {
            // Error is handled by the hook via sonner toast
        }
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

                {/* Booking Calendar System */}
                {showCalendar && (
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold uppercase text-gray-700 tracking-wide">Select Date & Time</Label>
                        <BookingCalendar
                            availability={availabilityProfile}
                            selectedDate={selectedDate}
                            onDateSelect={(d) => { setSelectedDate(d); setSelectedTime(undefined); }}
                        />
                        {selectedDate && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <Label className="text-xs text-gray-500 mb-2 block">Available Slots</Label>
                                <TimeSlotGenerator
                                    availability={availabilityProfile}
                                    selectedDate={selectedDate}
                                    selectedSlot={selectedTime}
                                    onSlotSelect={setSelectedTime}
                                    serviceId={service.id}
                                />
                            </div>
                        )}
                        {lockExpiry && (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-md">
                                <Timer className="w-3 h-3" />
                                Slot held. Complete booking in 15 mins.
                            </div>
                        )}
                    </div>
                )}

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
                    disabled={isPending}
                    className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200"
                    onClick={handleBookNow}
                >
                    {isPending ? <Loader2 className="animate-spin" /> : (service.requireApproval ? 'Request Booking' : 'Book Now')}
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full py-6 text-lg border-2 border-orange-100 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                >
                    Contact Provider
                </Button>
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


