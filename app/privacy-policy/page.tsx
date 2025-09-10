'use client';
import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl">
            Your privacy is important to us. Last updated: 12th August 2024.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="py-16 max-w-4xl mx-auto px-4"
        variants={sectionVariant}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariant} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p>
            Welcome to McomMall. We are committed to protecting your personal
            information and your right to privacy. If you have any questions or
            concerns about our policy, or our practices with regards to your
            personal information, please contact us at privacy@mcommall.com.
          </p>
        </motion.div>

        <motion.div variants={itemVariant} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            2. Information We Collect
          </h2>
          <p>
            We collect personal information that you voluntarily provide to us
            when you register on the website, express an interest in obtaining
            information about us or our products and services, when you
            participate in activities on the website or otherwise when you
            contact us.
          </p>
        </motion.div>

        <motion.div variants={itemVariant} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            3. How We Use Your Information
          </h2>
          <p>
            We use personal information collected via our website for a variety
            of business purposes described below. We process your personal
            information for these purposes in reliance on our legitimate
            business interests, in order to enter into or perform a contract
            with you, with your consent, and/or for compliance with our legal
            obligations.
          </p>
        </motion.div>

        <motion.div variants={itemVariant} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            4. Will Your Information Be Shared With Anyone?
          </h2>
          <p>
            We only share information with your consent, to comply with laws, to
            provide you with services, to protect your rights, or to fulfill
            business obligations.
          </p>
        </motion.div>

        <motion.div variants={itemVariant}>
          <h2 className="text-2xl font-bold mb-4">
            5. How to Contact Us About This Policy
          </h2>
          <p>
            If you have questions or comments about this policy, you may email
            us at privacy@mcommall.com or by post to: 7011 Vermont Ave, Los
            Angeles, CA 90044.
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default PrivacyPolicyPage;
