'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUp, CheckCircle2, Store, TrendingUp,
  Users, Zap, ShieldCheck, BarChart2, CreditCard, Gift, MapPin, Map, BadgeCheck, Search, ChevronDown
} from 'lucide-react';
import HeroImage from '@/public/hero.jpg';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Footer = dynamic(() => import('@/components/Footer'));

export default function BusinessLandingPage() {
  const router = useRouter();
  const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000';
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [postcodeQuery, setPostcodeQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mockSuggestions = ['EC1A 1BB', 'W1A 0AX', 'M1 1AE', 'B1 1AA'];

  useEffect(() => {
    const checkScroll = () => {
      setShowBackToTop(window.pageYOffset > 400);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="bg-white text-slate-800 font-sans relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
      <main>

        {/* ========== HERO ========== */}
        <section className="relative min-h-[100svh] flex items-center justify-center w-full overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0">
            <Image src={HeroImage} fill className="object-cover" priority alt="McomMall Business" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80" />
          </div>

          <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-20 text-center text-white">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs font-bold tracking-wide backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                For Business Owners
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
            >
              Grow Your Business on{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                McomMall
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-200 max-w-xl mx-auto mb-10 leading-relaxed"
            >
              List your products, reach local customers, launch cashback campaigns, and join your local high street digital mall — all from one platform.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href={`${solutionsUrl}/getstarted/business?source=mcommall`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-orange-500/25 transition-all active:scale-95 text-base uppercase tracking-wider"
              >
                Create Merchant Account
                <ArrowRight size={18} />
              </a>
              <Link
                href="/getstarted"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white/80 hover:text-white border border-white/20 hover:border-white/40 font-semibold py-4 px-8 rounded-2xl transition-all text-sm"
              >
                Explore Plans
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-12"
            >
              <div className="flex items-center gap-2">
                <Users size={14} className="text-orange-400" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-300">10K+ PARTNERS</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-orange-400" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-300">VERIFIED</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-orange-400" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-300">INSTANT SETUP</span>
              </div>
            </motion.div>
          </div>

          {/* Wave */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[35px] md:h-[50px] fill-white">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,105.3,117.82,108,176.62,101.52,235.43,95,294.24,83.4,321.39,56.44Z" />
            </svg>
          </div>
        </section>

        {/* ========== REGIONAL AVAILABILITY ========== */}
        <section className="py-16 bg-slate-50 border-b border-slate-100 relative z-20">
          <div className="max-w-xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Regional Availability
                </h3>
                <BadgeCheck className="w-6 h-6 text-amber-500" />
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Store size={14} className="stroke-[2.5]" />
                  <span className="text-xs font-bold tracking-wide uppercase">High Street</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                  <MapPin size={14} className="stroke-[2.5]" />
                  <span className="text-xs font-bold tracking-wide uppercase">Hyperlocal</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  <Map size={14} className="stroke-[2.5]" />
                  <span className="text-xs font-bold tracking-wide uppercase">Nearby</span>
                </div>
              </div>

              <div className="relative">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter Business Postcode..."
                      value={postcodeQuery}
                      onChange={(e) => {
                        setPostcodeQuery(e.target.value);
                        setShowSuggestions(e.target.value.length > 1);
                      }}
                      onFocus={() => {
                        if (postcodeQuery.length > 1) setShowSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm font-medium text-slate-700"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <button 
                    onClick={() => window.location.href = `${solutionsUrl}/getstarted/business?source=mcommall`}
                    className="h-12 px-8 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors text-sm shadow-md"
                  >
                    Check
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {mockSuggestions.filter(s => s.toLowerCase().includes(postcodeQuery.toLowerCase())).length > 0 ? (
                        <div className="py-2">
                          {mockSuggestions
                            .filter(s => s.toLowerCase().includes(postcodeQuery.toLowerCase()))
                            .map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => {
                                  setPostcodeQuery(suggestion);
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 transition-colors"
                              >
                                <MapPin size={14} className="text-slate-400" />
                                {suggestion}
                              </button>
                            ))}
                        </div>
                      ) : (
                        <div className="px-4 py-4 text-sm text-slate-500 text-center">
                          No postcodes found.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>


        {/* ========== WHAT YOU GET — 6 pillars ========== */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-orange-500 font-bold uppercase tracking-[0.2em] text-xs">Everything You Need</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
                One Platform. Total Control.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Store, title: 'Digital Storefront', desc: 'List your products and services with a premium, searchable merchant profile.' },
                { icon: TrendingUp, title: 'Cashback Engine', desc: 'Launch cashback campaigns that bring customers back — and keep them loyal.' },
                { icon: Users, title: 'High Street Mall', desc: 'Join your local high street digital mall and be discovered by nearby consumers.' },
                { icon: Gift, title: 'Branded eGift Cards', desc: 'Issue custom eGift cards with your brand. Drive gifting and repeat purchases.' },
                { icon: BarChart2, title: 'Stock Audit Tools', desc: 'Real-time inventory tracking and operational audits built right in.' },
                { icon: CreditCard, title: 'Virtual Business Card', desc: 'A dynamic VCard bio that connects your digital and physical presence.' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group p-6 rounded-2xl border border-slate-100 hover:border-orange-200 bg-white hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-500/10 border border-orange-100 group-hover:border-orange-200 flex items-center justify-center mb-5 transition-colors">
                    <item.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* ========== SOCIAL PROOF STRIP ========== */}
        <section className="py-14 bg-slate-50 border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { value: '10,000+', label: 'Business Partners' },
                { value: '£2.4M', label: 'Cashback Distributed' },
                { value: '50+', label: 'High Streets Live' },
                { value: '4.8★', label: 'Merchant Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========== HOW IT WORKS — 3 steps ========== */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-orange-500 font-bold uppercase tracking-[0.2em] text-xs">Simple Setup</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
                Live in 3 Steps
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { step: '01', title: 'Create Your Account', desc: 'Sign up as a business owner in under 2 minutes. Enter your postcode and get placed on your local high street.' },
                { step: '02', title: 'Set Up Your Store', desc: 'Add products, services, and listing details. Configure your cashback rates and loyalty rewards.' },
                { step: '03', title: 'Start Earning', desc: 'Get discovered by nearby customers. Launch geo-targeted campaigns. Watch your revenue grow.' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-5 p-6 rounded-2xl border border-slate-100 hover:border-orange-200 bg-white hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Repeat CTA */}
            <div className="text-center mt-14">
              <a
                href={`${solutionsUrl}/getstarted/business?source=mcommall`}
                className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-orange-500/25 transition-all active:scale-95 text-base uppercase tracking-wider"
              >
                Get Started Free
                <ArrowRight size={18} />
              </a>
              <p className="text-xs text-slate-400 mt-3">No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </section>


        {/* ========== CHECKLIST STRIP ========== */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">
              Built for UK High Street Businesses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                'Hyperlocal geo-targeted campaigns',
                'Branded eGift card issuing',
                'Real-time stock audit system',
                'Cashback & loyalty engine',
                'High street digital mall placement',
                'Virtual business card (VCard)',
                'Multi-tier pricing plans',
                'Mobile-first dashboard',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                  <span className="text-sm sm:text-base text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========== FINAL CTA ========== */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-orange-500 to-amber-500 text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Ready to join McomMall?
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
              Thousands of UK businesses already use McomMall to reach local customers, run cashback campaigns, and grow their presence on the high street.
            </p>
            <a
              href={`${solutionsUrl}/getstarted/business?source=mcommall`}
              className="inline-flex items-center justify-center gap-3 bg-white text-orange-600 hover:text-orange-700 font-bold py-4 px-10 rounded-2xl shadow-xl transition-all active:scale-95 text-base uppercase tracking-wider"
            >
              Create Merchant Account
              <ArrowRight size={18} />
            </a>
          </div>
        </section>

      </main>

      <Footer />

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-orange-500 text-white rounded-xl shadow-xl z-50 flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
