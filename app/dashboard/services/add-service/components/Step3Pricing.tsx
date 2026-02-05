'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Users, ListPlus, Trash2, PlusCircle, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Step3Pricing() {
  const { control, watch } = useFormContext();
  const pricingModel = watch('pricingModel');
  const enableGuestPricing = watch('enableGuestPricing');

  const { fields: addonFields, append: appendAddon, remove: removeAddon } = useFieldArray({
    control,
    name: 'configurableAddons',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Pricing Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Pricing Strategy
          </CardTitle>
          <CardDescription>Determine how customers will be charged for your service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="pricingModel"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-2">
                  <FormLabel className="text-base font-semibold">
                    Pricing Model <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Choose the billing structure that best fits your service.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="py-6">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="perHour">Per Hour</SelectItem>
                    <SelectItem value="perUnit">Per Unit</SelectItem>
                    <SelectItem value="perJob">Per Job</SelectItem>
                    <SelectItem value="perDistance">Per Distance</SelectItem>
                    <SelectItem value="perSession">Per Session</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {['fixed', 'perJob', 'perSession', 'subscription'].includes(pricingModel) && (
            <FormField
              control={control}
              name="fixedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Base Price <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" placeholder="0.00" {...field} className="py-6 pl-8" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {pricingModel === 'perHour' && (
            <FormField
              control={control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Hourly Rate <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" placeholder="0.00" {...field} className="py-6 pl-8" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {pricingModel === 'perUnit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Price per Unit <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" placeholder="0.00" {...field} className="py-6 pl-8" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="unitName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Unit Name <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Session, Item" {...field} className="py-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Dynamic Pricing Rules */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base">Dynamic Pricing Rules</h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Adjust prices based on special timing or conditions.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="pricingRules.weekendMultiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Weekend Multiplier <span className="text-muted-foreground">(1.0 = standard)</span></FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} className="h-10" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="pricingRules.nightSurcharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Night Surcharge <span className="text-muted-foreground">($ - Optional)</span></FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-10" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="pricingRules.holidaySurcharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Holiday Surcharge <span className="text-muted-foreground">($ - Optional)</span></FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-10" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Guest Pricing <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
          <CardDescription>Adjust the total price based on the number of attendees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="enableGuestPricing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5 border-primary/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Enable Guest Pricing</FormLabel>
                  <FormDescription>Charge more or less depending on the group size.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {enableGuestPricing && (
            <div className="space-y-6 p-4 bg-slate-50 rounded-lg border animate-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="minGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Min Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-9" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Max Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-9" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="guestPricingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Guest Pricing Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="perGuest">Per Guest</SelectItem>
                        <SelectItem value="fixedGroup">Fixed Group</SelectItem>
                        <SelectItem value="baseWithAdditional">Base + Additional</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Addons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-primary" />
            Configurable Add-ons <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
          <CardDescription>Upsell extra services or items during booking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addonFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-center bg-muted/20 p-2 rounded-md">
              <FormField
                control={control}
                name={`configurableAddons.${index}.name`}
                render={({ field }) => (
                  <FormControl>
                    <Input placeholder="Add-on Name" {...field} className="h-9" />
                  </FormControl>
                )}
              />
              <FormField
                control={control}
                name={`configurableAddons.${index}.price`}
                render={({ field }) => (
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                    <FormControl>
                      <Input type="number" placeholder="0" className="w-24 h-9 pl-5" {...field} />
                    </FormControl>
                  </div>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeAddon(index)} className="hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendAddon({ name: '', price: 0, pricingType: 'oneTime' })}
            className="w-full py-6 border-dashed"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Add-on
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
