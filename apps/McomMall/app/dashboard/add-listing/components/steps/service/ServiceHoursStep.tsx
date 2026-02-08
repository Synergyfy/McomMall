import React from 'react';
import { ListingFormData, ServiceProviderData } from '../../../types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeeklyHoursEditor from '../../shared/WeeklyHoursEditor';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
}

const ServiceHoursStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const serviceData = formData.serviceData || {};
  const hoursType = serviceData.hoursType || 'weekly';

  const handleHoursTypeChange = (type: 'weekly' | 'appointmentOnly') => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        hoursType: type,
      },
    }));
  };

  const handleWeeklyHoursChange = (weeklyHours: ServiceProviderData['weeklyHours']) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        weeklyHours: weeklyHours,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={hoursType}
            onValueChange={handleHoursTypeChange}
            className="mb-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Set Weekly Hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="appointmentOnly" id="appointmentOnly" />
              <Label htmlFor="appointmentOnly">By Appointment Only</Label>
            </div>
          </RadioGroup>

          {hoursType === 'weekly' && (
            <WeeklyHoursEditor
              weeklyHours={serviceData.weeklyHours || {}}
              onWeeklyHoursChange={handleWeeklyHoursChange}
            />
          )}
          {errors['serviceData.hoursType'] && <p className="text-sm text-red-500 mt-1">{errors['serviceData.hoursType']}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceHoursStep;
