'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { CalendarCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvailabilityEditor from './AvailabilityEditor';

interface Step4AvailabilityProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Availability({ onNext, onBack }: Step4AvailabilityProps) {
  const form = useFormContext();

  const onSubmit = (data: any) => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <form id="step4-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarCheck className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Availability & Hours</h3>
              <p className="text-sm text-muted-foreground">
                Set the days and times when this service is available.
              </p>
            </div>
          </div>

          <AvailabilityEditor />
        </Card>
      </form>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} type="button">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button type="submit" form="step4-form">
          Next
        </Button>
      </div>
    </div>
  );
}
