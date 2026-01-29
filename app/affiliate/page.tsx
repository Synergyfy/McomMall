'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Globe, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function AffiliatePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/50 text-gray-900 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">

            {/* Background Ambience - Lighter for Light Mode */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-200/40 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply" />
            </div>

            <main className="relative z-10">

                {/* Navigation / Back Button */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10">
                    <Link href="/getstarted" className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:border-orange-200 group-hover:bg-orange-50 transition-colors">
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
                        <span className="inline-block py-1 px-3 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm">
                            Official Affiliate Program
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600">
                            Partner with <br />
                            <span className="text-orange-600 inline-block filter drop-shadow-md">McomMall</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
                            Turn your influence into income. Join the fastest-growing commerce ecosystem and earn competitive commissions for every customer you bring.
                        </p>

                        <a
                            href="https://example.com/join-affiliate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl shadow-orange-500/25 transform hover:scale-105 transition-all duration-300"
                        >
                            Join Agent Platform <ArrowRight className="w-5 h-5" />
                        </a>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-orange-500" />}
                            title="High Commissions"
                            description="Earn up to 20% on every qualified sale. Our competitive rates ensure your hard work pays off."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8 text-orange-500" />}
                            title="Global Reach"
                            description="Promote products available in over 100 countries. No geographical limits to your earning potential."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-orange-500" />}
                            title="Partner Support"
                            description="Get access to dedicated affiliate managers, marketing materials, and real-time performance tracking."
                            delay={0.3}
                        />
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-20 px-4 md:px-8 border-t border-orange-100 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900">How it works</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-orange-200/0 via-orange-200 to-orange-200/0 z-0" />

                            <Step
                                number="01"
                                title="Sign Up"
                                desc="Complete our simple application form on the agent platform."
                            />
                            <Step
                                number="02"
                                title="Promote"
                                desc="Share your unique referral links on social media, blogs, or websites."
                            />
                            <Step
                                number="03"
                                title="Earn"
                                desc="Get paid for every new customer or sale you generate."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Footer */}
                <section className="py-24 px-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-100 pointer-events-none" />
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">Ready to start earning?</h2>
                        <a
                            href="https://example.com/join-affiliate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white text-orange-600 hover:bg-gray-50 text-lg font-bold px-10 py-4 rounded-full shadow-xl border border-orange-100 transform hover:scale-105 transition-all duration-300"
                        >
                            Join Now <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </section>

            </main>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-orange-100 transition-all hover:-translate-y-1"
        >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 ring-1 ring-orange-100">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
            <p className="text-gray-500 leading-relaxed font-medium">
                {description}
            </p>
        </motion.div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-orange-50 flex items-center justify-center text-2xl font-bold text-orange-600 mb-6 shadow-xl shadow-orange-500/10">
                {number}
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">{title}</h3>
            <p className="text-gray-500 max-w-xs font-medium">{desc}</p>
        </div>
    )
}
