'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, Image as ImageIcon, CheckCircle2, HelpCircle } from 'lucide-react';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { UserListing } from '@/service/listings/types';
import { useGetUserListings } from '@/service/listings/hook';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Step6FinalReview() {
  const { control, watch } = useFormContext();
  const { data: listings, isLoading: isLoadingListings } = useGetUserListings();
  const businesses =
    listings?.data?.filter((l: UserListing) => l.listingType.includes('service')) || [];

  const formValues = watch();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Business Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5 text-primary" />
            Business Selection
          </CardTitle>
          <CardDescription>Assign this service to one of your verified businesses.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="businessId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-2">
                  <FormLabel className="text-base font-semibold">
                    Business <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select which business will offer this service.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingListings}
                >
                  <FormControl>
                    <SelectTrigger className="py-6">
                      <SelectValue
                        placeholder={isLoadingListings ? 'Loading businesses...' : 'Select Business'}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businesses.filter((b: UserListing) => b.id && b.id.trim() !== '').map((b: UserListing) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="w-5 h-5 text-primary" />
            Media & Images <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Upload up to 5 high-quality images to showcase your service.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="media"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MultiMediaUpload onMediaChange={field.onChange} />
                </FormControl>
                <FormDescription>At least one image is required. Max file size: 5MB.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Summary Review */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Final Review
          </CardTitle>
          <CardDescription>Review the core details before publishing your service.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1 p-3 bg-white rounded-md border shadow-sm">
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Service Name</span>
              <p className="font-semibold text-base">{formValues.name || 'Not set'}</p>
            </div>
            <div className="space-y-1 p-3 bg-white rounded-md border shadow-sm">
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Pricing Model</span>
              <p className="font-semibold text-base capitalize">{formValues.pricingModel}</p>
            </div>
            <div className="space-y-1 p-3 bg-white rounded-md border shadow-sm">
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Delivery Mode</span>
              <p className="font-semibold text-base capitalize">{formValues.deliveryConfig?.mode}</p>
            </div>
            <div className="space-y-1 p-3 bg-white rounded-md border shadow-sm">
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Target Audience</span>
              <p className="font-semibold text-base">{formValues.targetAudience || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
