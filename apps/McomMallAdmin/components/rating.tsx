import React from 'react';

interface RatingProps {
  rating: number;
  reviews: number;
}

const Rating: React.FC<RatingProps> = ({ rating, reviews }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={`text-yellow-500 text-base ${
        index < Math.floor(rating)
          ? ''
          : index < rating
          ? 'text-opacity-50'
          : 'text-gray-300'
      }`}
    >
      ★
    </span>
  ));

  return (
    <div className="inline-flex items-center text-sm text-gray-600">
      {stars}
      <span className="ml-1">({reviews})</span>
    </div>
  );
};

export default Rating;
