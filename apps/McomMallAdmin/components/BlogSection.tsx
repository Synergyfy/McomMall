'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: 'Experience In The Spotlight',
    excerpt: 'Nam nisl lacus, dignissim ac tristique ut, scelerisque eu massa. Vestibulum ligula nunc, rutrum in...',
    image: 'https://ext.same-assets.com/1310083762/1528933178.jpeg',
    category: 'Tips',
    date: 'February 1, 2024',
    categoryColor: 'bg-red-500'
  },
  {
    id: 2,
    title: '7 Big Ideas For Small Places',
    excerpt: 'Nam nisl lacus, dignissim ac tristique ut, scelerisque eu massa. Vestibulum ligula nunc, rutrum in...',
    image: 'https://ext.same-assets.com/1310083762/1187327787.jpeg',
    category: 'Room Design',
    date: 'January 22, 2024',
    categoryColor: 'bg-red-500'
  },
  {
    id: 3,
    title: 'Top 20 Places to Stay in Europe',
    excerpt: 'Dignissim ac tristique ut, scelerisque eu massa. Vestibulum ligula nunc, rutrum in malesuada vitae, tempus...',
    image: 'https://ext.same-assets.com/1310083762/2908170453.jpeg',
    category: 'Tips',
    date: 'January 1, 2024',
    categoryColor: 'bg-red-500'
  }
];

export default function BlogSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            From The Blog
          </h2>
          <div className="w-16 h-1 bg-red-500 mx-auto"></div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={240}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Category Badge */}
                <Badge className={`absolute top-4 left-4 ${post.categoryColor} text-white`}>
                  {post.category}
                </Badge>

                {/* Date Badge */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  {post.date}
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {post.excerpt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Blog Button */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8"
          >
            View Blog
          </Button>
        </div>
      </div>
    </section>
  );
}
