import React from 'react';
import { ListingFormData } from '../../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepProps {
  formData: ListingFormData;
  errors: Record<string, string>;
  // Will be implemented in the parent component
  // goToStep: (stepNumber: number) => void;
}

const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  if (!value) return null;
  const displayValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex justify-between py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{String(displayValue)}</dd>
    </div>
  );
};

const ReviewStep: React.FC<StepProps> = ({ formData, errors }) => {
  const errorCount = Object.keys(errors).length;

  return (
    <div className="space-y-6">
      {errorCount > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              You have {errorCount} error(s) to fix
            </CardTitle>
            <CardDescription>
              Please review the sections below and click the edit buttons to fix
              the issues before publishing.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <SummaryItem label="Business Name" value={formData.businessName} />
            <SummaryItem label="Legal Name" value={formData.legalName} />
            <SummaryItem label="Phone" value={formData.phone} />
            <SummaryItem label="Email" value={formData.email} />
            <SummaryItem label="Website" value={formData.socials.website} />
            <SummaryItem label="Short Description" value={formData.shortDesc} />
          </dl>
        </CardContent>
      </Card>

      {formData.businessTypes.includes('Product') && formData.productData && (
        <Card>
          <CardHeader>
            <CardTitle>Product Seller Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <SummaryItem
                label="Primary Category"
                value={formData.productData.primaryCategory}
              />
              <SummaryItem
                label="Subcategories"
                value={formData.productData.subCategories?.join(', ')}
              />
              <SummaryItem label="Address" value={formData.address} />
              <SummaryItem
                label="Selling Modes"
                value={Object.entries(formData.productData.sellingModes || {})
                  .filter(([, v]) => v)
                  .map(([k]) => k)
                  .join(', ')}
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {formData.businessTypes.includes('Service') && formData.serviceData && (
        <Card>
          <CardHeader>
            <CardTitle>Service Provider Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <SummaryItem
                label="Trade Category"
                value={formData.serviceData.tradeCategory}
              />
              <SummaryItem
                label="Availability"
                value={
                  formData.serviceData.hoursType === 'weekly'
                    ? 'Weekly Hours'
                    : 'By Appointment Only'
                }
              />
              <SummaryItem
                label="Quote Only"
                value={formData.serviceData.pricingVisibility === 'quote'}
              />
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewStep;
