'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, Users, ArrowRight, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function GetStartedPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0500] text-white selection:bg-orange-500 selection:text-white font-sans">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-600/20 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-red-500/15 rounded-full blur-[110px] animate-pulse delay-1000" />
        <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-amber-600/15 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 md:px-8">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto flex flex-col items-center"
        >

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-20 max-w-4xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-bold tracking-wide text-orange-300 uppercase bg-orange-900/40 border border-orange-700/50 rounded-full backdrop-blur-md shadow-lg shadow-orange-900/20">
              <Sparkles className="w-4 h-4" />
              Welcome to the Future of Commerce
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-orange-50 to-orange-200 drop-shadow-sm">
              How will you <br className="hidden md:block" />
              use <span className="text-orange-500 inline-block transform hover:scale-105 transition-transform duration-300 cursor-default">McomMall</span>?
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
              Join thousands of users building the next generation marketplace.
              Select your role to get started with a tailored experience.
            </p>
          </motion.div>

          {/* Cards Container */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1400px]"
          >

            {/* Shopper Card */}
            <Link href="/signup" className="group w-full block h-full">
              <motion.div
                variants={itemVariants}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  boxShadow: '0 30px 60px -10px rgba(234, 88, 12, 0.25)', // Stronger Orange shadow
                  borderColor: 'rgba(251, 146, 60, 0.5)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className="h-full relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/15 flex flex-col justify-between min-h-[420px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div>
                  <div className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/20">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Shop & Discover</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-8 font-medium">
                    Find unique products, enjoy secure transactions, and get the best deals from top-rated sellers worldwide.
                  </p>
                </div>

                <div className="flex items-center text-orange-400 text-lg font-bold group-hover:translate-x-2 transition-transform">
                  Create Shopper Account <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </motion.div>
            </Link>

            {/* Merchant Card */}
            <Link href="/signup" className="group w-full block h-full">
              <motion.div
                variants={itemVariants}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  boxShadow: '0 30px 60px -10px rgba(239, 68, 68, 0.25)', // Red shadow
                  borderColor: 'rgba(248, 113, 113, 0.5)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className="h-full relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/15 flex flex-col justify-between min-h-[420px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div>
                  <div className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/20">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Sell & Grow</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-8 font-medium">
                    Launch your store in minutes. Access powerful tools, analytics, and a global audience to scale your business.
                  </p>
                </div>

                <div className="flex items-center text-red-400 text-lg font-bold group-hover:translate-x-2 transition-transform">
                  Become a Merchant <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </motion.div>
            </Link>

            {/* Affiliate Card */}
            <Link href="/affiliate" className="group w-full block h-full">
              <motion.div
                variants={itemVariants}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  boxShadow: '0 30px 60px -10px rgba(245, 158, 11, 0.25)', // Amber shadow
                  borderColor: 'rgba(251, 191, 36, 0.5)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className="h-full relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/15 flex flex-col justify-between min-h-[420px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div>
                  <div className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/20">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Promote & Earn</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-8 font-medium">
                    Join our affiliate network. Share products you love and earn attractive commissions for every sale.
                  </p>
                </div>

                <div className="flex items-center text-amber-400 text-lg font-bold group-hover:translate-x-2 transition-transform">
                  Join as Affiliate <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </motion.div>
            </Link>

          </motion.div>

          {/* Footer Area */}
          <motion.div variants={itemVariants} className="mt-24 text-center">
            <p className="text-gray-500 mb-6 text-lg">
              Already have an account?{' '}
              <Link href="/signin" className="text-white hover:text-orange-400 font-bold transition-colors">
                Sign In
              </Link>
            </p>
            <div className="flex items-center justify-center gap-8 text-sm font-medium text-gray-600">
              <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
              <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
