'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const ContactMap = dynamic(() => import('@/components/ContactMap'), {
  ssr: false,
});

const ContactUsPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Header Section */}
      <motion.section
        className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl">
            We&apos;d love to hear from you. Reach out with any questions or
            feedback.
          </p>
        </div>
      </motion.section>

      {/* Contact Form and Info Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            className="bg-white p-8 rounded-lg shadow-md"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-6">Send a Message</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border rounded-lg"
                  placeholder="Your Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border rounded-lg"
                  placeholder="Your Email"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block mb-2 font-semibold"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Your Message"
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="bg-[#f58220] text-white font-bold py-3 px-6 rounded-lg w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="text-[#f58220] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-xl">Phone</h3>
                  <p>+(323) 750-1234</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="text-[#f58220] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-xl">Email</h3>
                  <p>hello@mcommall.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="text-[#f58220] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-xl">Address</h3>
                  <p>7011 Vermont Ave, Los Angeles, CA 90044</p>
                </div>
              </div>
              <div className="mt-8">
                <ContactMap />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactUsPage;
