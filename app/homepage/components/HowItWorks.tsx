'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';

// Main data for the cards, with YouTube video URLs
const cardsData = [
  {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'For Business Owners',
    features: [
      'List your business and reach ready-to-buy customers.',
      'Promote your brand with seasonal campaigns.',
      'Build loyalty, join B2B exchange, and grow with MCOM.',
    ],
  },
  {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // A placeholder for "Chilled Serenity"
    title: 'For Consumers',
    features: [
      'Browse shops, services, offers, and rewards.',
      'Enjoy vouchers, loyalty rewards, and seasonal deals.',
      'Support local businesses and explore new experiences.',
    ],
  },
  {
    videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    title: 'For Service Providers',
    features: [
      'Showcase your services to a wider audience.',
      'Connect with businesses and consumers directly.',
      'Grow your client base with loyalty and referral programmes.',
    ],
  },
];

// Main component
const HowItWorksRedesigned = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <section className="bg-gray-50 font-sans py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            How MCOM Mall Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Whether you are a business, a consumer, or a service provider, MCOM
            Mall has something for you.
          </p>
        </div>
        {/* Steps Container */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cardsData.map((card, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              variants={itemVariants}
            >
              <div className="aspect-video relative bg-black">
                <iframe
                  src={card.videoUrl}
                  title={card.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-orange-600 mb-4">
                  {card.title}
                </h3>
                <ul className="space-y-3 text-gray-600 flex-grow">
                  {card.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-1">&#8226;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons Section */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button className="w-full sm:w-auto flex items-center justify-center text-lg font-semibold text-white bg-orange-600 rounded-lg px-8 py-4 transition-all duration-300 hover:bg-orange-700 hover:shadow-xl transform hover:scale-105 shadow-orange-300">
            Start Exploring
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksRedesigned;
