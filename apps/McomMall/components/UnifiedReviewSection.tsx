'use client';

import { 
  useGetReviewsForBusiness, 
  useGetReviewsForProduct, 
  useGetReviewsForService 
} from '@/service/reviews/hook';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, ThumbsUp, Loader2, Lock } from 'lucide-react';
import StarRating from './StarRating';
import { AddReviewModal } from './AddReviewModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/service/auth/hook';

interface UnifiedReviewSectionProps {
  businessId?: string;
  productId?: string;
  serviceId?: string;
  averageRating?: number;
  reviewCount?: number;
  ownerId?: string; // ID of the person who owns this business/product/service
}

export default function UnifiedReviewSection({
  businessId,
  productId,
  serviceId,
  averageRating = 0,
  reviewCount = 0,
  ownerId,
}: UnifiedReviewSectionProps) {
  const { user, token } = useAuth();
  const isAuthenticated = !!token;
  
  // Conditionally fetch reviews based on provided ID
  const businessQuery = useGetReviewsForBusiness(businessId || '');
  const productQuery = useGetReviewsForProduct(productId || '');
  const serviceQuery = useGetReviewsForService(serviceId || '');

  const isLoading = businessId ? businessQuery.isLoading : 
                    productId ? productQuery.isLoading : 
                    serviceQuery.isLoading;

  const reviews = businessId ? (businessQuery.data || []) : 
                  productId ? (productQuery.data || []) : 
                  (serviceQuery.data || []);

  const isOwner = user?.id === ownerId;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reviews ({reviewCount})</h2>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={averageRating} />
            <span className="text-sm font-bold text-slate-700">{averageRating.toFixed(1)}</span>
          </div>
        </div>
        
        {isAuthenticated ? (
          isOwner ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> Your Listing
            </div>
          ) : (
            <AddReviewModal businessId={businessId} productId={productId} serviceId={serviceId} />
          )
        ) : (
          <Button variant="outline" className="border-slate-200 text-slate-500 font-bold" disabled>
            Login to Review
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      {reviewCount > 0 && (
        <Card className="border-slate-100 bg-slate-50/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:border-r border-slate-200 md:pr-12">
                <p className="text-5xl font-black text-slate-900 mb-2">{averageRating.toFixed(1)}</p>
                <StarRating rating={averageRating} className="justify-center" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">Overall Rating</p>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                  const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-4">{stars}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-400 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="text-slate-900 font-bold">No reviews yet</h3>
            <p className="text-slate-500 text-sm">Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-orange-100 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-slate-50">
                    <AvatarImage src={review.author?.avatarUrl} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                      {review.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{review.author?.name || 'Anonymous User'}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : 'Recently'}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} className="scale-75 origin-top-right" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {review.comment}
              </p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-slate-400 hover:text-slate-900">
                  <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> Helpful
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-slate-400 hover:text-slate-900">
                  Report
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
