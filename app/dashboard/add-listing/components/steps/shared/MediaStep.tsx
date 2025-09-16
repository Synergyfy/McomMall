import React from 'react';
import { ListingFormData } from '../../../types';
import MultiMediaUpload from './MultiMediaUpload';
import SingleImageInput from '../../../../../../components/SingleImageInput';
import { z } from 'zod';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
  schema?: z.ZodSchema<unknown>;
}

const MediaStep: React.FC<StepProps> = ({ setFormData, errors }) => {
  const handleLogoChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, logo: { file, altText: 'logo' } }));
  };

  const handleBannerChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, banner: { file, altText: 'banner' } }));
  };

  const handleMediaChange = (files: File[]) => {
    const mediaData = files.map(file => ({
      file,
      altText: '', // You might want a way to manage alt text for each file.
    }));
    setFormData(prev => ({ ...prev, media: mediaData }));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium mb-2">Business Logo</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a square logo (max 5MB).
          </p>
          <SingleImageInput
            onImageChange={handleLogoChange}
            className="aspect-square"
          />
          {errors.logo && (
            <p className="text-sm text-red-500 mt-2">{errors.logo}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium mb-2">Business Banner</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a wide banner (max 5MB).
          </p>
          <SingleImageInput
            onImageChange={handleBannerChange}
            className="aspect-video"
          />
          {errors.banner && (
            <p className="text-sm text-red-500 mt-2">{errors.banner}</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Gallery Images & Videos</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add up to 5 images or videos for your listing. Each file should not
          exceed 5MB.
        </p>
        <MultiMediaUpload
          onMediaChange={handleMediaChange}
          maxFiles={5}
          maxSize={5 * 1024 * 1024} // 5MB in bytes
        />
        {errors.media && (
          <p className="text-sm text-red-500 mt-2">{errors.media}</p>
        )}
      </div>
    </div>
  );
};

export default MediaStep;
