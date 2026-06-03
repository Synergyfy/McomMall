'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Upload, Check,
  Shield, Crown, Compass, MapPin,
  Trophy, Building2, Globe, Eye, EyeOff, Image, AlertCircle, Phone, User,
  Mail, ShieldCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useCreateUser, useLogin, useSendOtp, useValidateOtp, useCheckEmail } from '@/service/auth/hook';
import { UserRole } from '@/service/auth/types';

// ═══════════════════════════════════════════════════════════
// Quest Configuration — brand-palette warm tones
// ═══════════════════════════════════════════════════════════
const QUESTS = [
  {
    id: 'email',
    title: 'Create Your Business Account',
    flavor: 'Enter your business email address to get started.',
    label: 'Email',
    color: '#ea580c',
    colorLight: '#fff7ed',
    Icon: Mail,
  },
  {
    id: 'otp',
    title: 'Verify Your Email',
    flavor: 'Enter the 6-digit verification code we sent to your inbox.',
    label: 'OTP',
    color: '#f97316',
    colorLight: '#ffedd5',
    Icon: ShieldCheck,
  },
  {
    id: 'postcode',
    title: 'Business Location',
    flavor: 'Enter your postcode to find and verify your business address.',
    label: 'Address',
    color: '#d97706',
    colorLight: '#fffbeb',
    Icon: MapPin,
  },
  {
    id: 'details',
    title: 'Your Account Details',
    flavor: 'Set up your name, phone number and a secure password.',
    label: 'Details',
    color: '#ef4444',
    colorLight: '#fef2f2',
    Icon: User,
  },
  {
    id: 'welcome',
    title: 'Enter Business Name',
    flavor: 'Enter the official registered or trade name of your business.',
    label: 'Name',
    color: '#dc2626',
    colorLight: '#fee2e2',
    Icon: Crown,
  },
  {
    id: 'highstreet',
    title: 'Select Business Model',
    flavor: 'Choose whether you operate a physical storefront or a digital presence.',
    label: 'Type',
    color: '#ea580c',
    colorLight: '#fff7ed',
    Icon: Shield,
  },
  {
    id: 'logo',
    title: 'Upload Business Logo',
    flavor: 'Upload your brand logo (PNG, JPG, or SVG) to customize your storefront.',
    label: 'Logo',
    color: '#f97316',
    colorLight: '#ffedd5',
    Icon: Image,
  },
];

// ═══════════════════════════════════════════════════════════
// Particle Burst — fires from card center on step completion
// ═══════════════════════════════════════════════════════════
function ParticleBurst({ color, trigger }: { color: string; trigger: number }) {
  if (trigger === 0) return null;

  const palette = [color, '#fbbf24', '#fb923c'];

  return (
    <>
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (360 / 18) * i + (Math.random() - 0.5) * 25;
        const dist = 55 + Math.random() * 85;
        const rad = angle * (Math.PI / 180);
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const size = 3 + Math.random() * 5;

        return (
          <motion.div
            key={`p-${trigger}-${i}`}
            className="absolute rounded-full pointer-events-none z-50"
            style={{
              width: size,
              height: size,
              backgroundColor: palette[i % palette.length],
              left: '50%',
              top: '50%',
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 + Math.random() * 0.3, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Confetti Rain — completion celebration
// ═══════════════════════════════════════════════════════════
function ConfettiRain() {
  const palette = ['#f97316', '#ef4444', '#fbbf24', '#ea580c', '#dc2626', '#d97706', '#fb923c'];

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {Array.from({ length: 28 }, (_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2.5;
        const duration = 2.5 + Math.random() * 3;
        const size = 6 + Math.random() * 7;
        const rotation = Math.random() * 360;

        return (
          <motion.div
            key={`c-${i}`}
            className="absolute"
            style={{
              left: `${left}%`,
              top: -20,
              width: size,
              height: size * 0.55,
              backgroundColor: palette[i % palette.length],
              borderRadius: 2,
            }}
            animate={{
              y: ['0vh', '105vh'],
              rotate: [rotation, rotation + 360 + Math.random() * 360],
              x: [0, (Math.random() - 0.5) * 80],
            }}
            transition={{
              duration,
              delay,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Business Onboarding Component
// ═══════════════════════════════════════════════════════════
export default function BusinessOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: sendOtp } = useSendOtp();
  const { mutateAsync: validateOtp } = useValidateOtp();
  const { mutateAsync: checkEmail } = useCheckEmail();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const [isClient, setIsClient] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otp, setOtp] = useState(''); const [otpResending, setOtpResending] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    isHighStreet: null as boolean | null,
    address: '',
    postcode: '',
    logo: null as string | null,
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCheckingProximity, setIsCheckingProximity] = useState(false);
  const [proximityResult, setProximityResult] = useState<{ distance: number; tier: string } | null>(null);
  const [showProximityModal, setShowProximityModal] = useState(false);

  // ─── Debounced address suggestion lookup ──────────────
  useEffect(() => {
    if (!formData.postcode || formData.postcode.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/business/search-address?postcode=${encodeURIComponent(formData.postcode)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [formData.postcode]);

  // ─── Load from cache ─────────────────────────────────
  useEffect(() => {
    setIsClient(true);
    try {
      const cached = localStorage.getItem('businessOnboarding');
      const cachedStep = localStorage.getItem('businessOnboardingStep');
      const cachedCompleted = localStorage.getItem('businessOnboardingCompleted');
      if (cached) setFormData(JSON.parse(cached));
      if (cachedStep) setCurrentStep(parseInt(cachedStep, 10));
      if (cachedCompleted) setCompletedSteps(new Set(JSON.parse(cachedCompleted)));
    } catch {
      // ignore parse errors
    }
  }, []);

  // ─── Save to cache ───────────────────────────────────
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('businessOnboarding', JSON.stringify(formData));
    localStorage.setItem('businessOnboardingStep', currentStep.toString());
    localStorage.setItem('businessOnboardingCompleted', JSON.stringify([...completedSteps]));
  }, [formData, currentStep, isClient, completedSteps]);

  // ─── Derived ─────────────────────────────────────────
  const currentQuest = QUESTS[currentStep];
  const QuestIcon = currentQuest.Icon;

  // ─── Handlers ────────────────────────────────────────
  const handleSelectSuggestion = async (suggestion: any) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.displayName,
      postcode: suggestion.postcode,
    }));
    setShowSuggestions(false);

    setIsCheckingProximity(true);
    try {
      const res = await fetch('/api/business/check-proximity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: suggestion.postcode,
          address: suggestion.displayName,
          lat: suggestion.lat,
          lon: suggestion.lon,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setProximityResult(result);
        setShowProximityModal(true);
        // Persist to local storage for the dashboard
        localStorage.setItem('businessProximityTier', result.tier);
        localStorage.setItem('businessProximityDistance', result.distance.toString());
      }
    } catch (err) {
      console.error('Error checking proximity:', err);
    } finally {
      setIsCheckingProximity(false);
    }
  };

  const handleModalContinue = () => {
    setShowProximityModal(false);
    handleNext();
  };

  const handleNext = async () => {
    setSubmitError(null);

    // ── Step 0: Send OTP to email ────────────────────────────
    if (currentStep === 0) {
      if (!formData.email) { setSubmitError('Please enter your email address.'); return; }
      setIsSubmitting(true);
      try {
        await sendOtp({ email: formData.email, type: 'VERIFICATION' });
        const next = new Set(completedSteps);
        next.add(0);
        setCompletedSteps(next);
        setParticleTrigger((p) => p + 1);
        setTimeout(() => setCurrentStep(1), 300);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setSubmitError(e?.message || 'Failed to send verification code. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── Step 1: Validate OTP ───────────────────────────────
    if (currentStep === 1) {
      if (!otp || otp.length < 6) { setSubmitError('Please enter the full 6-digit code.'); return; }
      setIsSubmitting(true);
      try {
        await validateOtp({ email: formData.email, otp, type: 'VERIFICATION' });

        // Check if an account with this email already exists
        try {
          const emailCheck = await checkEmail(formData.email);
          if (emailCheck?.exists) {
            setSubmitError('An account with this email already exists. Please log in instead.');
            setIsSubmitting(false);
            return;
          }
        } catch {
          // If check-email endpoint fails, allow the user to continue
        }

        const next = new Set(completedSteps);
        next.add(1);
        setCompletedSteps(next);
        setParticleTrigger((p) => p + 1);
        setTimeout(() => setCurrentStep(2), 300);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setSubmitError(e?.message || 'Invalid code. Please check and try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── Final step: register + auto-login ──────────────────
    if (currentStep === QUESTS.length - 1) {
      setIsSubmitting(true);
      try {
        await createUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          role: UserRole.OWNER,
        });

        await login({
          email: formData.email,
          password: formData.password,
          role: UserRole.OWNER,
        });

        const next = new Set(completedSteps);
        next.add(currentStep);
        setCompletedSteps(next);
        setParticleTrigger((p) => p + 1);

        localStorage.setItem('businessOnboarding', JSON.stringify({
          businessName: formData.businessName,
          postcode: formData.postcode,
          address: formData.address,
          logo: formData.logo,
        }));
        localStorage.removeItem('businessOnboardingStep');
        localStorage.removeItem('businessOnboardingCompleted');

        setTimeout(() => setShowComplete(true), 500);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setSubmitError(e?.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── Intermediate steps ─────────────────────────────────
    const next = new Set(completedSteps);
    if (!next.has(currentStep)) {
      next.add(currentStep);
      setCompletedSteps(next);
      setParticleTrigger((p) => p + 1);
    }
    setTimeout(() => setCurrentStep((c) => c + 1), 300);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((c) => c - 1);
  };

  useEffect(() => {
    if (currentStep === 1 && otp.length === 6 && !isSubmitting && !submitError) {
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  if (!isClient) return null;

  // ═══════════════════════════════════════════════════════
  // Completion Screen
  // ═══════════════════════════════════════════════════════
  if (showComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-x-hidden">
        <ConfettiRain />

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-400/40">
            <Trophy className="w-14 h-14 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-5xl font-black text-gray-900 mb-3 text-center tracking-tight"
        >
          You&apos;re All Set!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-gray-500 mb-10 text-center max-w-md"
        >
          <span className="font-bold text-gray-700">{formData.businessName || 'Your business'}</span>{' '}
          is successfully registered and ready to establish your storefront on LocalMall.
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push('/getstarted/localmall')}
          className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-500/25 flex items-center gap-2"
        >
          Enter LocalMall
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Main Onboarding Flow
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-x-hidden font-sans">
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Colored accent strip — changes with each quest */}
      <motion.div
        className="h-1 w-full relative z-20"
        animate={{ backgroundColor: currentQuest.color }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-32 sm:pb-20">
        {/* ─── Progress ────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Step {currentStep + 1} of {QUESTS.length}
            </span>
            <span className="text-xs text-gray-400">
              {Math.round((completedSteps.size / QUESTS.length) * 100)}% complete
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              animate={{ width: `${((currentStep + 1) / QUESTS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ─── Quest Map — connected icon nodes ────────── */}
        <div className="flex items-center mb-2 sm:mb-6 px-1">
          {QUESTS.map((quest, i) => {
            const NodeIcon = quest.Icon;

            return (
              <React.Fragment key={quest.id}>
                {/* Node */}
                <div className="relative flex flex-col items-center shrink-0">
                  <motion.button
                    aria-label={`${quest.title}${completedSteps.has(i) ? ' (completed)' : i === currentStep ? ' (current)' : ' (locked)'}`}
                    onClick={() => {
                      if (completedSteps.has(i) || i <= currentStep) setCurrentStep(i);
                    }}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-colors relative outline-none"
                    style={{
                      backgroundColor: completedSteps.has(i)
                        ? quest.color
                        : i === currentStep
                          ? quest.colorLight
                          : '#f3f4f6',
                      borderColor: completedSteps.has(i)
                        ? quest.color
                        : i === currentStep
                          ? quest.color
                          : '#e5e7eb',
                      color: completedSteps.has(i)
                        ? '#fff'
                        : i === currentStep
                          ? quest.color
                          : '#9ca3af',
                      cursor: completedSteps.has(i) || i <= currentStep ? 'pointer' : 'default',
                    }}
                    whileHover={completedSteps.has(i) || i <= currentStep ? { scale: 1.15 } : {}}
                    whileTap={completedSteps.has(i) || i <= currentStep ? { scale: 0.92 } : {}}
                  >
                    {completedSteps.has(i) ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                    ) : (
                      <NodeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}

                    {/* Pulse ring on active node */}
                    {i === currentStep && !completedSteps.has(i) && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 pointer-events-none"
                        style={{ borderColor: quest.color }}
                        animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </motion.button>

                  {/* Label under node */}
                  <span className="absolute -bottom-5 text-[9px] sm:text-[10px] font-semibold text-gray-400 whitespace-nowrap hidden sm:block select-none">
                    {quest.label}
                  </span>
                </div>

                {/* Connector line */}
                {i < QUESTS.length - 1 && (
                  <div className="flex-1 h-[3px] mx-1 sm:mx-2 bg-gray-200 rounded-full relative overflow-hidden">
                    {completedSteps.has(i) && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: quest.color, transformOrigin: 'left' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ─── Step Card ───────────────────────────────── */}
        <div className="relative">
          <ParticleBurst color={currentQuest.color} trigger={particleTrigger} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 overflow-hidden"
            >
              {/* Colored top stripe */}
              <div className="h-1.5" style={{ backgroundColor: currentQuest.color }} />

              <div className="p-6 sm:p-8">
                {/* Quest header */}
                <div className="flex items-start gap-3 mb-6 sm:mb-8">
                  <div
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: currentQuest.colorLight }}
                  >
                    <QuestIcon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: currentQuest.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                      {currentQuest.title}
                    </h2>
                    <p className="text-gray-500 mt-0.5 text-xs sm:text-sm sm:mt-1">{currentQuest.flavor}</p>
                  </div>
                </div>

                {/* ─── Step 0: Email ────────────────── */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Business Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                          className="h-12 pl-9 rounded-xl border-gray-200 bg-white text-base placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                          placeholder="you@yourbusiness.com"
                          autoFocus
                        />
                      </div>
                    </div>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{submitError}</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ─── Step 1: OTP Verification ─────── */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <p className="text-sm text-orange-800 font-medium">
                        We sent a 6-digit code to
                      </p>
                      <p className="text-base font-bold text-orange-900 mt-0.5">{formData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-center">
                        Verification Code
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                          if (submitError) setSubmitError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        className="h-16 rounded-xl border-gray-200 bg-white text-3xl text-center font-black tracking-[0.4em] placeholder:text-gray-200 placeholder:font-normal placeholder:tracking-normal focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setOtpResending(true);
                        try { await sendOtp({ email: formData.email, type: 'VERIFICATION' }); }
                        catch { /* silent */ }
                        finally { setOtpResending(false); }
                      }}
                      className="w-full text-center text-sm text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {otpResending ? 'Sending...' : "Didn't receive it? Resend code"}
                    </button>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{submitError}</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ─── Step 2: Postcode / Address ───── */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Postcode / ZIP
                      </label>
                      <div className="relative">
                        <Input
                          value={formData.postcode}
                          onChange={(e) =>
                            setFormData({ ...formData, postcode: e.target.value.toUpperCase() })
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                          className="h-16 rounded-xl border-gray-200 bg-white text-3xl text-center font-black tracking-[0.2em] uppercase placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                          placeholder="AB12 3CD"
                          autoFocus
                        />
                        {loadingSuggestions && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-50 z-30 relative"
                      >
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50/50 transition-colors flex items-start gap-3 text-sm text-gray-700 group focus:outline-none focus:bg-orange-50"
                          >
                            <MapPin className="w-4 h-4 text-gray-400 group-hover:text-orange-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-semibold text-gray-900 group-hover:text-orange-600 block">
                                {suggestion.displayName.split(',')[0]}
                              </span>
                              <span className="text-gray-500 text-xs line-clamp-1">
                                {suggestion.displayName}
                              </span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                    {formData.address && !showSuggestions && (
                      <div className="p-4 bg-orange-50/40 border border-orange-100/55 rounded-xl flex items-start gap-3">
                        <Check className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <div className="text-left">
                          <div className="text-xs font-semibold text-orange-800">Verified Address:</div>
                          <div className="text-sm text-orange-950 font-medium">{formData.address}</div>
                        </div>
                      </div>
                    )}
                    {isCheckingProximity && (
                      <div className="flex items-center justify-center py-4 gap-2 text-sm text-gray-500 font-semibold animate-pulse">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"
                        />
                        Calculating proximity to nearest High Street...
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Step 3: Personal Details ─────── */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                          <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            className="h-11 pl-9 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                            placeholder="Jane"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                          <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            className="h-11 pl-9 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                            placeholder="Smith"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <Input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                          className="h-11 pl-9 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                          placeholder="+44 7700 900000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0 pr-10"
                            placeholder="••••••••"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0 pr-10"
                            placeholder="••••••••"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Step 4: Business Name ────────── */}
                {currentStep === 4 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      What do they call you?
                    </label>
                    <Input
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      className="h-14 rounded-xl border-gray-200 bg-white text-xl font-bold text-center placeholder:text-gray-300 placeholder:font-normal focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                      placeholder="Your business name"
                      autoFocus
                    />
                    <AnimatePresence>
                      {formData.businessName.trim() && (
                        <motion.p
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center mt-3 text-sm text-gray-400"
                        >
                          Nice ring to it.{' '}
                          <span className="text-gray-600 font-semibold">{formData.businessName}</span>{' '}
                          it is.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ─── Step 5: Business Model ───────── */}
                {currentStep === 5 && (
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFormData({ ...formData, isHighStreet: true })}
                      className="p-6 rounded-xl border-2 text-left transition-colors outline-none"
                      style={{
                        borderColor: formData.isHighStreet === true ? currentQuest.color : '#e5e7eb',
                        backgroundColor: formData.isHighStreet === true ? currentQuest.colorLight : '#fff',
                      }}
                    >
                      <Building2
                        className="w-8 h-8 mb-3"
                        style={{ color: formData.isHighStreet === true ? currentQuest.color : '#9ca3af' }}
                      />
                      <div className="font-bold text-gray-900">High Street</div>
                      <div className="text-xs text-gray-400 mt-1">Physical shopfront</div>
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFormData({ ...formData, isHighStreet: false })}
                      className="p-6 rounded-xl border-2 text-left transition-colors outline-none"
                      style={{
                        borderColor: formData.isHighStreet === false ? currentQuest.color : '#e5e7eb',
                        backgroundColor: formData.isHighStreet === false ? currentQuest.colorLight : '#fff',
                      }}
                    >
                      <Globe
                        className="w-8 h-8 mb-3"
                        style={{ color: formData.isHighStreet === false ? currentQuest.color : '#9ca3af' }}
                      />
                      <div className="font-bold text-gray-900">Online</div>
                      <div className="text-xs text-gray-400 mt-1">Digital presence</div>
                    </motion.button>
                  </div>
                )}

                {/* ─── Step 6: Logo Upload ──────────── */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="hidden"
                      id="logo-file-input"
                    />
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden"
                      style={{
                        minHeight: '11rem',
                        borderColor: formData.logo ? '#ea580c' : '#d1d5db',
                        backgroundColor: formData.logo ? '#fff7ed' : '#fafafa',
                      }}
                    >
                      {formData.logo ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-5 px-4 w-full">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 rounded-xl overflow-hidden shadow-md border border-orange-100 bg-white flex-shrink-0"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formData.logo} alt="Business Logo Preview" className="w-full h-full object-cover" />
                          </motion.div>
                          <span className="font-bold text-orange-700 text-sm">Logo selected</span>
                          <span className="text-xs text-orange-400">Click to choose a different image</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <Upload className="w-10 h-10 text-gray-300" />
                          <span className="font-semibold text-gray-400 text-sm">Click to select your logo</span>
                          <span className="text-gray-300 text-xs">PNG, SVG, or JPG</span>
                        </div>
                      )}
                    </motion.div>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{submitError}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Navigation ──────────────────────────────── */}
        <div className="fixed bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl z-50 sm:static sm:bg-transparent sm:border-none sm:shadow-none sm:p-0 sm:mt-8">
          <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              aria-label="Go back"
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all outline-none ${currentStep === 0
                  ? 'text-gray-300 cursor-default'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <motion.button
              whileHover={isSubmitting ? {} : { scale: 1.03 }}
              whileTap={isSubmitting ? {} : { scale: 0.97 }}
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentQuest.color,
                boxShadow: isSubmitting ? 'none' : `0 8px 24px -4px ${currentQuest.color}44`,
              }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Registering...
                </>
              ) : (
                <>
                  {currentStep === QUESTS.length - 1 ? 'Complete Setup' : 'Continue'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ─── Proximity Verification Modal ─────────────────── */}
      <AnimatePresence>
        {showProximityModal && proximityResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Glassmorphic backdrop with warm brand tint overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleModalContinue}
              className="absolute inset-0 backdrop-blur-md bg-orange-950/25"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[85dvh] overflow-y-auto shadow-2xl relative z-10 border border-gray-100 flex flex-col"
            >
              {/* Top decorative gradient bar */}
              <div
                className={`h-2.5 bg-gradient-to-r ${proximityResult.tier === 'high_street'
                    ? 'from-yellow-400 via-amber-500 to-orange-500'
                    : proximityResult.tier === 'hyper_local'
                      ? 'from-orange-400 via-orange-500 to-red-500'
                      : proximityResult.tier === 'nearby'
                        ? 'from-orange-600 via-red-500 to-red-600'
                        : 'from-red-600 via-red-700 to-orange-850'
                  }`}
              />

              <div className="p-5 sm:p-8 flex-1 flex flex-col items-center text-center">
                {/* Pulsing Icon */}
                <div className="relative mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl ${proximityResult.tier === 'high_street'
                        ? 'from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/30'
                        : proximityResult.tier === 'hyper_local'
                          ? 'from-orange-400 via-orange-500 to-red-500 shadow-orange-500/30'
                          : proximityResult.tier === 'nearby'
                            ? 'from-orange-600 via-red-500 to-red-600 shadow-red-500/30'
                            : 'from-red-600 via-red-700 to-orange-850 shadow-red-700/30'
                      }`}
                  >
                    {proximityResult.tier === 'high_street' && <Building2 className="w-8 h-8 animate-pulse" />}
                    {proximityResult.tier === 'hyper_local' && <MapPin className="w-8 h-8 animate-pulse" />}
                    {proximityResult.tier === 'nearby' && <Compass className="w-8 h-8 animate-pulse" />}
                    {proximityResult.tier === 'national' && <Globe className="w-8 h-8 animate-pulse" />}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 tracking-tight">
                  {proximityResult.tier === 'high_street' && 'High Street Verified!'}
                  {proximityResult.tier === 'hyper_local' && 'Hyper Local Verified!'}
                  {proximityResult.tier === 'nearby' && 'Nearby Location Verified!'}
                  {proximityResult.tier === 'national' && 'National Scope Verified!'}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm px-2 mb-4">
                  {proximityResult.tier === 'high_street' && 'Congratulations! Your business is located directly on a High Street.'}
                  {proximityResult.tier === 'hyper_local' && `Awesome! Your business is within ${proximityResult.distance} miles of a High Street.`}
                  {proximityResult.tier === 'nearby' && `Great! Your business is nearby (${proximityResult.distance} miles to nearest High Street).`}
                  {proximityResult.tier === 'national' && `Excellent! Your business is positioned for national reach (${proximityResult.distance} miles from High Street).`}
                </p>

                {/* Verified Badge Details */}
                <div className="w-full bg-gray-50 rounded-2xl p-4 sm:p-6 mb-4 text-left border border-gray-100">
                  <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-widest mb-3">
                    What you receive:
                  </h4>
                  <ul className="space-y-3.5">
                    {proximityResult.tier === 'high_street' && (
                      <>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            High Street tag proudly displayed on your dashboard
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Premium search positioning for high walk-in discoverability
                          </span>
                        </li>
                      </>
                    )}
                    {proximityResult.tier === 'hyper_local' && (
                      <>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Hyper Local tag active on your dashboard
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Targeted promotions for local neighborhood customers
                          </span>
                        </li>
                      </>
                    )}
                    {proximityResult.tier === 'nearby' && (
                      <>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Nearby tag enabled on your dashboard
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Regional shipping and dynamic delivery tools
                          </span>
                        </li>
                      </>
                    )}
                    {proximityResult.tier === 'national' && (
                      <>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            National tag active on your dashboard
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Expanded nationwide delivery integration tools
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleModalContinue}
                  className={`w-full py-4 bg-gradient-to-r text-white text-base font-extrabold rounded-2xl hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-2 ${proximityResult.tier === 'high_street'
                      ? 'from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/25'
                      : proximityResult.tier === 'hyper_local'
                        ? 'from-orange-400 via-orange-500 to-red-500 shadow-orange-500/25'
                        : proximityResult.tier === 'nearby'
                          ? 'from-orange-600 via-red-500 to-red-600 shadow-red-500/25'
                          : 'from-red-600 via-red-700 to-orange-850 shadow-red-700/25'
                    }`}
                >
                  Continue Setup
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
