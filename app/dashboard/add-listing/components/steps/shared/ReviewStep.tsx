import React from 'react';
import { ListingFormData } from '../../../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import ListingPreview from '../../shared/ListingPreview';

interface StepProps {
  formData: ListingFormData;
  errors: Record<string, string>;
}

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

      <ListingPreview formData={formData} />
    </div>
  );
};

export default ReviewStep;
