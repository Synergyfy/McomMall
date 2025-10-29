'use client';

import React from 'react';
import { UserListing } from '@/service/listings/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Briefcase,
  BadgeCheck,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteListing } from '@/service/listings/hook';

interface ListingCardProps {
  listing: UserListing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const router = useRouter();
  const { mutate: deleteListing, isPending } = useDeleteListing();

  const handleDelete = () => {
    deleteListing(listing.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800 truncate">
              {listing.businessName}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{listing.listingType.join(', ')}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              listing.status.toLowerCase() === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {listing.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {listing.shortDescription}
        </p>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {listing.location.addressLine1}, {listing.location.city}
            </span>
          </div>
          {listing.isGoogleVerified && (
            <div className="flex items-center text-sm text-green-600">
              <BadgeCheck className="h-4 w-4 mr-2" />
              <span>Google Verified</span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/my-listings/edit/${listing.id}`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ListingCard;
