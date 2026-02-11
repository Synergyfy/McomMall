'use client';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const imageCount = images.length;

  if (imageCount === 1) {
    return (
      <div className="w-full h-[450px] overflow-hidden rounded-xl">
        <div className="h-full w-full relative">
          <Image
            src={images[0]}
            alt="Main listing image"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
      </div>
    );
  }

  if (imageCount === 2) {
    return (
      <div className="w-full h-[450px] grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
        <div className="relative h-full">
          <Image
            src={images[0]}
            alt="Image 1"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="relative h-full">
          <Image
            src={images[1]}
            alt="Image 2"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
    );
  }

  if (imageCount === 3) {
    return (
      <div className="w-full h-[450px] grid grid-cols-2 grid-rows-2 gap-2 rounded-xl overflow-hidden">
        <div className="relative row-span-2 h-full">
          <Image
            src={images[0]}
            alt="Image 1"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="relative h-full">
          <Image
            src={images[1]}
            alt="Image 2"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="relative h-full">
          <Image
            src={images[2]}
            alt="Image 3"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
    );
  }

  if (imageCount === 4) {
    return (
      <div className="w-full h-[450px] grid grid-cols-2 grid-rows-2 gap-2 rounded-xl overflow-hidden">
        {images.slice(0, 4).map((src, index) => (
          <div key={src} className="relative h-full">
            <Image
              src={src}
              alt={`Image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    );
  }

  // 5 or more images
  return (
    <div className="w-full h-[450px] grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
      <div className="relative h-full">
        <Image
          src={images[0]}
          alt="Main listing image"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {images.slice(1, 5).map((src, index) => (
          <div key={src} className="h-full w-full relative">
            <Image
              src={src}
              alt={`Listing image ${index + 2}`}
              layout="fill"
              objectFit="cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
