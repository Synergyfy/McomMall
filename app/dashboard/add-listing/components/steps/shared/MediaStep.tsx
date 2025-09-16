import React from 'react';
import { ListingFormData } from '../../../types';
import MultiMediaUpload from './MultiMediaUpload';
import { z } from 'zod';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
  schema?: z.ZodSchema<unknown>;
}

const MediaStep: React.FC<StepProps> = ({ formData, setFormData, errors }) => {
  const handleMediaChange = (files: File[]) => {
    // Here, we're assuming you want to store the File objects directly.
    // You might need to adapt this to fit the 'Media' type if it involves more than just the file.
    const mediaData = files.map(file => ({
      file,
      altText: '', // You might want a way to manage alt text for each file.
    }));
    setFormData(prev => ({ ...prev, media: mediaData }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Upload Media</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add up to 5 images or videos for your listing. Drag and drop or click
          to upload.
        </p>
        <MultiMediaUpload
          onMediaChange={handleMediaChange}
          maxFiles={5}
        />
        {errors.media && (
          <p className="text-sm text-red-500 mt-2">{errors.media}</p>
        )}
      </div>
    </div>
  );
};

export default MediaStep;
