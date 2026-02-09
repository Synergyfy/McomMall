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
import { MapPin, ListPlus, Briefcase, Trash2, PlusCircle, HelpCircle, Store } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetUserListings } from '@/service/listings/hook';
import { cn } from '@/lib/utils';

export function Step2ServiceType() {
  const form = useFormContext();
  const { control, watch, setValue, trigger } = form;
  const deliveryMode = watch('deliveryConfig.mode');
  const businessId = watch('businessId');
  const enableTieredPackages = watch('enableTieredPackages');

  const { data: listings } = useGetUserListings(1, 100);
  const selectedBusiness = React.useMemo(() => {
    return listings?.data?.find((l: any) => l.id === businessId);
  }, [listings, businessId]);

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
          <CardDescription>Define where and how you provide this service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="deliveryConfig.mode"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-2">
                  <FormLabel className="text-base font-semibold">
                    Delivery Mode <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select how you deliver this service (e.g. at your shop or customer's location).
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
                      form.formState.errors.deliveryConfig && (form.formState.errors.deliveryConfig as any).mode && "border-destructive ring-destructive focus:ring-destructive"
                    )}>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="onsite">On-site (Customer Location)</SelectItem>
                    <SelectItem value="atShop">At Shop/Office</SelectItem>
                    <SelectItem value="remote">Remote/Online</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {deliveryMode === 'atShop' && selectedBusiness && (
            <div className="p-4 border rounded-lg bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Business Location</h4>
                  <p className="text-xs text-muted-foreground">The address for this service as per your business listing.</p>
                </div>
              </div>
              <div className="space-y-1 pl-10 text-sm">
                <p className="font-medium">{selectedBusiness.businessName}</p>
                <p className="text-muted-foreground">
                  {selectedBusiness.location?.addressLine1}
                  {selectedBusiness.location?.addressLine2 && `, ${selectedBusiness.location.addressLine2}`}
                </p>
                <p className="text-muted-foreground">
                  {selectedBusiness.location?.city}
                </p>
                <p className="text-primary font-semibold mt-1">
                  Postcode: {selectedBusiness.location?.postcode}
                </p>
              </div>
            </div>
          )}

          {(deliveryMode === 'onsite') && (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">Service Area Configuration</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Specify the geographic limits for your on-site service.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="deliveryConfig.cities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Cities <span className="text-muted-foreground">(Optional)</span></FormLabel>
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
                      <FormLabel className="text-xs">Regions <span className="text-muted-foreground">(Optional)</span></FormLabel>
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
                      <FormLabel className="text-xs">Travel Fee <span className="text-muted-foreground">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-primary" />
            Service Variants <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
          <CardDescription>
            Add different versions of your service (e.g. 1 hour vs 2 hours).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variantFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col md:flex-row gap-4 items-end border p-3 rounded-md bg-muted/20"
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
                className="mb-0.5 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendVariant({ name: '', type: 'time', price: 0 })}
            className="w-full py-6 border-dashed"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Variant
          </Button>
        </CardContent>
      </Card>

      {/* Tiered Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Packages <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
          <CardDescription>Offer bundled service levels (Basic, Standard, Premium).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="enableTieredPackages"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5 border-primary/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Enable Package Tiers</FormLabel>
                  <FormDescription>
                    Present your service in different levels for customers to compare.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {enableTieredPackages && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
              {['Basic', 'Standard', 'Premium'].map((tierName, idx) => (
                <Card key={tierName} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3 px-4">
                    <CardTitle className="text-lg">{tierName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4">
                    <FormField
                      control={control}
                      name={`tiers.${idx}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Price</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-9" />
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
                          <FormLabel className="text-xs">Short Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Great for..." {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label className="text-xs">Features <span className="text-muted-foreground text-[10px]">(Comma separated)</span></Label>
                      <Input
                        placeholder="Feature A, Feature B..."
                        className="h-9"
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
