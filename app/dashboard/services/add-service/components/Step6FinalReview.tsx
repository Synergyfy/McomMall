'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Store, Image as ImageIcon, CheckCircle2, HelpCircle, AlertCircle } from 'lucide-react';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { UserListing } from '@/service/listings/types';
import { useGetUserListings } from '@/service/listings/hook';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Step6FinalReview() {
  const router = useRouter();
  const { control, watch, setValue } = useFormContext();
  const { data: listings, isLoading: isLoadingListings } = useGetUserListings(1, 100);
  const [showNoBusinessDialog, setShowNoBusinessDialog] = React.useState(false);

  const businesses = React.useMemo(() => {
    if (!listings?.data) return [];
    return listings.data.filter((l: UserListing) =>
      l.id && l.id.trim() !== '' &&
      l.listingType.some(type => type.toLowerCase() === 'service')
    );
  }, [listings]);

  const currentBusinessId = watch('businessId');

  React.useEffect(() => {
    if (!isLoadingListings && businesses.length === 0) {
      setShowNoBusinessDialog(true);
    }
  }, [isLoadingListings, businesses.length]);

  // Auto-populate business when user has exactly one service business
  React.useEffect(() => {
    if (!isLoadingListings && businesses.length === 1 && !currentBusinessId) {
      setValue('businessId', businesses[0].id);
    }
  }, [isLoadingListings, businesses, currentBusinessId, setValue]);

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
                    {businesses.length > 0 ? (
                      businesses.map((b: UserListing) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.businessName}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No service businesses available
                      </div>
                    )}
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
                  <MultiMediaUpload onMediaChange={field.onChange} maxSize={30 * 1024 * 1024} />
                </FormControl>
                <FormDescription>At least one image is required. Max file size: 30MB.</FormDescription>
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

      {/* No Business Found Dialog */}
      <AlertDialog open={showNoBusinessDialog} onOpenChange={setShowNoBusinessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">No Service Business Found</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed">
              You need to create a <span className="font-semibold">Service</span> type business listing before you can add a service.
              <br /><br />
              Please go to <span className="font-semibold">"My Listings"</span> and create a new business with the listing type set to <span className="font-semibold">"Service"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push('/dashboard/services')}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/dashboard/add-listing')}>
              Create Business
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
