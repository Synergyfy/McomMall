'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, CheckCircle2, Video, Layers, Users, ShoppingBag } from 'lucide-react';
import LazyYouTubeVideo from '@/app/components/LazyYouTubeVideo';

const cardsData = [
  {
    title: 'For Service Providers',
    Icon: Users,
    glowColor: 'group-hover:border-orange-500/40 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]',
    iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    dotBg: 'bg-orange-500 shadow-[0_0_10px_#f97316]',
    features: [
      'Showcase your services to a highly engaged local audience.',
      'Connect directly with active businesses and consumers.',
      'Grow your client base with premium loyalty and referral programs.',
    ],
  },
  {
    title: 'For Product Sellers',
    Icon: ShoppingBag,
    glowColor: 'group-hover:border-orange-500/40 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]',
    iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    dotBg: 'bg-orange-500 shadow-[0_0_10px_#f97316]',
    features: [
      'List your business catalog and reach ready-to-buy customers.',
      'Promote your seasonal collections and targeted brand campaigns.',
      'Build long-term loyalty and trade through our B2B exchange network.',
    ],
  },
  {
    title: 'For Local Consumers',
    Icon: Layers,
    glowColor: 'group-hover:border-orange-500/40 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]',
    iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    dotBg: 'bg-orange-500 shadow-[0_0_10px_#f97316]',
    features: [
      'Browse verified shops, premium services, and real-time offers.',
      'Enjoy exclusive vouchers, loyalty points, and custom rewards.',
      'Support local merchants and explore highly-rated neighborhood gems.',
    ],
  },
];

const HowItWorksRedesigned = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="bg-white font-sans py-16 md:py-24 px-5 sm:px-6 relative overflow-hidden border-b border-slate-100">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.02),transparent_40%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold tracking-wider font-mono">
            <span>PLATFORM PIPELINE</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            A Unified Hub for <span className="text-orange-500">Every Commerce Partner</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
            McomMall provides an enterprise ecosystem designed to streamline listings, scale services, and drive customer returns.
          </p>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          
          {/* Left Column: Video Preview and CTA */}
          <motion.div
            className="lg:col-span-6 flex flex-col justify-between"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-6">
              
              {/* Media Card Shell */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 opacity-15 blur-lg pointer-events-none group-hover:opacity-25 transition-all" />
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                  <LazyYouTubeVideo
                    videoId="jNQXAC9IVRw"
                    title="MCOM Mall Overview"
                  />
                </div>
              </div>

              {/* Explanatory subtitle */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 space-y-2 text-left">
                <div className="flex items-center gap-2 font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  <Video size={12} className="text-orange-500" />
                  <span>DEMO PLAYGROUND VIDEO</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Watch this overview to see how merchants sync terminals, launch active loyalty cashback campaigns, and audit inventory in real-time.
                </p>
              </div>

            </div>

            <div className="pt-8">
              <button className="w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98">
                <span>Configure Platform Access</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Steps/Guides Cards */}
          <motion.div
            className="lg:col-span-6 flex flex-col gap-5 justify-between"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {cardsData.map((card, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 flex items-start gap-4 sm:gap-5 relative transition-all duration-300 ${card.glowColor}`}
              >
                {/* Connector pipeline dot */}
                <div className="absolute top-7 -left-[1.625rem] hidden lg:block w-3 h-3 rounded-full border border-white bg-slate-200 z-20 group-hover:scale-125 transition-transform">
                  <div className={`w-full h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${card.dotBg}`} />
                </div>

                {/* Left Side: Icon */}
                <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <card.Icon size={18} />
                </div>

                {/* Right Side: Features and Title */}
                <div className="space-y-3.5 flex-1 text-left">
                  <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex justify-between items-center">
                    <span>{card.title}</span>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest">MODULE 0{index + 1}</span>
                  </h3>
                  
                  <ul className="space-y-2">
                    {card.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-500 font-normal leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksRedesigned;
