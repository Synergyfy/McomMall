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
import { ClipboardList } from 'lucide-react';

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
          <CardDescription>Configure how bookings are handled.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="requireApproval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Manual Approval Required</FormLabel>
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
          <h4 className="font-medium mb-4">Customer Input Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="bookingRequirements.requireAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Require Address</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bookingRequirements.requirePhone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Require Phone</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bookingRequirements.requirePhotos"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Require Photos</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bookingRequirements.requireProblemDescription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Require Problem Desc</FormLabel>
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
                  <FormLabel>Special Instructions for Customer</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Please clear the area before arrival." {...field} />
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
          <CardTitle className="text-lg">Quote Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="isQuoteModel"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Quote Mode</FormLabel>
                  <FormDescription>Customers request a quote instead of booking.</FormDescription>
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
                <FormItem>
                  <FormLabel>Booking Fee</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
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
