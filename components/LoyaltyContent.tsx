'use client';

import { InHouseBusiness } from '@/service/listings/types';
import { GooglePlaceResult } from '@/service/listings/types';
import { useCheckPromotions } from '@/service/promotions/hook';
import { Button } from './ui/button';

const LoyaltyContent = ({
  listing,
}: {
  listing: GooglePlaceResult | InHouseBusiness;
}) => {
  function isGoogleResult(
    listing: GooglePlaceResult | InHouseBusiness
  ): listing is GooglePlaceResult {
    return 'placeId' in listing;
  }
  const isGoogle = isGoogleResult(listing);

  const {
    data: promotions,
    isLoading,
    isError,
  } = useCheckPromotions({
    businessId: isGoogle ? undefined : listing.id,
  });

  if (isGoogle) {
    return null;
  }

  if (isLoading) {
    return <p>Loading promotions...</p>;
  }

  if (isError) {
    return <p>Error loading promotions.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold border-t pt-6">
        Loyalty & Reward Program
      </h3>
      {promotions && promotions.length > 0 ? (
        <ul className="space-y-4 mt-4">
          {promotions.map(promotion => (
            <li key={promotion.id} className="border p-4 rounded-lg">
              <h4 className="font-semibold text-lg">{promotion.name}</h4>
              <p className="text-gray-600">{promotion.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {promotion.termsAndConditions}
              </p>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() =>
                    console.log(
                      'Participate button clicked for promotion:',
                      promotion.id
                    )
                  }
                >
                  Participate
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No promotions available for this business at the moment.</p>
      )}
    </div>
  );
};

export default LoyaltyContent;
