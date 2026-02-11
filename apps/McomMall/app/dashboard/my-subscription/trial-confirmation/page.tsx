'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useJoinTrial } from '@/service/membership/hooks';
import { toast } from 'sonner';

function TrialConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tierId = searchParams.get('tierId');
    const tierName = searchParams.get('tierName') || 'Premium';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutateAsync: joinTrialAsync, isPending } = useJoinTrial();

    const handleJoinTrial = async () => {
        if (!tierId) return;
        try {
            await joinTrialAsync(tierId);
            toast.success(`Welcome aboard! Your 7-day trial for ${tierName} is now active.`);
            router.push('/dashboard?success=true');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to join trial. Please try again.');
            setIsModalOpen(false);
        }
    };

    if (!tierId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold text-gray-800">Invalid Trial Selection</h2>
                <Button onClick={() => router.push('/dashboard/my-subscription')} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden border border-slate-100"
            >
                <div className="bg-slate-900 p-12 md:p-20 text-center text-white relative overflow-hidden">
                    {/* Decorative Mesh Gradient Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-600 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-400 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    <motion.div
                        initial={{ scale: 0.5, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl mb-10 shadow-2xl shadow-orange-500/40 relative z-10"
                    >
                        <Zap className="w-12 h-12 text-white fill-current" />
                        <motion.div
                            animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-6 h-6 text-orange-300" />
                        </motion.div>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight relative z-10">
                        Start Your <span className="text-orange-500 relative inline-block">
                            Free
                            <svg className="absolute -bottom-3 left-0 w-full h-4 text-orange-500/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                            </svg>
                        </span> Trial
                    </h1>
                    <p className="text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium relative z-10">
                        Experience every premium feature of the <span className="text-white font-bold">{tierName} Tier</span> for 7 full days, <span className="text-white border-b-2 border-orange-500/50">completely free</span>.
                    </p>
                </div>

                <div className="p-12 md:p-20 bg-white relative">
                    <div className="grid lg:grid-cols-5 gap-16 items-center mb-20">
                        <div className="lg:col-span-3 space-y-10">
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Unlock Your Potential</h3>
                            <div className="grid sm:grid-cols-2 gap-8">
                                {[
                                    { title: 'Premium Access', desc: 'Full suite of business tools' },
                                    { title: 'Zero Risk', desc: 'Cancel anytime during trial' },
                                    { title: 'No Hidden Fees', desc: '100% free for 7 days' },
                                    { title: 'Instant Setup', desc: 'Active in seconds' }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
                                            <CheckCircle2 className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                                            <p className="text-slate-500 text-sm">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
                            <div className="space-y-10 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
                                        <ShieldCheck className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Truly Free</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">No upfront payment. No complex fine print. Just access.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
                                        <CreditCard className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">No Card Required</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">Skip the checkout friction. Start growing your business now.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-10">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full max-w-xl"
                        >
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                size="lg"
                                className="w-full h-24 rounded-[2rem] text-4xl font-black bg-orange-600 hover:bg-orange-700 transition-all shadow-[0_20px_50px_rgba(234,88,12,0.3)] group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-4">
                                    Start Now
                                    <ArrowRight className="w-10 h-10 group-hover:translate-x-4 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </Button>
                        </motion.div>

                        <button
                            onClick={() => router.back()}
                            className="text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase tracking-[0.2em] text-xs flex items-center gap-2"
                        >
                            <span className="w-8 h-[1px] bg-slate-200" />
                            Change Subscription Plan
                            <span className="w-8 h-[1px] bg-slate-200" />
                        </button>
                    </div>
                </div>
            </motion.div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-[3rem] p-10 border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] bg-white overflow-hidden">
                    {/* Modal Accent Ribbon */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-400 to-orange-600" />

                    <DialogHeader className="space-y-6 pt-6">
                        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-2 animate-bounce">
                            <Zap className="w-10 h-10 text-orange-600 fill-current" />
                        </div>
                        <DialogTitle className="text-4xl font-black text-center text-slate-900 tracking-tight">
                            Are you ready?
                        </DialogTitle>
                        <DialogDescription className="text-center text-xl text-slate-500 leading-relaxed font-medium">
                            You are about to activate your 7-day trial for the <span className="text-orange-600 font-bold">{tierName} Tier</span>.
                            <br />
                            <span className="text-sm mt-6 block text-slate-400 font-normal italic">Clicking yes will update your account status instantly.</span>
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col sm:flex-row gap-5 mt-12">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 h-16 rounded-2xl text-xl font-bold border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all text-slate-600"
                            disabled={isPending}
                        >
                            Wait, No
                        </Button>
                        <Button
                            type="button"
                            onClick={handleJoinTrial}
                            className="flex-1 h-16 rounded-2xl text-xl font-black bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-500/20 text-white"
                            disabled={isPending}
                        >
                            {isPending ? 'Activating...' : 'YES, Go!'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function TrialConfirmationPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
                        <Zap className="w-6 h-6 text-orange-600 absolute inset-0 m-auto animate-pulse" />
                    </div>
                </div>
            }>
                <TrialConfirmationContent />
            </Suspense>
        </div>
    );
}
