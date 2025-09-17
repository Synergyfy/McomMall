'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useGetReviewsForUser } from '@/service/reviews/hook';
import { Review } from '@/service/reviews/types';

// --- Reusable UI Components ---

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
        }`}
      />
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const authorName = review.author?.name || 'Anonymous';
  const authorAvatar = review.author?.avatarUrl || '/default-avatar.png';

  return (
    <motion.div
      variants={cardVariants}
      className="border-b border-slate-200 bg-white p-6 last:border-b-0"
    >
      <div className="flex items-start gap-4">
        <Image
          src={authorAvatar}
          alt={authorName}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-semibold text-slate-800">{authorName}</h4>
              {review.businessId && (
                <p className="text-xs text-slate-500">
                  review for{' '}
                  <span className="font-medium text-slate-600">
                    Business ID: {review.businessId}
                  </span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <StarRating rating={review.rating} />
              <p className="text-xs text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {review.comment}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---

export default function ReviewsPage() {
  const {
    data: reviews,
    isLoading,
    isError,
  } = useGetReviewsForUser();

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-10">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-4xl font-bold text-slate-800">My Reviews</h1>
          <p className="text-sm text-slate-500">Home &gt; Dashboard</p>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold text-slate-700">
              Your Reviews
            </h2>
          </div>

          {isLoading && (
            <div className="p-12 text-center">
              <p className="text-slate-500">Loading your reviews...</p>
            </div>
          )}

          {isError && (
            <div className="p-12 text-center">
              <p className="text-red-500">Could not load your reviews.</p>
            </div>
          )}

          {reviews && reviews.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </motion.div>
          ) : (
            !isLoading && (
              <div className="p-12 text-center">
                <p className="text-slate-500">
                  You haven&apos;t written any reviews yet.
                </p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
