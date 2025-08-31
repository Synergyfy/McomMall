'use client';

import * as React from 'react';
import { useState } from 'react';
import { Award, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// TypeScript Types
type CouponType =
  | 'Fixed cart discount'
  | 'Percentage discount'
  | 'Free product(s)'
  | 'Bonus points';

type ResetUnit = 'Hours' | 'Days' | 'Weeks' | 'Months';

// Form state type
interface BonusPointsFormState {
  isOfferActive: boolean;
  name: string;
  description: string;
  points: number;
  couponType: CouponType;
  bonusPoints: number;
  limitPerCustomer: number;
  allowLimitToReset: boolean;
  resetAfterValue: number;
  resetAfterUnit: ResetUnit;
}

// Main Component
export default function BonusPointsOfferPage() {
  const [formState, setFormState] = useState<BonusPointsFormState>({
    isOfferActive: true,
    name: '500 Bonus Points',
    description: 'Every 4 hours',
    points: 0, // Points to redeem, seems to be 0 for this type of offer
    couponType: 'Bonus points',
    bonusPoints: 500,
    limitPerCustomer: 1,
    allowLimitToReset: true,
    resetAfterValue: 4,
    resetAfterUnit: 'Hours',
  });

  const handleFormChange = <K extends keyof BonusPointsFormState>(
    field: K,
    value: BonusPointsFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle form submission here (e.g., API call)
    console.log('Form Submitted:', formState);
    alert('Offer details submitted! Check the console for the data.');
  };

  return (
    <TooltipProvider>
      <div className="bg-gray-50 min-h-screen">
        <main className="w-full max-w-4xl mx-auto p-4 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Left Column: Form Fields */}
              <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isOfferActive"
                    checked={formState.isOfferActive}
                    onCheckedChange={checked =>
                      handleFormChange('isOfferActive', !!checked)
                    }
                  />
                  <Label htmlFor="isOfferActive">Offer is active</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{"Toggle the offer's visibility and availability."}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>A brief summary of the offer.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="description"
                    value={formState.description}
                    onChange={e =>
                      handleFormChange('description', e.target.value)
                    }
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="points">Points</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Points required for a customer to claim this offer.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="points"
                    type="number"
                    value={formState.points}
                    onChange={e =>
                      handleFormChange('points', Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="md:col-span-1">
                <div className="sticky top-8 rounded-lg border bg-white p-6 text-center shadow-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Award className="h-10 w-10 text-orange-600" />
                    <h3 className="text-xl font-bold">
                      {formState.name || 'Offer Name'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {formState.description || 'Offer Description'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                  >
                    {formState.points > 0
                      ? `Claim for ${formState.points.toLocaleString()}`
                      : 'Claim for free'}
                  </Button>
                  <p className="mt-4 text-xs text-gray-400 italic">
                    This is only a preview. The site Theme might override the
                    styles.
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Coupon Type Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
              <h3 className="text-lg font-semibold">Reward coupon type</h3>
              <RadioGroup
                value={formState.couponType}
                onValueChange={(value: CouponType) =>
                  handleFormChange('couponType', value)
                }
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  'Fixed cart discount',
                  'Percentage discount',
                  'Free product(s)',
                  'Bonus points',
                ].map(type => (
                  <div key={type}>
                    <RadioGroupItem
                      value={type}
                      id={type}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type}
                      className="flex flex-col text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-600 [&:has([data-state=checked])]:border-orange-600 h-full"
                    >
                      {type}
                      <span className="text-sm font-normal text-muted-foreground mt-2">
                        {type === 'Fixed cart discount' &&
                          'Apply a fixed total discount to the entire cart.'}
                        {type === 'Percentage discount' &&
                          'Apply a percentage discount to the entire cart.'}
                        {type === 'Free product(s)' &&
                          'Offer one or more products for free.'}
                        {type === 'Bonus points' &&
                          "Adds points to the customer's account."}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Bonus Points Specific Fields */}
              <AnimatePresence>
                {formState.couponType === 'Bonus points' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-6 border-t overflow-hidden"
                  >
                    <div>
                      <Label htmlFor="bonusPoints">Bonus points</Label>
                      <Input
                        id="bonusPoints"
                        type="number"
                        value={formState.bonusPoints}
                        onChange={e =>
                          handleFormChange(
                            'bonusPoints',
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="limitPerCustomer">
                          Limit per customer
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              How many times a single customer can claim this
                              offer.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="limitPerCustomer"
                        type="number"
                        value={formState.limitPerCustomer}
                        onChange={e =>
                          handleFormChange(
                            'limitPerCustomer',
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowLimitToReset"
                        checked={formState.allowLimitToReset}
                        onCheckedChange={checked =>
                          handleFormChange('allowLimitToReset', !!checked)
                        }
                      />
                      <Label htmlFor="allowLimitToReset">
                        Allow limit to reset
                      </Label>
                    </div>

                    {formState.allowLimitToReset && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-end gap-2"
                      >
                        <div className="flex-grow">
                          <Label htmlFor="resetAfterValue">Reset after</Label>
                          <Input
                            id="resetAfterValue"
                            type="number"
                            value={formState.resetAfterValue}
                            onChange={e =>
                              handleFormChange(
                                'resetAfterValue',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <Select
                            value={formState.resetAfterUnit}
                            onValueChange={(value: ResetUnit) =>
                              handleFormChange('resetAfterUnit', value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Hours">Hours</SelectItem>
                              <SelectItem value="Days">Days</SelectItem>
                              <SelectItem value="Weeks">Weeks</SelectItem>
                              <SelectItem value="Months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Save Offer
              </Button>
            </div>
          </form>
        </main>
      </div>
    </TooltipProvider>
  );
}

// Dummy AnimatePresence and motion for structure, replace with framer-motion
const AnimatePresence = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
type MotionProps = {
  children: React.ReactNode;
  className?: string;
  initial?: Record<string, number | string>;
  animate?: Record<string, number | string>;
  exit?: Record<string, number | string>;
  transition?: Record<string, number>;
};

const motion = {
  div: ({ children, ...props }: MotionProps) => (
    <div {...props}>{children}</div>
  ),
};
