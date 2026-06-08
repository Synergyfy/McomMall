'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  Clock,
  BadgePercent,
  Zap,
  Plus,
  X,
  CalendarDays,
} from 'lucide-react';
import { Service } from '@/service/services/types';
import api from '@/service/api';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface SpareCapacityModalProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}

export const SpareCapacityModal: React.FC<SpareCapacityModalProps> = ({
  service,
  open,
  onClose,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([
    { date: '', startTime: '', endTime: '' },
  ]);
  const [discountPercent, setDiscountPercent] = useState('20');
  const [headline, setHeadline] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSlot = () => {
    setSlots(prev => [...prev, { date: '', startTime: '', endTime: '' }]);
  };

  const handleRemoveSlot = (i: number) => {
    setSlots(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSlotChange = (i: number, field: keyof TimeSlot, value: string) => {
    setSlots(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const handlePublish = async () => {
    const filledSlots = slots.filter(s => s.date && s.startTime && s.endTime);
    if (filledSlots.length === 0) {
      toast.error('Add at least one complete time slot.');
      return;
    }
    const discount = parseFloat(discountPercent);
    if (isNaN(discount) || discount <= 0 || discount > 90) {
      toast.error('Discount must be between 1% and 90%.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/services/spare-capacity', {
        serviceId: service?.id,
        slots: filledSlots,
        discountPercent: discount,
        headline: headline || `${discount}% off — limited slots available!`,
        note,
      });

      toast.success('Spare capacity offer published to the Local Mall feed! 🎉');
      onClose();
      // Reset form
      setSlots([{ date: '', startTime: '', endTime: '' }]);
      setDiscountPercent('20');
      setHeadline('');
      setNote('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to publish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-teal-600" />
            </div>
            <DialogTitle className="text-lg font-bold">Spare Capacity Offer</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500">
            Got a quiet slot? Push a discounted offer for{' '}
            <span className="font-semibold text-gray-700">{service.name}</span> directly
            to the Local Mall feed and fill your schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* Discount */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 space-y-3">
            <div className="flex items-center gap-2">
              <BadgePercent className="w-4 h-4 text-teal-600" />
              <Label className="font-semibold text-gray-900">Discount</Label>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={90}
                value={discountPercent}
                onChange={e => setDiscountPercent(e.target.value)}
                className="w-28 text-center text-xl font-bold"
                id="spare-discount"
              />
              <span className="text-2xl font-bold text-gray-400">%</span>
              <span className="text-sm text-gray-500">off your regular price</span>
            </div>
          </div>

          {/* Time slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <Label className="font-semibold text-gray-900">Available Slots</Label>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSlot}
                className="h-8 text-xs gap-1"
              >
                <Plus className="w-3 h-3" /> Add Slot
              </Button>
            </div>

            <div className="space-y-2">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <input
                    type="date"
                    value={slot.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => handleSlotChange(i, 'date', e.target.value)}
                    className="col-span-4 w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <div className="col-span-4 flex gap-2 items-center">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={e => handleSlotChange(i, 'startTime', e.target.value)}
                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">to</span>
                    <div className="flex-1">
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={e => handleSlotChange(i, 'endTime', e.target.value)}
                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    {slots.length > 1 && (
                      <button
                        onClick={() => handleRemoveSlot(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        aria-label="Remove slot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <Label htmlFor="spare-headline" className="font-semibold text-gray-900 text-sm">
              Offer Headline <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="spare-headline"
              placeholder={`e.g. ${discountPercent}% off — limited slots this week!`}
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              maxLength={80}
            />
            <p className="text-xs text-gray-400">{headline.length}/80 characters</p>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="spare-note" className="font-semibold text-gray-900 text-sm">
              Note to customers <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="spare-note"
              placeholder="e.g. Last-minute cancellation freed up these slots — grab them before they're gone!"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              maxLength={200}
            />
          </div>

          {/* Info pill */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <Zap className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Your offer will appear in the <strong>Local Mall feed</strong> and the{' '}
              <strong>Borough discovery section</strong>. Customers can book directly from there.
              The offer auto-expires once all listed slots pass or are booked.
            </p>
          </div>

        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            onClick={handlePublish}
            disabled={isSubmitting}
            id="spare-capacity-publish-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Push to Feed
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
