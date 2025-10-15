'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'sonner';

interface UploaderProps {
  onUpload: (url: string) => void;
  folder: string;
}

const Uploader = ({ onUpload, folder }: UploaderProps) => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`/api/upload/${folder}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await response.json();
        onUpload(url);
        toast.success('Image uploaded successfully!');
      } catch (error) {
        toast.error('Failed to upload image.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [onUpload, folder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors
      ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <FaCloudUploadAlt
          className={`h-10 w-10 text-gray-400 ${
            isDragActive ? 'text-blue-600' : ''
          }`}
        />
        {loading ? (
          <p className="text-sm font-medium text-gray-600">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-sm font-medium text-blue-600">
            Drop the image here...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-600">
              Drag &apos;n&apos; drop an image here, or click to select one
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Uploader;