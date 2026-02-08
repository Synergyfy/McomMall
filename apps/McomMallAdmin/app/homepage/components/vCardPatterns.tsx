import { cn } from '@/lib/utils';

export const WavyPattern = ({ className }: { className?: string }) => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('absolute inset-0 z-0 opacity-20', className)}
  >
    <defs>
      <pattern
        id="wavy"
        patternUnits="userSpaceOnUse"
        width="60"
        height="60"
        patternTransform="rotate(45)"
      >
        <path
          d="M 0 30 C 15 0, 45 60, 60 30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wavy)" />
  </svg>
);

export const GeometricPattern = ({ className }: { className?: string }) => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('absolute inset-0 z-0 opacity-15', className)}
  >
    <defs>
      <pattern id="geo" patternUnits="userSpaceOnUse" width="80" height="80">
        <path
          d="M 0 0 L 40 40 L 80 0 L 40 40 L 0 80 M 80 80 L 40 40"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo)" />
  </svg>
);

export const CircuitPattern = ({ className }: { className?: string }) => (
  <svg
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('absolute inset-0 z-0 opacity-25', className)}
  >
    <defs>
      <pattern
        id="circuit"
        patternUnits="userSpaceOnUse"
        width="50"
        height="50"
      >
        <path
          d="M 0 25 H 25 V 0 M 25 50 V 25 H 50"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuit)" />
  </svg>
);
