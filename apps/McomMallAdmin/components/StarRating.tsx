import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
}

export default function StarRating({
  rating,
  totalStars = 5,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-5 w-5 text-yellow-400 fill-current"
        />
      ))}
      {halfStar && (
        <Star
          key="half"
          className="h-5 w-5 text-yellow-400"
          style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="h-5 w-5 text-gray-300 fill-current"
        />
      ))}
    </div>
  );
}
