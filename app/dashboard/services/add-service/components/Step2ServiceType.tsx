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
import { MapPin, ListPlus, Briefcase, Trash2, PlusCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function Step2ServiceType() {
  const { control, watch, setValue } = useFormContext();
  const deliveryMode = watch('deliveryConfig.mode');
  const enableTieredPackages = watch('enableTieredPackages');

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Delivery Mode & Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Service Type & Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="deliveryConfig.mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="onsite">On-site (Customer Location)</SelectItem>
                    <SelectItem value="atShop">At Shop/Office</SelectItem>
                    <SelectItem value="remote">Remote/Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(deliveryMode === 'onsite' || deliveryMode === 'hybrid') && (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <h4 className="font-medium text-sm">Service Area Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="deliveryConfig.cities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cities (Comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. London, Manchester" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="deliveryConfig.regions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regions (Comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Greater London" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="deliveryConfig.travelFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Fee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Set travel radius in the Availability section.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-primary" />
            Service Variants
          </CardTitle>
          <CardDescription>
            Time-based (e.g. 1hr, 2hr) or Resource-based (e.g. 1 Tech, 2 Techs).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variantFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col md:flex-row gap-4 items-end border p-3 rounded-md"
            >
              <FormField
                control={control}
                name={`variants.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel className="text-xs">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2 Hours" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`variants.${index}.type`}
                render={({ field }) => (
                  <FormItem className="w-full md:w-32">
                    <FormLabel className="text-xs">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="resource">Resource</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`variants.${index}.price`}
                render={({ field }) => (
                  <FormItem className="w-full md:w-28">
                    <FormLabel className="text-xs">Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(index)}
                className="mb-0.5"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendVariant({ name: '', type: 'time', price: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
          </Button>
        </CardContent>
      </Card>

      {/* Tiered Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Packages
          </CardTitle>
          <CardDescription>Does this service have packages/options?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="enableTieredPackages"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-orange-50/30">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-orange-900">Enable Package Tiers</FormLabel>
                  <FormDescription>
                    Show customers a comparison of different service levels.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {enableTieredPackages && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Basic', 'Standard', 'Premium'].map((tierName, idx) => (
                <Card key={tierName} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{tierName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={control}
                      name={`tiers.${idx}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`tiers.${idx}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brief Pitch</FormLabel>
                          <FormControl>
                            <Input placeholder="Great for..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label className="text-xs">Included Features (CSV)</Label>
                      <Input
                        placeholder="Feature A, Feature B..."
                        defaultValue={watch(`tiers.${idx}.features`)?.join(', ')}
                        onChange={(e) => {
                          const features = e.target.value
                            .split(',')
                            .map((f) => f.trim())
                            .filter(Boolean);
                          setValue(`tiers.${idx}.features`, features);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
