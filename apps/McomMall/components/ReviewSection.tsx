// app/components/listing-detail/ReviewsSection.tsx
'use client';
import type { Review, RatingBreakdown } from '@/lib/listing-data';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, HelpCircle } from 'lucide-react';
import StarRating from './StarRating';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// A small component for the rating breakdown bars
function RatingBar({ label, value }: { label: string; value: number }) {
  const progressColor =
    value >= 4 ? 'bg-green-500' : value >= 2.5 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center text-sm text-gray-600">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 ml-1 text-gray-400 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Rating for {label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-semibold">{value.toFixed(1)}</span>
      </div>
      <Progress
        value={value * 20}
        className="h-2 [&>*]:bg-none"
        style={{ '--progress-color': progressColor } as React.CSSProperties}
      />
    </div>
  );
}

// Main Reviews Component
export default function ReviewsSection({
  reviews,
  overallRating,
  breakdown,
}: {
  reviews: Review[];
  overallRating: number;
  breakdown: RatingBreakdown;
}) {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center justify-center text-center border-r-0 md:border-r pr-8">
            <p className="text-sm text-gray-500">out of 5.0</p>
            <p className="text-6xl font-bold my-2">
              {overallRating.toFixed(1)}
            </p>
            <StarRating rating={overallRating} />
          </div>
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <RatingBar label="Service" value={breakdown.service} />
            <RatingBar
              label="Value for Money"
              value={breakdown.valueForMoney}
            />
            <RatingBar label="Location" value={breakdown.location} />
            <RatingBar label="Cleanliness" value={breakdown.cleanliness} />
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews List */}
      <div className="space-y-8">
        {reviews.map(review => (
          <div key={review.id} className="border-t pt-8">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={review.avatarUrl} alt={review.author} />
                  <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold">{review.author}</h4>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-4 text-gray-700 pl-16">{review.comment}</p>
            <div className="pl-16 mt-4">
              <Button variant="outline" size="sm" className="font-normal">
                <ThumbsUp className="h-4 w-4 mr-2" /> Helpful Review |{' '}
                {review.helpfulCount}
              </Button>
            </div>

            {/* Owner Reply */}
            {review.reply && (
              <div className="relative pl-16 mt-6 ml-8">
                <div className="absolute top-0 bottom-0 -left-6 w-px bg-gray-200"></div>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={review.reply.avatarUrl}
                      alt={review.reply.author}
                    />
                    <AvatarFallback>O</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold">{review.reply.author}</h4>
                    <p className="text-sm text-gray-500">{review.reply.date}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 pl-16">
                  {review.reply.comment}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
