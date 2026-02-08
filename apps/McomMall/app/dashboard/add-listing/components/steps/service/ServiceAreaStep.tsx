import React from 'react';
import { ListingFormData, ServiceProviderData } from '../../../types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ServiceAreaEditor from '../../shared/ServiceAreaEditor';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
}

const ServiceAreaStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const serviceData = formData.serviceData || {};
  const serviceLocation = serviceData.serviceLocation || {
    atBusinessLocation: false,
    customerTravels: false,
  };

  const handleLocationTypeChange = (id: keyof typeof serviceLocation, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        serviceLocation: {
          ...serviceLocation,
          [id]: checked,
        },
      },
    }));
  };

  const handleAreaChange = (area: ServiceProviderData['serviceArea']) => {
      setFormData(prev => ({
          ...prev,
          serviceData: {
              ...prev.serviceData,
              serviceArea: area,
          }
      }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Location</CardTitle>
          <CardDescription>Where do you provide your services? Select all that apply.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="atBusinessLocation"
              checked={serviceLocation.atBusinessLocation}
              onCheckedChange={(checked) => handleLocationTypeChange('atBusinessLocation', !!checked)}
            />
            <Label htmlFor="atBusinessLocation">At my business address</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="customerTravels"
              checked={serviceLocation.customerTravels}
              onCheckedChange={(checked) => handleLocationTypeChange('customerTravels', !!checked)}
            />
            <Label htmlFor="customerTravels">I travel to the customer</Label>
          </div>
          {errors['serviceData.serviceLocation'] && <p className="text-sm text-red-500">{errors['serviceData.serviceLocation']}</p>}
        </CardContent>
      </Card>

      {serviceLocation.customerTravels && (
        <Card>
            <CardHeader>
                <CardTitle>Travel Area</CardTitle>
            </CardHeader>
            <CardContent>
                <ServiceAreaEditor
                    area={serviceData.serviceArea || { type: 'radius', value: '' }}
                    onAreaChange={handleAreaChange}
                    error={errors['serviceData.serviceArea']}
                />
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceAreaStep;
