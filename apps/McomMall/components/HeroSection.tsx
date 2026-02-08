'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Utensils, Home, Briefcase, Calendar } from 'lucide-react';
import TypingEffect from './Typing';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://ext.same-assets.com/1310083762/4037573813.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Main Heading */}
        <div className="mb-12">
          <div className="flex justify-center items-center mb-4 gap-2 text-5xl md:text-6xl font-normal ">
            <h1 className="">Find Nearby </h1>
            <TypingEffect />
          </div>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Explore top-rated attractions, activities and more!
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg p-2 shadow-xl flex flex-col md:flex-row gap-2">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="What are you looking for?"
                className="border-0 text-gray-900 placeholder-gray-500 h-12 text-lg"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Location"
                  className="border-0 text-gray-900 placeholder-gray-500 h-12 text-lg pl-10"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="flex-1">
              <Select>
                <SelectTrigger className="border-0 h-12 text-lg text-gray-900">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="restaurants">Restaurants</SelectItem>
                  <SelectItem value="hotels">Hotels</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white px-8 h-12 text-lg font-semibold"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Browse Categories */}
        <div className="text-center mb-8">
          <p className="text-lg mb-6 text-gray-200">
            Or browse featured categories:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge
              variant="secondary"
              className="bg-gray-800/60 text-white border border-gray-600 px-4 py-2 text-sm hover:bg-gray-700/60 cursor-pointer"
            >
              <Utensils className="w-4 h-4 mr-2" />
              Eat & Drink
            </Badge>
            <Badge
              variant="secondary"
              className="bg-gray-800/60 text-white border border-gray-600 px-4 py-2 text-sm hover:bg-gray-700/60 cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Apartments
            </Badge>
            <Badge
              variant="secondary"
              className="bg-gray-800/60 text-white border border-gray-600 px-4 py-2 text-sm hover:bg-gray-700/60 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Services
            </Badge>
            <Badge
              variant="secondary"
              className="bg-gray-800/60 text-white border border-gray-600 px-4 py-2 text-sm hover:bg-gray-700/60 cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
