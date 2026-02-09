'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';

export function Step6FinalReview() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
    </div>
  );
}
