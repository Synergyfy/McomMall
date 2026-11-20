'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { resolveBusinessImageUrl } from '@/lib/media';

type SafeImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Shown when `src` is empty or fails to load (e.g. a category fallback). */
  fallbackSrc?: string;
  /** Rendered when there is no `fallbackSrc` (e.g. an icon). */
  fallback?: ReactNode;
};

/**
 * Image that resolves Central-hosted uploads through the media proxy and
 * degrades to a fallback instead of showing a broken-image icon.
 */
export default function SafeImage({
  src,
  alt,
  className,
  fallbackSrc,
  fallback = null,
}: SafeImageProps) {
  const resolved = resolveBusinessImageUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return fallbackSrc ? (
      <img src={fallbackSrc} alt={alt} className={className} />
    ) : (
      <>{fallback}</>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
