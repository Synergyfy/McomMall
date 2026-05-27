'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Upload, Check,
  Shield, Crown, Compass, Flag, MapPin, Star,
  Trophy, Building2, Globe, Eye, EyeOff
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// ═══════════════════════════════════════════════════════════
// Quest Configuration — brand-palette warm tones
// ═══════════════════════════════════════════════════════════
const QUESTS = [
  {
    id: 'auth',
    title: 'Forge Your Login',
    flavor: 'Every great venture needs a secure identity.',
    label: 'Login',
    color: '#ea580c',
    colorLight: '#fff7ed',
    Icon: Shield,
  },
  {
    id: 'welcome',
    title: 'Name Your Empire',
    flavor: "Something they'll remember. Something that's yours.",
    label: 'Name',
    color: '#f97316',
    colorLight: '#ffedd5',
    Icon: Crown,
  },
  {
    id: 'highstreet',
    title: 'Pick Your Terrain',
    flavor: 'Bricks and mortar, or pixels and bandwidth?',
    label: 'Type',
    color: '#ef4444',
    colorLight: '#fef2f2',
    Icon: Compass,
  },
  {
    id: 'address',
    title: 'Plant Your Flag',
    flavor: 'Where in the world will they find you?',
    label: 'Address',
    color: '#dc2626',
    colorLight: '#fee2e2',
    Icon: Flag,
  },
  {
    id: 'postcode',
    title: 'Lock Coordinates',
    flavor: 'Pinpoint precision. Last few digits.',
    label: 'Code',
    color: '#d97706',
    colorLight: '#fffbeb',
    Icon: MapPin,
  },
  {
    id: 'logo',
    title: 'Forge Your Crest',
    flavor: 'The face of your brand. Make it count.',
    label: 'Logo',
    color: '#ea580c',
    colorLight: '#fff7ed',
    Icon: Star,
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
  const [isClient, setIsClient] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    isHighStreet: null as boolean | null,
    address: '',
    postcode: '',
    logo: null as string | null,
  });

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
  const handleNext = () => {
    const next = new Set(completedSteps);
    if (!next.has(currentStep)) {
      next.add(currentStep);
      setCompletedSteps(next);
      setParticleTrigger((p) => p + 1);
    }

    if (currentStep < QUESTS.length - 1) {
      setTimeout(() => setCurrentStep((c) => c + 1), 300);
    } else {
      setTimeout(() => {
        setShowComplete(true);
        localStorage.removeItem('businessOnboarding');
        localStorage.removeItem('businessOnboardingStep');
        localStorage.removeItem('businessOnboardingCompleted');
      }, 500);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((c) => c - 1);
  };

  if (!isClient) return null;

  // ═══════════════════════════════════════════════════════
  // Completion Screen
  // ═══════════════════════════════════════════════════════
  if (showComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
          is ready to conquer McomMall.
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => (window.location.href = '/dashboard')}
          className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-500/25 flex items-center gap-2"
        >
          Enter Your Dashboard
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Main Onboarding Flow
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden font-sans">
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-20">
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
        <div className="flex items-center mb-14 px-1">
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
                <div className="flex items-start gap-4 mb-8">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: currentQuest.colorLight }}
                  >
                    <QuestIcon className="w-7 h-7" style={{ color: currentQuest.color }} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      {currentQuest.title}
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">{currentQuest.flavor}</p>
                  </div>
                </div>

                {/* ─── Step 0: Auth ─────────────────── */}
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Business Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 rounded-xl border-gray-200 bg-white text-base placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                        placeholder="you@yourbusiness.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Secure Password
                      </label>
                      <div className="relative group">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="h-12 rounded-xl border-gray-200 bg-white text-base placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0 pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Step 1: Business Name ────────── */}
                {currentStep === 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      What do they call you?
                    </label>
                    <Input
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="h-14 rounded-xl border-gray-200 bg-white text-xl font-bold text-center placeholder:text-gray-300 placeholder:font-normal focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                      placeholder="Your business name"
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

                {/* ─── Step 2: High Street ──────────── */}
                {currentStep === 2 && (
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
                        style={{
                          color: formData.isHighStreet === true ? currentQuest.color : '#9ca3af',
                        }}
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
                        style={{
                          color: formData.isHighStreet === false ? currentQuest.color : '#9ca3af',
                        }}
                      />
                      <div className="font-bold text-gray-900">Online</div>
                      <div className="text-xs text-gray-400 mt-1">Digital presence</div>
                    </motion.button>
                  </div>
                )}

                {/* ─── Step 3: Address ──────────────── */}
                {currentStep === 3 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full business address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base resize-none h-36 outline-none focus:ring-2 focus:ring-orange-300 transition-shadow placeholder:text-gray-300"
                      placeholder="123 Main Street, City, Country..."
                    />
                  </div>
                )}

                {/* ─── Step 4: Postcode ─────────────── */}
                {currentStep === 4 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Postcode / ZIP
                    </label>
                    <Input
                      value={formData.postcode}
                      onChange={(e) =>
                        setFormData({ ...formData, postcode: e.target.value.toUpperCase() })
                      }
                      className="h-16 rounded-xl border-gray-200 bg-white text-3xl text-center font-black tracking-[0.2em] uppercase placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                      placeholder="AB12 3CD"
                    />
                  </div>
                )}

                {/* ─── Step 5: Logo Upload ──────────── */}
                {currentStep === 5 && (
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setFormData({ ...formData, logo: 'uploaded_logo.png' })}
                      className="w-full h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors"
                      style={{
                        borderColor: formData.logo ? '#10b981' : '#d1d5db',
                        backgroundColor: formData.logo ? '#ecfdf5' : '#fafafa',
                      }}
                    >
                      {formData.logo ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            <Check className="w-10 h-10 text-emerald-500 mb-2" strokeWidth={3} />
                          </motion.div>
                          <span className="font-bold text-emerald-600 text-sm">Logo uploaded</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-300 mb-2" />
                          <span className="font-semibold text-gray-400 text-sm">
                            Drop your logo here
                          </span>
                          <span className="text-gray-300 text-xs mt-1">PNG, SVG, or JPG</span>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Navigation ──────────────────────────────── */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            aria-label="Go back"
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all outline-none ${
              currentStep === 0
                ? 'text-gray-300 cursor-default'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base transition-shadow outline-none"
            style={{
              backgroundColor: currentQuest.color,
              boxShadow: `0 8px 24px -4px ${currentQuest.color}44`,
            }}
          >
            {currentStep === QUESTS.length - 1 ? 'Complete Setup' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
