'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Edit,
  Trash2,
  Building2,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useDeleteListing, useGetUserListings } from '@/service/listings/hook';
import { UserListing } from '@/service/listings/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---

type Listing = UserListing;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost' | 'outline';
  children: React.ReactNode;
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

// --- Reusable UI Components ---

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95';
  const variants = {
    default: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    primary: 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600',
  };
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white text-slate-900 shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const ListingCard: React.FC<{
  listing: Listing;
  onDeleteClick: (listingId: string) => void;
}> = ({ listing, onDeleteClick }) => {
  const [imgSrc, setImgSrc] = useState(listing.logoUrl);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}?source=in-house`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      <Card className="w-full overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 p-5">
          <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={listing.businessName}
                fill
                className="object-cover"
                onError={() => setImgSrc(null)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-10 w-10 text-slate-300" />
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                {listing.businessName}
              </h3>
              <Badge
                variant="outline"
                className={`w-fit mx-auto md:mx-0 font-bold uppercase tracking-wider text-[10px] border-none ${listing.status?.toLowerCase() === 'published'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-orange-50 text-orange-600'
                  }`}
              >
                {listing.status?.toLowerCase() === 'published' ? 'Active' : listing.status}
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {listing.listingType.map(type => (
                <Badge key={type} className="bg-slate-100 text-slate-600 border-none font-semibold">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="truncate">{listing.location.addressLine1}, {listing.location.city}</span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:w-full h-11 px-4 gap-2"
              onClick={e => {
                e.stopPropagation();
                router.push(`/dashboard/edit-listing/${listing.id}`);
              }}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button
              variant="outline"
              className="h-11 w-11 shrink-0 text-red-500 hover:bg-red-50 hover:border-red-100"
              onClick={e => {
                e.stopPropagation();
                onDeleteClick(listing.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers: (number | string)[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10 p-0"
      >
        &larr;
      </Button>
      {pageNumbers.map((num, idx) => (
        <Button
          key={idx}
          variant={num === currentPage ? 'primary' : 'ghost'}
          onClick={() => typeof num === 'number' && onPageChange(num)}
          disabled={typeof num !== 'number'}
          className={`h-10 w-10 p-0 ${num === currentPage ? 'scale-105' : ''}`}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 w-10 p-0"
      >
        &rarr;
      </Button>
    </div>
  );
};

// --- Main Page Component ---

export default function ActiveListingsPage() {
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 5;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useGetUserListings(page, limit, 'published');

  const { mutate: deleteListing } = useDeleteListing();

  const handleDeleteClick = (listingId: string) => {
    setSelectedListingId(listingId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedListingId) {
      deleteListing(selectedListingId);
      setIsDeleteDialogOpen(false);
      setSelectedListingId(null);
    }
  };

  const listings = useMemo(() => {
    return (paginatedData?.data || []).filter(l => l.status?.toLowerCase() === 'published');
  }, [paginatedData]);
  const totalPages = paginatedData?.meta.lastPage || 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Active <span className="text-orange-600">Listings</span></h1>
            <p className="text-slate-500 font-medium italic">Manage and monitor your currently live business storefronts</p>
          </div>
          <Button
            variant="primary"
            className="h-12 px-6 gap-2"
            onClick={() => router.push('/dashboard/add-listing')}
          >
            <Plus className="h-5 w-5" />
            <span>New Listing</span>
          </Button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-orange-600" />
              <p className="text-slate-400 font-bold animate-pulse">Syncing with storefronts...</p>
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-red-100 bg-red-50/50 p-12 text-center">
              <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
              <p className="text-red-600/70">{error?.message || "Failed to load active listings"}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">Retry Connection</Button>
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">No active listings</h3>
                <p className="text-slate-500">You haven&apos;t published any listings yet or they are currently pending.</p>
              </div>
              <Button onClick={() => router.push('/dashboard/add-listing')} variant="outline">Create your first listing</Button>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center pt-8 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Archive Listing?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This will permanently remove your listing from the marketplace. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold">Keep Listing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-600 font-bold hover:bg-red-700"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}