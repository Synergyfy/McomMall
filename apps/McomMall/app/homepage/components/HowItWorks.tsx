'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LazyYouTubeVideo from '@/app/components/LazyYouTubeVideo';

// Main data for the cards
const cardsData = [
  {
    title: 'For Service Providers',
    features: [
      'Showcase your services to a wider audience.',
      'Connect with businesses and consumers directly.',
      'Grow your client base with loyalty and referral programmes.',
    ],
  },
  {
    title: 'For Product Sellers',
    features: [
      'List your business and reach ready-to-buy customers.',
      'Promote your brand with seasonal campaigns.',
      'Build loyalty, join B2B exchange, and grow with MCOM.',
    ],
  },
  {
    title: 'For Consumers',
    features: [
      'Browse shops, services, offers, and rewards.',
      'Enjoy vouchers, loyalty rewards, and seasonal deals.',
      'Support local businesses and explore new experiences.',
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
    <section className="bg-gray-50 font-sans py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
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
        {/* Main Content */}
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Left side: Video */}
          <motion.div
            className="w-full md:w-1/2 mb-8 md:mb-0"
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-w-16 aspect-h-9 rounded-2xl shadow-lg overflow-hidden">
              <LazyYouTubeVideo
                videoId="jNQXAC9IVRw"
                title="MCOM Mall Overview"
              />
            </div>
            {/* Buttons Section */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4"
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
          </motion.div>

          {/* Right side: Cards */}
          <motion.div
            className="w-full md:w-1/2 flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {cardsData.slice(0, 2).map((card, index) => (
                <motion.div
                  key={index}
                  className={`bg-white p-6 border border-orange-600 flex-1 ${
                    index === 0
                      ? 'rounded-tl-2xl rounded-br-2xl'
                      : 'rounded-tr-2xl rounded-bl-2xl'
                  }`}
                  variants={itemVariants}
                >
                  <h3 className="text-xl font-bold text-orange-600 mb-4">
                    {card.title}
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    {card.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-orange-500 mr-2 mt-1">
                          &#8226;
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center">
              <motion.div
                className="bg-white p-6 border border-orange-600 rounded-tl-2xl rounded-br-2xl w-full sm:w-auto sm:min-w-[50%]"
                variants={itemVariants}
              >
                <h3 className="text-xl font-bold text-orange-600 mb-4">
                  {cardsData[2].title}
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {cardsData[2].features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-1">
                        &#8226;
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksRedesigned;
