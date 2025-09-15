import React from 'react';
import { ListingFormData } from '../../../types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { z } from 'zod';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
  schema?: z.ZodSchema<unknown>;
}

const isFieldOptional = (schema: z.ZodSchema<unknown>, fieldName: string) => {
  if (!schema || !('shape' in schema)) {
    return true; // Default to optional if schema is not as expected
  }
  const fieldSchema = (schema as z.ZodObject<z.ZodRawShape>).shape[fieldName];
  if (!fieldSchema) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (fieldSchema as any)._def.typeName === 'ZodOptional';
};

const BookingStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  schema,
}) => {
  const serviceData = formData.serviceData || {};
  const bookingMethod = serviceData.bookingMethod || 'call';
  const pricingVisibility = serviceData.pricingVisibility || 'quote';
  const hasPublicLiabilityInsurance = !!serviceData.hasPublicLiabilityInsurance;

  const handleServiceDataChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        [key]: value,
      },
    }));
  };

  const handleInsuranceToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        hasPublicLiabilityInsurance: checked,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Method</CardTitle>
          <CardDescription>
            How should customers book your services?
            {isFieldOptional(schema!, 'serviceData.bookingMethod') && (
              <span className="text-muted-foreground font-normal text-sm">
                {' '}
                (optional)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={bookingMethod}
            onValueChange={value =>
              handleServiceDataChange('bookingMethod', value)
            }
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="call" id="call" />
              <Label htmlFor="call">Call to book</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quote" id="quote" />
              <Label htmlFor="quote">Request a quote</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online">Book online</Label>
            </div>
          </RadioGroup>
          {bookingMethod === 'online' && (
            <div className="mt-4">
              <Label htmlFor="bookingURL">
                Booking URL
                {isFieldOptional(schema!, 'serviceData.bookingURL') && (
                  <span className="text-muted-foreground font-normal text-sm">
                    {' '}
                    (optional)
                  </span>
                )}
              </Label>
              <Input
                id="bookingURL"
                type="url"
                placeholder="https://yourbookingplatform.com"
                value={serviceData.bookingURL || ''}
                onChange={e =>
                  handleServiceDataChange('bookingURL', e.target.value)
                }
              />
            </div>
          )}
          {errors['serviceData.bookingMethod'] && (
            <p className="text-sm text-red-500 mt-1">
              {errors['serviceData.bookingMethod']}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Visibility</CardTitle>
          <CardDescription>
            How do you want to display your pricing?
            {isFieldOptional(schema!, 'serviceData.pricingVisibility') && (
              <span className="text-muted-foreground font-normal text-sm">
                {' '}
                (optional)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={pricingVisibility}
            onValueChange={value =>
              handleServiceDataChange('pricingVisibility', value)
            }
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed">Fixed price</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly">Hourly rate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quote" id="quote-price" />
              <Label htmlFor="quote-price">Quote only</Label>
            </div>
          </RadioGroup>
          {errors['serviceData.pricingVisibility'] && (
            <p className="text-sm text-red-500 mt-1">
              {errors['serviceData.pricingVisibility']}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance</CardTitle>
          <CardDescription>
            Confirm if you have public liability insurance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="hasPublicLiabilityInsurance"
              checked={hasPublicLiabilityInsurance}
              onCheckedChange={handleInsuranceToggle}
            />
            <Label htmlFor="hasPublicLiabilityInsurance">
              I have public liability insurance
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingStep;
