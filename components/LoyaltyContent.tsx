'use client';

import {
  useCheckPromotions,
  useParticipateInPromotion,
} from '@/service/promotions/hook';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { Calendar, Tag, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

type LoyaltyContentProps = {
  businessId?: string;
  productId?: string;
};

const LoyaltyContent = ({ businessId, productId }: LoyaltyContentProps) => {
  const {
    data: promotions,
    isLoading,
    isError,
  } = useCheckPromotions({
    businessId,
    productId,
  });

  const participateMutation = useParticipateInPromotion();

  const handleParticipate = (promotionId: string) => {
    participateMutation.mutate(promotionId, {
      onSuccess: () => {
        toast.success('Successfully registered for promotion!');
      },
      onError: (error) => {
        toast.error(`Failed to register: ${error.message}`);
      },
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 bg-red-50 p-4 rounded-lg">
        <h4 className="font-bold">Error</h4>
        <p>Could not load promotions at this time. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold border-t pt-6 text-gray-800">
        Promotions
      </h3>
      {promotions && promotions.length > 0 ? (
        <div className="space-y-6 mt-6">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="flex-grow">
                  <h4 className="font-bold text-xl text-gray-900">
                    {promotion.name}
                  </h4>
                  <p className="text-gray-600 mt-2">
                    {promotion.description}
                  </p>
                </div>
                <Button
                  className="mt-4 md:mt-0 md:ml-6 shrink-0"
                  onClick={() => handleParticipate(promotion.id)}
                  disabled={participateMutation.isPending}
                >
                  {participateMutation.isPending
                    ? 'Registering...'
                    : 'Participate'}
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="h-5 w-5 mr-3 text-red-500" />
                  <span className="font-semibold mr-2">Type:</span>
                  <Badge variant="secondary">{promotion.promotionType}</Badge>
                </div>
                {promotion.promotionScope && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheck className="h-5 w-5 mr-3 text-red-500" />
                    <span className="font-semibold mr-2">Scope:</span>
                    <Badge variant="outline">
                      {promotion.promotionScope}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-red-500" />
                  <span className="font-semibold mr-2">
                    Promotion Period:
                  </span>
                  <span>
                    {formatDate(promotion.beginDate)} -{' '}
                    {formatDate(promotion.endDate)}
                  </span>
                </div>
              </div>

              {promotion.termsAndConditions && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500">
                    <strong>Terms & Conditions:</strong>{' '}
                    {promotion.termsAndConditions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg mt-6">
          <h4 className="text-lg font-semibold text-gray-700">
            No Promotions Available
          </h4>
          <p className="text-gray-500 mt-2">
            This product does not have any active promotions at the moment.
            Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default LoyaltyContent;
