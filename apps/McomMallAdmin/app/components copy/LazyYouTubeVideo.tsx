'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

interface LazyYouTubeVideoProps {
  videoId: string;
  title: string;
}

export default function LazyYouTubeVideo({ videoId, title }: LazyYouTubeVideoProps) {
  const [load, setLoad] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handleLoad = () => {
    setLoad(true);
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-700 bg-black shadow-2xl">
      {load ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        ></iframe>
      ) : (
        <div onClick={handleLoad} className="cursor-pointer h-full w-full">
          <Image
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            layout="fill"
            objectFit="cover"
            unoptimized // Thumbnails from YouTube are already optimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <PlayCircle className="h-16 w-16 text-white/80 transition-transform hover:scale-110" />
          </div>
        </div>
      )}
    </div>
  );
}
