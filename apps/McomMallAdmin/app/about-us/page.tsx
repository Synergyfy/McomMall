'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Eye } from 'lucide-react';
import Footer from '@/components/Footer';

const AboutUsPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            variants={fadeIn}
          >
            About McomMall
          </motion.h1>
          <motion.p className="text-lg md:text-xl" variants={fadeIn}>
            Your one-stop destination for discovering the best amenities and
            services in your neighborhood.
          </motion.p>
        </div>
      </motion.section>

      {/* Our Mission & Vision Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="mb-4">
              To connect communities by making local businesses more accessible
              to everyone. We aim to empower small businesses and provide a
              platform for them to thrive in the digital age.
            </p>
            <div className="flex items-center text-lg">
              <Target className="text-[#f58220] mr-3" size={24} />
              <span>Empowering local economies</span>
            </div>
          </motion.div>
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="mb-4">
              To be the most trusted and comprehensive local business directory
              that not only lists businesses but also fosters a sense of
              community and discovery.
            </p>
            <div className="flex items-center text-lg">
              <Eye className="text-[#f58220] mr-3" size={24} />
              <span>Fostering community and discovery</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'John Doe', role: 'CEO & Founder' },
              { name: 'Jane Smith', role: 'Chief Marketing Officer' },
              { name: 'Sam Wilson', role: 'Lead Developer' },
              { name: 'Emily Brown', role: 'Head of UX/UI' },
            ].map((member, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow bg-gray-50"
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
              >
                <Users className="mx-auto text-[#f58220] mb-4" size={48} />
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
