import React, { useState, ChangeEvent, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image'; // Import next/image

// Reusable UploadBox component
interface UploadBoxProps {
  onImagesChange: (images: File[]) => void; // Callback for updated images
  maxFiles?: number;
  maxSize?: number; // in MB
}

const UploadBox: React.FC<UploadBoxProps> = ({
  onImagesChange,
  maxFiles = 3,
  maxSize = 5,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const MAX_SIZE_BYTES = maxSize * 1024 * 1024;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Generate URLs for new images
  const generateImageUrls = (files: File[]) => {
    return files.map(file => URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      file =>
        file.type.startsWith('image/') &&
        ['image/webp', 'image/jpeg', 'image/png', 'image/gif'].includes(
          file.type
        )
    );
    handleFiles(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file =>
        file.type.startsWith('image/') &&
        ['image/webp', 'image/jpeg', 'image/png', 'image/gif'].includes(
          file.type
        )
    );
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (selectedImages.length + files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    const oversizedFiles = files.filter(file => file.size > MAX_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    setError(null);
    const newImages = [...selectedImages, ...files];
    const newUrls = generateImageUrls(files);
    setSelectedImages(newImages);
    setImageUrls(prev => [...prev, ...newUrls]);
    onImagesChange(newImages);
  };

  const handleDelete = (index: number) => {
    if (index >= 0 && index < selectedImages.length) {
      const newImages = selectedImages.filter((_, i) => i !== index);
      const newUrls = imageUrls.filter((_, i) => i !== index);
      const deletedUrl = imageUrls[index];
      setSelectedImages(newImages);
      setImageUrls(newUrls);
      if (deletedUrl) URL.revokeObjectURL(deletedUrl);
      onImagesChange(newImages);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div
        className="border-2 border-dashed border-green-500 bg-gray-50 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors sm:p-4 md:p-6 lg:p-8"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        <Plus className="mx-auto text-green-600 mb-2" size={24} />
        <p className="text-green-600 text-sm sm:text-xs md:text-sm lg:text-base">
          Click here or drop files to upload
        </p>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedImages.map((image, index) => (
            <div
              key={index}
              className="relative w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20"
            >
              <Image
                src={imageUrls[index] || ''}
                alt={image.name}
                width={80} // Adjusted to fit within w-20 (20 * 4 = 80px)
                height={80} // Adjusted to match width for square
                className="rounded object-contain"
                onError={() =>
                  console.log(
                    `Image load error at index ${index}: ${image.name}`
                  )
                } // Debug
              />
              <div
                className="absolute inset-0  bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-opacity"
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <span className="text-white text-sm hidden hover:block">
                  Delete
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
