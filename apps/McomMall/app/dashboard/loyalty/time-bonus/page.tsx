'use client';

import * as React from 'react';
import { useState } from 'react';
import { Loader2, ArrowLeft, Clock, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAddOffer } from '@/service/offers/hook';
import { CreateOfferDto } from '@/service/offers/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Types
type ResetUnit = 'Hours' | 'Days' | 'Weeks' | 'Months';

interface TimeBonusFormState {
  isActive: boolean;
  name: string;
  description: string;
  bonusPoints: number;
  limitPerCustomer: number;
  allowLimitToReset: boolean;
  resetAfterValue: number;
  resetAfterUnit: ResetUnit;
}

export default function TimeBonusPage() {
  const router = useRouter();
  const { mutateAsync: addOffer, isPending } = useAddOffer();

  const [formState, setFormState] = useState<TimeBonusFormState>({
    isActive: true,
    name: 'Daily Check-in Bonus',
    description: 'Come back every day to earn 50 free points!',
    bonusPoints: 50,
    limitPerCustomer: 1,
    allowLimitToReset: true,
    resetAfterValue: 24,
    resetAfterUnit: 'Hours',
  });

  const handleFormChange = <K extends keyof TimeBonusFormState>(
    field: K,
    value: TimeBonusFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        const offerDto: CreateOfferDto = {
            name: formState.name,
            description: formState.description,
            points: 0, // Always 0 cost for a "Bonus" claim
            rewardCouponType: 'BONUS_POINTS',
            offerScope: 'ALL_LISTINGS',
            bonusPoints: formState.bonusPoints,
            limitPerCustomer: formState.limitPerCustomer,
            allowLimitToReset: formState.allowLimitToReset,
            // Note: Specific reset timing (value/unit) is handled by 'allowLimitToReset' flag in current backend version
        };

        await addOffer(offerDto);
        toast.success('Time Bonus Reward created successfully!');
        router.push('/dashboard/loyalty/offers');
    } catch (error) {
        console.error(error);
        toast.error('Failed to create time bonus. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Bonus</h1>
          <p className="text-muted-foreground">Create a recurring free points reward to encourage frequent visits.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Configuration
            </CardTitle>
            <CardDescription>
              Set up the details for your time-based reward.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
              <Checkbox
                id="isActive"
                checked={formState.isActive}
                onCheckedChange={checked => handleFormChange('isActive', !!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Active Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this bonus immediately available to customers.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Reward Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder="e.g. Daily Bonus"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={e => handleFormChange('description', e.target.value)}
                placeholder="Explain how often customers can claim this."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bonusPoints" className="text-orange-600 font-semibold flex items-center gap-1">
                  <Gift className="h-3 w-3" /> Points to Award
                </Label>
                <Input
                  id="bonusPoints"
                  type="number"
                  min="1"
                  value={formState.bonusPoints}
                  onChange={e => handleFormChange('bonusPoints', Number(e.target.value))}
                  className="font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limitPerCustomer">Claims per Cycle</Label>
                <Input
                  id="limitPerCustomer"
                  type="number"
                  min="1"
                  value={formState.limitPerCustomer}
                  onChange={e => handleFormChange('limitPerCustomer', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowLimitToReset"
                  checked={formState.allowLimitToReset}
                  onCheckedChange={checked => handleFormChange('allowLimitToReset', !!checked)}
                />
                <Label htmlFor="allowLimitToReset">Recurring Reward (Reset Limit)</Label>
              </div>

              {formState.allowLimitToReset && (
                <div className="grid grid-cols-3 gap-4 pl-6 border-l-2 border-orange-100">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="resetAfterValue">Reset Every</Label>
                    <Input
                      id="resetAfterValue"
                      type="number"
                      min="1"
                      value={formState.resetAfterValue}
                      onChange={e => handleFormChange('resetAfterValue', Number(e.target.value))}
                      disabled // Backend limitation visual feedback
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Select
                      value={formState.resetAfterUnit}
                      disabled // Backend limitation visual feedback
                    >
                      <SelectTrigger className="bg-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hours">Hours</SelectItem>
                        <SelectItem value="Days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="col-span-3 text-xs text-muted-foreground italic">
                    * Exact timing customization will be enabled in a future update. Currently resets daily.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 min-w-[140px]" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Bonus
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}