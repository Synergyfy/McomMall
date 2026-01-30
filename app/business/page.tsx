'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Store, BarChart3, Globe2, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function BusinessBenefitsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/50 text-gray-900 selection:bg-red-500 selection:text-white font-sans overflow-x-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-200/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply" />
            </div>

            <main className="relative z-10">

                {/* Navigation / Back Button */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10">
                    <Link href="/getstarted" className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:border-red-200 group-hover:bg-red-50 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-medium">Back</span>
                    </Link>
                </div>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-red-100 border border-red-200 text-red-600 text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm">
                            Scale Your Business with Ease
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600">
                            Sell Smarter <br />
                            <span className="text-red-600 inline-block filter drop-shadow-md">Grow Faster</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
                            Join the McomMall merchant ecosystem. Unlock powerful tools, reach global customers, and take your business to the next level in minutes.
                        </p>

                        <Link
                            href="/signup?role=business"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-lg font-bold px-10 py-5 rounded-full shadow-xl shadow-red-500/25 transform hover:scale-105 transition-all duration-300"
                        >
                            Become a Merchant <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <BusinessFeatureCard
                            icon={<Store className="w-8 h-8 text-red-500" />}
                            title="Instant Shop Front"
                            description="Launch your beautiful online store in minutes. Our intuitive interface makes setup a breeze."
                            delay={0.1}
                        />
                        <BusinessFeatureCard
                            icon={<BarChart3 className="w-8 h-8 text-red-500" />}
                            title="Deep Analytics"
                            description="Make data-driven decisions with our comprehensive analytics dashboard. Track sales, visits, and more."
                            delay={0.2}
                        />
                        <BusinessFeatureCard
                            icon={<Globe2 className="w-8 h-8 text-red-500" />}
                            title="Global Audience"
                            description="Put your products in front of thousands of active shoppers looking for what you sell."
                            delay={0.3}
                        />
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24 px-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-100 pointer-events-none" />
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">Ready to start selling?</h2>
                        <Link
                            href="/signup?role=business"
                            className="inline-flex items-center gap-3 bg-white text-red-600 hover:bg-gray-50 text-lg font-bold px-12 py-5 rounded-full shadow-xl border border-red-100 transform hover:scale-105 transition-all duration-300"
                        >
                            Create Merchant Account <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

            </main>
        </div>
    );
}

function BusinessFeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-red-100 transition-all hover:-translate-y-1"
        >
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 ring-1 ring-red-100">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
            <p className="text-gray-500 leading-relaxed font-medium">
                {description}
            </p>
        </motion.div>
    );
}
