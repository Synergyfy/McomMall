'use client';
import React, { useState, ChangeEvent, useEffect, useCallback } from 'react';
import { Plus, X, UploadCloud, Crop } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import MediaCropper from './MediaCropper';

// Define the shape of a media file object
interface MediaFile {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

interface MultiMediaUploadProps {
  onMediaChange: (media: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  initialMedia?: string[];
}

const MultiMediaUpload: React.FC<MultiMediaUploadProps> = ({
  onMediaChange,
  maxFiles = 5,
  maxSize = 30 * 1024 * 1024, // 30MB default
  initialMedia = [],
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [initialMediaFiles, setInitialMediaFiles] = useState<string[]>(initialMedia || []);
  const [error, setError] = useState<string | null>(null);

  // Cropping State
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      setMediaFiles(prevMediaFiles => {
        if (prevMediaFiles.length + files.length > maxFiles) {
          setError(`You can only upload a maximum of ${maxFiles} files.`);
          return prevMediaFiles;
        }

        const newMediaFiles: MediaFile[] = files
          .map(file => {
            if (file.size > maxSize) {
              setError(`File ${file.name} exceeds the ${maxSize / 1024 / 1024}MB size limit.`);
              return null;
            }
            const fileType = file.type.startsWith('image/')
              ? 'image'
              : file.type.startsWith('video/')
                ? 'video'
                : null;

            if (!fileType) {
              return null;
            }

            return {
              file,
              previewUrl: URL.createObjectURL(file),
              type: fileType,
            };
          })
          .filter((mediaFile): mediaFile is MediaFile => mediaFile !== null);

        if (newMediaFiles.length > 0) {
          const updatedMediaFiles = [...prevMediaFiles, ...newMediaFiles];
          setError(null);
          return updatedMediaFiles;
        }

        return prevMediaFiles;
      });
    },
    [maxFiles, maxSize]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      e.target.value = '';
    },
    [handleFiles]
  );

  const handleDelete = (index: number) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    const deletedFile = mediaFiles[index];
    if (deletedFile) {
      URL.revokeObjectURL(deletedFile.previewUrl);
    }
    setMediaFiles(newMediaFiles);
  };

  const handleCropSave = (croppedFile: File) => {
    if (croppingIndex === null) return;

    setMediaFiles(prev => {
      const updated = [...prev];
      const oldMedia = updated[croppingIndex];

      // Revoke old URL
      URL.revokeObjectURL(oldMedia.previewUrl);

      updated[croppingIndex] = {
        ...oldMedia,
        file: croppedFile,
        previewUrl: URL.createObjectURL(croppedFile),
      };
      return updated;
    });
    setCroppingIndex(null);
  };

  useEffect(() => {
    try {
      onMediaChange(mediaFiles.map(mf => mf.file));
    } catch (e) {
      console.error('Error in onMediaChange:', e);
    }
    const hasImage = mediaFiles.some(mf => mf.type === 'image');
    if (mediaFiles.length > 0 && !hasImage) {
      setError('At least one image file is required.');
    } else if (error === 'At least one image file is required.' && hasImage) {
      setError(null);
    }
  }, [mediaFiles, onMediaChange, error]);

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      mediaFiles.forEach(mf => URL.revokeObjectURL(mf.previewUrl));
    };
  }, [mediaFiles]);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 border-gray-300 hover:border-orange-500 cursor-pointer"
        onClick={() => document.getElementById('media-upload-input')?.click()}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Click or drag to upload images or videos
        </p>
        <p className="text-xs text-gray-500">
          (Up to {maxFiles} files in total)
        </p>
        <Input
          id="media-upload-input"
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp, image/gif, video/mp4, video/webm, video/ogg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {initialMediaFiles.map((url, index) => (
          <div key={`initial-${index}`} className="relative aspect-square">
            <Image
              src={url}
              alt={`initial preview ${index}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={() => setInitialMediaFiles(initialMediaFiles.filter((_, i) => i !== index))}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Delete file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {mediaFiles.map((mediaFile, index) => (
          <div key={index} className="relative aspect-square">
            {mediaFile.type === 'image' ? (
              <Image
                src={mediaFile.previewUrl}
                alt={`preview ${index}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            ) : (
              <video
                src={mediaFile.previewUrl}
                controls
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            <div className="absolute top-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => setCroppingIndex(index)}
                className="bg-orange-600 text-white rounded-full p-1.5 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                aria-label="Crop file"
              >
                <Crop className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Delete file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {mediaFiles.length < maxFiles && (
          <button
            type="button"
            onClick={() => document.getElementById('media-upload-input')?.click()}
            className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors"
            aria-label="Add more files"
          >
            <Plus className="h-10 w-10" />
            <span className="text-sm mt-1">Add More</span>
          </button>
        )}
      </div>

      {croppingIndex !== null && (
        <MediaCropper
          isOpen={croppingIndex !== null}
          onClose={() => setCroppingIndex(null)}
          mediaUrl={mediaFiles[croppingIndex].previewUrl}
          mediaType={mediaFiles[croppingIndex].type}
          onCropSave={handleCropSave}
        />
      )}
    </div>
  );
};

// It's good practice to memoize the component if it's rendered within a form
export default React.memo(MultiMediaUpload);
