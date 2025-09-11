'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

const blogPosts = [
  {
    title: 'How To Find The Best Food Restaurant In Adlin',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto-format&fit=crop',
    excerpt:
      'Discover the hidden culinary gems in Adlin. This guide will walk you through the best spots to eat, from fine dining to street food.',
  },
  {
    title: 'Best Winter Collection In Adlin In 2022',
    category: 'Collection',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1572804013427-4d714e280592?q=80&w=800&auto-format&fit=crop',
    excerpt:
      'Stay warm and stylish this winter with our top picks for the best winter collections available from local boutiques in Adlin.',
  },
  {
    title: 'Best Watch Listed In 2022',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto-format&fit=crop',
    excerpt:
      'A look at the most exquisite timepieces listed on McomMall this year. From classic designs to modern marvels.',
  },
  {
    title: 'Best Racing Car Listed In 2022',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1553440569-99424e1bf07c?q=80&w=800&auto-format&fit=crop',
    excerpt:
      'For the thrill-seekers, here are the fastest and most beautiful racing cars listed on our platform in 2022.',
  },
  {
    title: 'Exploring the Local Art Scene',
    category: 'Community',
    date: '22 Oct, 2022',
    image:
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=800&auto-format&fit=crop',
    excerpt:
      'Dive into the vibrant local art scene. We feature the best galleries and artist studios you can find in the area.',
  },
  {
    title: 'A Guide to Local Parks and Recreation',
    category: 'Lifestyle',
    date: '15 Sep, 2022',
    image:
      'https://images.unsplash.com/photo-1531214159280-079b95d26189?q=80&w=800&auto-format&fit=crop',
    excerpt:
      'Get outdoors and explore the beautiful parks and recreational spots right in your neighborhood.',
  },
];

const BlogPage = () => {
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      <motion.section
        className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Blog</h1>
          <p className="text-lg md:text-xl">
            Insights, stories, and updates from the McomMall team.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="py-16 max-w-7xl mx-auto px-4"
        variants={containerVariant}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-md overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300"
              variants={itemVariant}
            >
              <div className="relative">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  {post.date}
                </div>
              </div>
              <div className="p-6">
                <span className="text-gray-500 text-sm font-semibold">
                  {post.category}
                </span>
                <h3 className="font-bold text-xl mt-2 mb-3 h-16">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 h-24 overflow-hidden">
                  {post.excerpt}
                </p>
                <Link
                  href="#"
                  className="text-[#f58220] font-semibold hover:underline"
                >
                  Read More &rarr;
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      <Footer />
    </div>
  );
};

export default BlogPage;
