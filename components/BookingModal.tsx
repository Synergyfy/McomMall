'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Service } from '@/service/services/types';
import { useCreateBooking } from '@/service/bookings/hook';
import { useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({
  service,
  isOpen,
  onClose,
}: BookingModalProps) {
  const createBooking = useCreateBooking();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleSubmit = () => {
    if (!service || !date || !startTime || !endTime) {
      toast.error('Please fill all fields');
      return;
    }

    const startDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

    createBooking.mutate({
      serviceId: service.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      addonIds: selectedAddons,
    });
  };

  const getPriceDisplay = (service: Service) => {
    switch (service.pricingModel.toUpperCase()) {
      case 'FIXED':
        return `£${service.fixedPrice}`;
      case 'HOURLY':
        return `£${service.pricePerHour}/hour`;
      case 'PER_UNIT':
        return `£${service.pricePerUnit}/${service.unitName}`;
      default:
        return 'Price not available';
    }
  };

  if (!service) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Book {service.name}</DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Price: {getPriceDisplay(service)}</p>

          {service.bundledServices.length > 0 && (
            <div>
              <h4 className="font-semibold">Bundled Services</h4>
              <ul className="list-disc list-inside">
                {service.bundledServices.map(bundled => (
                  <li key={bundled.id}>{bundled.name}</li>
                ))}
              </ul>
            </div>
          )}

          {service.configurableAddons.length > 0 && (
            <div>
              <h4 className="font-semibold">Add-ons</h4>
              {service.configurableAddons.map(addon => (
                <div key={addon.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={addon.id}
                    onCheckedChange={() => handleAddonToggle(addon.id)}
                  />
                  <label htmlFor={addon.id}>
                    {addon.name} (+£{addon.price})
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
            />
            <div className="grid gap-4">
              <Select onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="12:00">12:00</SelectItem>
                  <SelectItem value="13:00">13:00</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                  <SelectItem value="17:00">17:00</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="12:00">12:00</SelectItem>
                  <SelectItem value="13:00">13:00</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                  <SelectItem value="17:00">17:00</SelectItem>
                  <SelectItem value="18:00">18:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          onClick={handleSubmit}
          disabled={createBooking.isPending}
        >
          {createBooking.isPending ? 'Submitting...' : 'Submit Booking'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
