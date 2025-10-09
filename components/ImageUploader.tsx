'use client';

import React, { useState } from 'react';
import SingleImageInput from './SingleImageInput';
import { toast } from 'sonner';
import { Progress } from './ui/progress';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  folder: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  folder,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/upload/${folder}`, true);

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadSuccess(response.secure_url);
          toast.success('Image uploaded successfully!');
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          toast.error(
            `Upload failed: ${errorResponse.error || 'Unknown error'}`
          );
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error('An error occurred during the upload.');
      };

      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
      toast.error('Failed to upload image.');
    }
  };

  return (
    <div>
      <SingleImageInput onImageChange={handleImageChange} />
      {isUploading && (
        <div className="mt-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="mt-1 text-center text-sm text-slate-500">
            Uploading...
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;