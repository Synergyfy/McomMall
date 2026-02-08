import React from 'react';
import { ListingFormData, ProductSellerData } from '../../../types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeeklyHoursEditor from '../../shared/WeeklyHoursEditor';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
}

const ProductHoursStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const productData = formData.productData || {};
  const is247 = productData.is247 || false;

  const handleIs247Change = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, is247: checked },
    }));
  };

  const handleWeeklyHoursChange = (weeklyHours: ProductSellerData['weeklyHours']) => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        weeklyHours: weeklyHours,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Switch
              id="is247"
              checked={is247}
              onCheckedChange={handleIs247Change}
            />
            <Label htmlFor="is247">My business is open 24/7</Label>
          </div>

          {!is247 && (
            <WeeklyHoursEditor
              weeklyHours={productData.weeklyHours || {}}
              onWeeklyHoursChange={handleWeeklyHoursChange}
            />
          )}
          {errors['productData.weeklyHours'] && <p className="text-sm text-red-500 mt-1">{errors['productData.weeklyHours']}</p>}
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Special Days (e.g., Holidays)</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                  This feature will be implemented in a future step.
              </p>
          </CardContent>
      </Card>
    </div>
  );
};

export default ProductHoursStep;
