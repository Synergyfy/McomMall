'use client';

import React from 'react';
import { useGetUserListings } from '@/service/listings/hook';
import { UserListing } from '@/service/listings/types';
import ListingCard from '../components/ListingCard';
import { Loader } from 'lucide-react';

const ActiveListingsPage: React.FC = () => {
  const { data: listings, isLoading, isError } = useGetUserListings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin h-8 w-8 text-orange-600" />
        <p className="ml-2">Loading your listings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>There was an error fetching your listings. Please try again later.</p>
      </div>
    );
  }

  const activeListings = listings?.filter(
    (listing: UserListing) => listing.status.toLowerCase() === 'published'
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Active Listings</h1>
      {activeListings && activeListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeListings.map((listing: UserListing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Active Listings Found</h2>
          <p className="text-gray-500">
            You don&apos;t have any active listings right now.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveListingsPage;
