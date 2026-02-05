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
import { DollarSign, Users, ListPlus, Trash2, PlusCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

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
          <CardDescription>Configure how you charge for this service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="pricingModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Model</FormLabel>
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
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} className="py-6" />
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
                  <FormLabel>Price Per Hour</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} className="py-6" />
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
                    <FormLabel>Price Per Unit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} className="py-6" />
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
                    <FormLabel>Unit Name</FormLabel>
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
            <h4 className="font-medium">Dynamic Pricing Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="pricingRules.weekendMultiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend Multiplier (1.0 = standard)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="pricingRules.nightSurcharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Night Surcharge ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="pricingRules.emergencySurcharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Surcharge ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="pricingRules.holidaySurcharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holiday Surcharge ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
            Guest Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="enableGuestPricing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Guest Pricing</FormLabel>
                  <FormDescription>Adjust price based on number of guests.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {enableGuestPricing && (
            <div className="space-y-6 p-4 bg-slate-50 rounded-lg border">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="minGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="guestPricingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Pricing Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
              {/* Note: In a full implementation, more fields for guest pricing would go here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Addons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-primary" />
            Configurable Add-ons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addonFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-center">
              <FormField
                control={control}
                name={`configurableAddons.${index}.name`}
                render={({ field }) => (
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                )}
              />
              <FormField
                control={control}
                name={`configurableAddons.${index}.price`}
                render={({ field }) => (
                  <FormControl>
                    <Input type="number" placeholder="Price" className="w-24" {...field} />
                  </FormControl>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeAddon(index)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendAddon({ name: '', price: 0, pricingType: 'oneTime' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Add-on
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
