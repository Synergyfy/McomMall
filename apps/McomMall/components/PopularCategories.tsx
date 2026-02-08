'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Home,
  Car,
  Megaphone,
  UserCheck,
  Utensils,
  Calendar,
} from 'lucide-react';

const categories = [
  {
    icon: Home,
    name: 'Apartments',
    count: 2,
    color: 'text-red-400',
  },
  {
    icon: Car,
    name: 'Cars',
    count: 1,
    color: 'text-red-400',
  },
  {
    icon: Megaphone,
    name: 'Classifieds',
    count: 1,
    color: 'text-red-400',
  },
  {
    icon: UserCheck,
    name: 'Coaching',
    count: 1,
    color: 'text-red-400',
  },
  {
    icon: Utensils,
    name: 'Eat & Drink',
    count: 1,
    color: 'text-red-400',
  },
  {
    icon: Calendar,
    name: 'Events',
    count: 1,
    color: 'text-red-400',
  },
];

export default function PopularCategories() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-medium text-gray-900 mb-2">
            Popular Categories
          </h2>
          <div className="w-12 h-1 bg-red-500 mx-auto"></div>
        </div>

        {/* Categories Grid */}
        <div className="flex items-center justify-center gap-4 w-full mx-auto">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-md transition-all duration-300 cursor-pointer border-0 bg-[#f8f8f8] h-[12rem] w-[11rem] rounded-none"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <IconComponent className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <span className="text-gray-500">{category.count}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
