'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

const TermsAndConditionsPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <div className="bg-gray-50 text-gray-800">
        <motion.section
          className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg md:text-xl">
              Please read our terms and conditions carefully.
            </p>
          </div>
        </motion.section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p>
                Welcome to McomMall. These are the terms and conditions governing
                your access to and use of the website McomMall and its related
                sub-domains, sites, services, and tools.
              </p>
            </motion.div>
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold mb-4">
                2. User Account
              </h2>
              <p>
                If you use the Site, you are responsible for maintaining the
                confidentiality of your account and password and for restricting
                access to your computer, and you agree to accept responsibility
                for all activities that occur under your account or password.
              </p>
            </motion.div>
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold mb-4">3. Privacy</h2>
              <p>
                Please review our Privacy Policy, which also governs your visit
                to the Site, to understand our practices. The personal
                information / data provided to us by you or your use of the Site
                will be treated as strictly confidential, in accordance with the
                Privacy agreement and applicable laws and regulations.
              </p>
            </motion.div>
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold mb-4">
                4. Governing Law
              </h2>
              <p>
                These Terms and Conditions shall be governed by and construed in
                accordance with the laws of the United Kingdom.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditionsPage;
