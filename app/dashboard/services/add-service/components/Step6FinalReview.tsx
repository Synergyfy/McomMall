'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { UserListing } from '@/service/listings/types';
import { useGetUserListings } from '@/service/listings/hook';

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
          <CardDescription>Select which business this service belongs to.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="businessId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business <span className="text-red-500">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingListings}
                >
                  <FormControl>
                    <SelectTrigger className="py-6">
                      <SelectValue
                        placeholder={isLoadingListings ? 'Loading...' : 'Select Business'}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businesses.map((b: UserListing) => (
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
            Media & Images
          </CardTitle>
          <CardDescription>Upload up to 5 high-quality images of your service.</CardDescription>
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
          <CardDescription>Please review your service details before publishing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Service Name:</span>
              <p className="font-medium">{formValues.name || 'Not set'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Pricing Model:</span>
              <p className="font-medium capitalize">{formValues.pricingModel}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Delivery Mode:</span>
              <p className="font-medium capitalize">{formValues.deliveryConfig?.mode}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Business:</span>
              <p className="font-medium">
                {businesses.find((b: any) => b.id === formValues.businessId)?.businessName ||
                  'Not selected'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
