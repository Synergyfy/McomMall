'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, PoundSterling, Clock, MapPin, Tag, List, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Step7FinalReview() {
  const { watch } = useFormContext();
  const formValues = watch();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0);
  };

  const getPricingDisplay = () => {
    const model = formValues.pricingModel;
    if (model === 'fixed') return `Fixed Price: ${formatCurrency(formValues.fixedPrice)}`;
    if (model === 'perHour') return `${formatCurrency(formValues.pricePerHour)} per hour`;
    if (model === 'perUnit') return `${formatCurrency(formValues.pricePerUnit)} per ${formValues.unitName || 'unit'}`;
    if (model === 'perJob') return `Job Price: ${formatCurrency(formValues.fixedPrice)}`;
    if (model === 'perSession') return `Session Price: ${formatCurrency(formValues.fixedPrice)}`;
    if (model === 'subscription') return `Subscription: ${formatCurrency(formValues.fixedPrice)}`;
    return 'Pricing not set';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Comprehensive Review
          </CardTitle>
          <CardDescription>
            Please review all the details below. Ensure everything is correct before publishing your service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Basic Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Tag className="w-5 h-5 text-primary" />
              <h3>Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Service Name</span>
                <p className="font-medium text-base">{formValues.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Category</span>
                <p className="font-medium text-base">{formValues.category || 'Not set'} {formValues.subcategory && `> ${formValues.subcategory}`}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Short Description</span>
                <p className="text-gray-700">{formValues.shortDescription || 'None'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Full Description</span>
                <p className="text-gray-700 whitespace-pre-wrap">{formValues.description || 'None'}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Target Audience</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formValues.targetAudience?.split(',').map((item: string) => (
                    <Badge key={item} variant="outline" className="text-xs">{item.trim()}</Badge>
                  )) || <span className="text-gray-500">None</span>}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formValues.tags?.split(',').map((item: string) => (
                    <Badge key={item} variant="secondary" className="text-xs">{item.trim()}</Badge>
                  )) || <span className="text-gray-500">None</span>}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Service Type & Area */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <MapPin className="w-5 h-5 text-primary" />
              <h3>Type & Area</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Delivery Mode</span>
                <p className="font-medium text-base capitalize">{formValues.deliveryConfig?.mode || 'Not set'}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Travel Fee</span>
                <p className="font-medium text-base">{formatCurrency(formValues.deliveryConfig?.travelFee)}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Cities/Regions</span>
                <p className="text-gray-700">
                  {formValues.deliveryConfig?.cities || formValues.deliveryConfig?.regions || 'No specific area restrictions'}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Pricing */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <PoundSterling className="w-5 h-5 text-primary" />
              <h3>Pricing Configuration</h3>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Pricing Model</span>
                <p className="font-medium text-base capitalize">{formValues.pricingModel}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Base Rate</span>
                <p className="font-medium text-base text-green-600">{getPricingDisplay()}</p>
              </div>
              
              {formValues.enableGuestPricing && (
                <div className="md:col-span-2 bg-gray-50 p-3 rounded-md">
                   <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-2">Guest Pricing</span>
                   <div className="grid grid-cols-2 gap-2">
                     <p>Model: <span className="font-medium capitalize">{formValues.guestPricingModel}</span></p>
                     <p>Range: <span className="font-medium">{formValues.minGuests} - {formValues.maxGuests} guests</span></p>
                   </div>
                </div>
              )}

              {formValues.configurableAddons?.length > 0 && (
                 <div className="md:col-span-2">
                   <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-2">Add-ons</span>
                   <ul className="list-disc pl-5 space-y-1">
                     {formValues.configurableAddons.map((addon: any, idx: number) => (
                       <li key={idx}><span className="font-medium">{addon.name}</span> - {formatCurrency(addon.price)} ({addon.pricingType})</li>
                     ))}
                   </ul>
                 </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Availability */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Clock className="w-5 h-5 text-primary" />
              <h3>Availability</h3>
            </div>
            <div className="pl-7 text-sm">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <div>
                   <span className="text-muted-foreground block text-xs uppercase tracking-wider">Slot Duration</span>
                   <p className="font-medium">{formValues.availability?.slotDuration} mins</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground block text-xs uppercase tracking-wider">Buffer Time</span>
                   <p className="font-medium">{formValues.availability?.bufferTime} mins</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground block text-xs uppercase tracking-wider">Max Bookings/Slot</span>
                   <p className="font-medium">{formValues.availability?.maxBookingsPerSlot}</p>
                 </div>
               </div>
               
               <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-2">Weekly Schedule</span>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                 {formValues.availability?.schedule.map((day: any) => (
                   <div key={day.day} className={`p-2 rounded border text-center ${day.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                     <span className="block font-medium capitalize text-xs mb-1">{day.day}</span>
                     {day.enabled ? (
                       <span className="text-xs">{day.startTime} - {day.endTime}</span>
                     ) : (
                       <span className="text-xs italic">Closed</span>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          </section>

           <Separator />

          {/* Workflow */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <List className="w-5 h-5 text-primary" />
              <h3>Workflow & Requirements</h3>
            </div>
            <div className="pl-7 text-sm space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={formValues.requireApproval ? "destructive" : "default"}>
                  {formValues.requireApproval ? "Manual Approval Required" : "Instant Booking"}
                </Badge>
              </div>
              
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-2">Customer Requirements</span>
                <div className="flex flex-wrap gap-2">
                  {formValues.bookingRequirements?.requireAddress && <Badge variant="outline">Address</Badge>}
                  {formValues.bookingRequirements?.requirePhone && <Badge variant="outline">Phone</Badge>}
                  {formValues.bookingRequirements?.requirePhotos && <Badge variant="outline">Photos</Badge>}
                  {formValues.bookingRequirements?.requireProblemDescription && <Badge variant="outline">Description</Badge>}
                  {!formValues.bookingRequirements?.requireAddress && !formValues.bookingRequirements?.requirePhone && !formValues.bookingRequirements?.requirePhotos && !formValues.bookingRequirements?.requireProblemDescription && <span className="text-gray-500 italic">None</span>}
                </div>
              </div>
            </div>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
