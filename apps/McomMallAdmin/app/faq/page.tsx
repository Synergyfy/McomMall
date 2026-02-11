'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Footer from '@/components/Footer';

const faqs = [
  {
    question: 'What is McomMall?',
    answer:
      'McomMall is a comprehensive directory designed to help you discover local businesses, services, and amenities in your area. From restaurants to real estate, we connect you with your community.',
  },
  {
    question: 'How do I list my business on McomMall?',
    answer:
      'You can add your business by clicking the "Add Listing" button, usually found in the header or on your dashboard. Follow the steps to provide your business details, and once approved, your listing will be live.',
  },
  {
    question: 'Is there a fee to list my business?',
    answer:
      'We offer various listing plans, including a free basic plan. For more features and visibility, we have premium plans available. Please visit our Pricing page for more details.',
  },
  {
    question: 'How can I claim an existing business listing?',
    answer:
      'If your business is already listed, you can claim it by navigating to the listing page and clicking the "Claim Business" link. You will need to verify your ownership of the business.',
  },
  {
    question: 'Can I advertise on McomMall?',
    answer:
      'Yes, we offer several advertising options, including featured ads and banner placements, to help you reach a larger audience. Please contact our marketing team for more information.',
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold">{q}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-gray-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FaqPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      <motion.section
        className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl">
            Find answers to common questions about McomMall.
          </p>
        </div>
      </motion.section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          {faqs.map((faq, index) => (
            <FaqItem key={index} q={faq.question} a={faq.answer} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FaqPage;
