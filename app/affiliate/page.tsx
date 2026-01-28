'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Globe, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function AffiliatePage() {
    return (
        <div className="min-h-screen bg-[#0A0500] text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <main className="relative z-10">

                {/* Navigation / Back Button */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10">
                    <Link href="/getstarted" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
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
                        <span className="inline-block py-1 px-3 rounded-full bg-orange-900/30 border border-orange-800 text-orange-400 text-sm font-semibold tracking-wide uppercase mb-6">
                            Official Affiliate Program
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Partner with <br />
                            <span className="text-orange-500">McomMall</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
                            Turn your influence into income. Join the fastest-growing commerce ecosystem and earn competitive commissions for every customer you bring.
                        </p>

                        <a
                            href="https://example.com/join-affiliate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-lg shadow-orange-900/40 transform hover:scale-105 transition-all duration-300"
                        >
                            Join Agent Platform <ArrowRight className="w-5 h-5" />
                        </a>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-orange-400" />}
                            title="High Commissions"
                            description="Earn up to 20% on every qualified sale. Our competitive rates ensure your hard work pays off."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8 text-orange-400" />}
                            title="Global Reach"
                            description="Promote products available in over 100 countries. No geographical limits to your earning potential."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-orange-400" />}
                            title="Partner Support"
                            description="Get access to dedicated affiliate managers, marketing materials, and real-time performance tracking."
                            delay={0.3}
                        />
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-20 px-4 md:px-8 border-t border-white/5 bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">How it works</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-orange-900/0 via-orange-800/50 to-orange-900/0 z-0" />

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
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-900/10 pointer-events-none" />
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to start earning?</h2>
                        <a
                            href="https://example.com/join-affiliate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white text-black hover:bg-gray-200 text-lg font-bold px-10 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
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
            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
            <div className="w-16 h-16 rounded-2xl bg-orange-900/20 flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#0A0500] border-2 border-orange-500/30 flex items-center justify-center text-2xl font-bold text-orange-500 mb-6 shadow-lg shadow-orange-900/20">
                {number}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 max-w-xs">{desc}</p>
        </div>
    )
}
