'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import AvailabilityEditor from './AvailabilityEditor';

export function Step4Availability() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <FormField
        control={control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <AvailabilityEditor
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
