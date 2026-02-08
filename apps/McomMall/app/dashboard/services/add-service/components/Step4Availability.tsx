'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AvailabilityEditor from './AvailabilityEditor';

export function Step4Availability() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-primary" />
            Service Availability
          </CardTitle>
          <CardDescription>
            Define when customers can book this service and manage your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Weekly Schedule</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Set your working hours and breaks for each day of the week.
                    </TooltipContent>
                  </Tooltip>
                </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
