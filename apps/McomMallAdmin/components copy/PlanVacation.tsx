'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MapPin, MessageSquare, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: 'Find Interesting Place',
    description: 'You can search for areas of interest, local events, trendy restaurants or just things to do.',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500'
  },
  {
    icon: MessageSquare,
    title: 'Check Reviews',
    description: 'Determine the quality of goods and services from local shops and choose the best place.',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500'
  },
  {
    icon: CheckCircle,
    title: 'Make a Reservation',
    description: 'Contact listing owner and reserve a table online for lunch or dinner or rent an apartment.',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500'
  }
];

export default function PlanVacation() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Plan The Vacation of Your Dreams
          </h2>
          <div className="w-16 h-1 bg-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Explore some of the best tips from around the world from our partners and friends. Discover some of the most popular listings!
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card
                key={index}
                className="group text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className={`w-20 h-20 mx-auto mb-6 ${step.bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-10 h-10 ${step.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
