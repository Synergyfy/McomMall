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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Step5Workflow() {
  const { control, watch } = useFormContext();
  const isQuoteModel = watch('isQuoteModel');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
            Booking & Job Workflow
          </CardTitle>
          <CardDescription>Configure how you manage incoming service requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="requireApproval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5 border-primary/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Manual Approval Required</FormLabel>
                  <FormDescription>
                    You must manually confirm bookings before they are finalized.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Separator />

          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-semibold text-base">Customer Input Requirements</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Select what information customers must provide during booking.
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="bookingRequirements.requireAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded hover:bg-muted/50">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Require Address</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bookingRequirements.requirePhone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded hover:bg-muted/50">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Require Phone Number</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bookingRequirements.requirePhotos"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded hover:bg-muted/50">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Require Photos</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bookingRequirements.requireProblemDescription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded hover:bg-muted/50">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Require Problem Description</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <FormField
              control={control}
              name="bookingRequirements.specialInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Special Instructions for Customer <span className="text-muted-foreground text-xs font-normal">(Optional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Please clear the driveway before the team arrives." {...field} className="min-h-[80px]" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" {...field} className="py-6 pl-8" placeholder="0.00" />
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
    </div>
  );
}
