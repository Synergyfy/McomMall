'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    content: "Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation is on the runway",
    author: "Jennie Smith",
    role: "Coffee Shop Owner",
    avatar: "https://ext.same-assets.com/1310083762/1027062096.jpeg",
    bgColor: "bg-red-500"
  },
  {
    id: 2,
    content: "Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking the overall proposition",
    author: "Jack Paden",
    role: "Restaurant Owner",
    avatar: "https://ext.same-assets.com/1310083762/1491620308.jpeg",
    bgColor: "bg-red-500"
  }
];

export default function UserReviews() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <div className="w-16 h-1 bg-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            We collect reviews from our users so you can get an honest opinion of what an experience with our website are really like!
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          {reviews.map((review) => (
            <div key={review.id} className="relative">
              {/* Quote Card */}
              <Card className={`${review.bgColor} text-white border-0 shadow-lg relative z-10`}>
                <CardContent className="p-8">
                  <Quote className="w-8 h-8 mb-4 opacity-80" />
                  <p className="text-lg leading-relaxed">
                    {review.content}
                  </p>

                  {/* Arrow pointing down */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className={`w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent ${review.bgColor.replace('bg-', 'border-t-')}`}></div>
                  </div>
                </CardContent>
              </Card>

              {/* Author Info */}
              <div className="flex flex-col items-center mt-12 relative z-20">
                <Avatar className="w-20 h-20 mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={review.avatar} alt={review.author} />
                  <AvatarFallback>{review.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h4 className="text-xl font-semibold text-gray-900 mb-1">
                  {review.author}
                </h4>
                <p className="text-gray-500">
                  {review.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </section>
  );
}
