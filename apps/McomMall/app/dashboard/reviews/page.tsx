'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';
import {
  useGetReviewsForUser,
  useGetReviewsForBusinessOwner,
} from '@/service/reviews/hook';
import { useGetUserListings } from '@/service/listings/hook';
import { Review } from '@/service/reviews/types';
import { UserListing } from '@/service/listings/types';
import { useAuth } from '@/service/auth/hook';

// --- Reusable UI Components ---

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: Review; isBusinessOwnerView: boolean }> = ({
  review,
  isBusinessOwnerView,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const name = isBusinessOwnerView
    ? 'A customer'
    : review.business?.name || 'Unknown Business';
  const avatar = review.business?.logo || '/default-business-logo.png';

  return (
    <motion.div
      variants={cardVariants}
      className="transform-gpu border-b border-gray-200 bg-white p-4 transition-all duration-300 ease-in-out last:border-b-0 hover:bg-gray-50 sm:p-6"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Image
            src={avatar}
            alt={name}
            width={50}
            height={50}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="truncate text-sm font-bold text-gray-900">{name}</p>
              {isBusinessOwnerView && review.business?.name && (
                <p className="text-xs text-gray-500">
                  for{' '}
                  <span className="font-medium text-gray-600">
                    {review.business.name}
                  </span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <StarRating rating={review.rating} />
              <p className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">{review.comment}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---

export default function ReviewsPage() {
  const { user } = useAuth();
  const isBusinessOwner = user?.role?.toLowerCase() === 'owner';

  const [showMyReviews, setShowMyReviews] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string | undefined>(
    undefined
  );

  const {
    data: businessReviews,
    isLoading: isLoadingBusiness,
    isError: isErrorBusiness,
  } = useGetReviewsForBusinessOwner(selectedBusiness);

  const {
    data: userReviews,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useGetReviewsForUser();

  const { data: businesses } = useGetUserListings();

  const reviews =
    isBusinessOwner && !showMyReviews
      ? businessReviews?.data
      : userReviews;
  const isLoading =
    isBusinessOwner && !showMyReviews ? isLoadingBusiness : isLoadingUser;
  const isError =
    isBusinessOwner && !showMyReviews ? isErrorBusiness : isErrorUser;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Reviews Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view your reviews
            </p>
          </div>
          <p className="text-sm text-gray-500">Home &gt; Dashboard</p>
        </header>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {isBusinessOwner && !showMyReviews
                ? 'Reviews for Your Businesses'
                : 'Reviews You Wrote'}
            </h2>
            {isBusinessOwner && (
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                <button
                  onClick={() => setShowMyReviews(!showMyReviews)}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                >
                  {showMyReviews
                    ? 'Show Business Reviews'
                    : 'Show Reviews I Wrote'}
                </button>
                {!showMyReviews && (
                  <select
                    value={selectedBusiness}
                    onChange={e =>
                      setSelectedBusiness(e.target.value || undefined)
                    }
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
                  >
                    <option value="">All Businesses</option>
                    {businesses?.data?.map((business: UserListing) => (
                      <option key={business.id} value={business.id}>
                        {business.businessName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="p-12 text-center">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          )}

          {isError && (
            <div className="p-12 text-center">
              <p className="text-red-500">Could not load reviews.</p>
            </div>
          )}

          {reviews && reviews.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-gray-200"
            >
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isBusinessOwnerView={isBusinessOwner && !showMyReviews}
                />
              ))}
            </motion.div>
          ) : (
            !isLoading && (
              <div className="p-12 text-center">
                <p className="text-gray-500">No reviews found.</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
