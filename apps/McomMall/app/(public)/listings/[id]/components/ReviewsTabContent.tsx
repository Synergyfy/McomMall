'use client';

import { Review } from '@/service/listings/types';
import { ReviewCard } from './ReviewCard';
import { useGetReviewsForBusiness } from '@/service/reviews/hook';
import { AddReviewModal } from '@/components/AddReviewModal';

// Skeleton loader component for the reviews tab
const ReviewsSkeleton = () => {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start space-x-4 animate-pulse">
          <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main component for the reviews tab content
export const ReviewsTabContent = ({
  businessId,
  preloadedReviews,
}: {
  businessId: string;
  preloadedReviews?: Review[];
}) => {
  const queryId = preloadedReviews ? '' : businessId;

  const {
    data: fetchedReviews,
    isLoading,
    isError,
  } = useGetReviewsForBusiness(queryId);

  const reviews = preloadedReviews || fetchedReviews;

  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Could not load reviews.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Customer Reviews</h3>
        <AddReviewModal businessId={businessId} />
      </div>
      {(!reviews || reviews.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            This business doesn&apos;t have any reviews yet.
          </p>
        </div>
      )}
      {reviews && reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((review, idx) => {
            const key = 'id' in review ? (review as any).id : `${review.author_name}-${review.time || idx}`;
            return <ReviewCard key={key} review={review} />;
          })}
        </div>
      )}
    </div>
  );
};
