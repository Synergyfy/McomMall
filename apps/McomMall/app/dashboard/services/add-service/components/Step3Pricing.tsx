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
import { PoundSterling, Users, ListPlus, Trash2, PlusCircle, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function Step3Pricing() {
  const form = useFormContext();
  const { control, watch, trigger } = form;
  const pricingModel = watch('pricingModel');
  const enableGuestPricing = watch('enableGuestPricing');
  const guestPricingModel = watch('guestPricingModel');
  const isQuoteModel = watch('isQuoteModel');

  const { fields: addonFields, append: appendAddon, remove: removeAddon } = useFieldArray({
    control,
    name: 'configurableAddons',
  });

  const { fields: bundleFields, append: appendBundle, remove: removeBundle } = useFieldArray({
    control,
    name: 'bundledServices',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Pricing Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PoundSterling className="w-5 h-5 text-primary" />
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
                <Select 
                  onValueChange={(val) => {
                    field.onChange(val);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger type="button" className={cn(
                      "py-6 transition-all",
                      form.formState.errors.pricingModel && "border-destructive ring-destructive focus:ring-destructive"
                    )}>
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                      <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="py-6 pl-8" />
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                      <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="py-6 pl-8" />
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
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                                      <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="py-6 pl-8" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />              <FormField
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
                    <FormLabel className="text-xs">Night Surcharge <span className="text-muted-foreground">(£ - Optional)</span></FormLabel>
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
                    <FormLabel className="text-xs">Holiday Surcharge <span className="text-muted-foreground">(£ - Optional)</span></FormLabel>
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

      {/* Quote Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PoundSterling className="w-5 h-5 text-primary" />
            Quote Request <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
          <CardDescription>Switch from direct booking to a quote-based request system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="isQuoteModel"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5 border-primary/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Enable Quote Mode</FormLabel>
                  <FormDescription>Customers request a price estimate instead of booking instantly.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          {isQuoteModel && (
            <FormField
              control={control}
              name="bookingFee"
              render={({ field }) => (
                <FormItem className="animate-in slide-in-from-top-2">
                  <FormLabel className="text-sm font-medium">Initial Booking Fee <span className="text-muted-foreground text-xs font-normal">(Optional)</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                      <Input type="number" {...field} value={field.value ?? ''} className="py-6 pl-8" placeholder="0.00" />
                    </div>
                  </FormControl>
                  <FormDescription>A small fee charged at the time of the quote request.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-base font-semibold">Enable Guest Pricing</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Enable this if the service price changes based on how many people are attending.
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-xs font-semibold">Min Guests</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            The minimum number of people allowed for a single booking.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input type="number" {...field} className="h-9" />
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
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-xs font-semibold">Max Guests</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            The maximum capacity for a single booking.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input type="number" {...field} className="h-9" />
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
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-xs font-semibold">Guest Pricing Model</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Select how you want to calculate the price for different group sizes.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select 
                      onValueChange={(val) => {
                        field.onChange(val);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger type="button" className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="perGuest">Per Guest (Charge per person)</SelectItem>
                        <SelectItem value="fixedGroup">Fixed Group (One price for all)</SelectItem>
                        <SelectItem value="baseWithAdditional">Base + Additional (Base fee + extra per person)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Guest Pricing Fields */}
              <div className="pt-4 border-t border-slate-200">
                {guestPricingModel === 'perGuest' && (
                  <FormField
                    control={control}
                    name="pricePerGuest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-primary">Price Per Guest</FormLabel>
                        <FormDescription>The amount charged for every single attendee (e.g. £20 x 5 guests = £100).</FormDescription>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                            <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="h-11 pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {guestPricingModel === 'fixedGroup' && (
                  <FormField
                    control={control}
                    name="fixedGroupPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-primary">Fixed Group Price</FormLabel>
                        <FormDescription>One flat fee for the entire booking, regardless of how many guests attend (within your min/max limits).</FormDescription>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                            <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="h-11 pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {guestPricingModel === 'baseWithAdditional' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Base Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                                <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="h-10 pl-8" />
                              </div>
                            </FormControl>
                            <FormDescription className="text-[10px]">The starting price.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="baseGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Base Guests Included</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} value={field.value ?? ''} className="h-10" />
                            </FormControl>
                            <FormDescription className="text-[10px]">Number of people covered by base price.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={control}
                      name="additionalGuestPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-primary">Price Per Additional Guest</FormLabel>
                          <FormDescription>The extra cost for each person ABOVE the "Base Guests Included" limit.</FormDescription>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                              <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="h-11 pl-8" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Add-on Name" {...field} className="h-9" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`configurableAddons.${index}.price`}
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">£</span>
                      <FormControl>
                        <Input type="number" placeholder="0" className="w-24 h-9 pl-5" {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeAddon(index)} className="hover:text-destructive h-9 w-9">
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

      {/* Bundled Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Bundled Services <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
          <CardDescription>Included sub-services that come with this package.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bundleFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-center bg-muted/20 p-2 rounded-md">
              <FormField
                control={control}
                name={`bundledServices.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Service Name" {...field} className="h-9" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`bundledServices.${index}.price`}
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">£</span>
                      <FormControl>
                        <Input type="number" placeholder="0" className="w-24 h-9 pl-5" {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeBundle(index)} className="hover:text-destructive h-9 w-9">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendBundle({ name: '', price: 0 })}
            className="w-full py-6 border-dashed"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Bundled Service
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
