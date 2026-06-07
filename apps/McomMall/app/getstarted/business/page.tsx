'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Upload, Check,
  Shield, Crown, Compass, MapPin,
  Trophy, Building2, Globe, Eye, EyeOff, Image, AlertCircle, Phone, User,
  Mail, ShieldCheck, X, Search, Star, Clock, ArrowRight, HelpCircle, Map, MessageSquare, RefreshCw, CheckCircle2, CloudDownload, ShoppingBag, Utensils, UtensilsCrossed, Umbrella, Wine, Coffee, Lightbulb, Bell, Package, Briefcase, ChevronUp, ChevronDown, Badge, Rocket, Fingerprint, Info, Heart, Gift, Megaphone, Gamepad2, Calendar, CalendarDays, Ticket, Store, BadgeCheck, Archive, Puzzle, Truck, Settings, Circle, LayoutDashboard, Share2, Award, UserPlus, Sparkles, Calculator, Plane, Palette, CreditCard, Croissant, Landmark
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useCreateUser, useLogin, useSendOtp, useValidateOtp, useCheckEmail } from '@/service/auth/hook';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setAuthTokens, setUserData, loadAuthFromCookies } from '@/service/store/authSlice';
import { UserRole } from '@/service/auth/types';
import api from '@/service/api';
import { useAddListing } from '@/service/listings/hook';
import { useGetSectors, useGetCategoriesBySector, useGetSubCategoriesByCategory } from '@/service/taxonomy/hook';
import { uploadFile } from '@/lib/upload';

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
    id: 'profile',
    title: 'Business Profile Setup',
    flavor: 'Enter your business name, description, phone, and upload your brand logo.',
    label: 'Profile',
    color: '#dc2626',
    colorLight: '#fee2e2',
    Icon: Crown,
  },
  {
    id: 'business_type',
    title: 'Select Business Type',
    flavor: 'Choose whether you offer products, services, or both.',
    label: 'Type',
    color: '#ea580c',
    colorLight: '#fff7ed',
    Icon: Shield,
  },
  {
    id: 'category',
    title: 'Category Selection',
    flavor: 'Select categories to power your positioning and partnership recommendations.',
    label: 'Category',
    color: '#f97316',
    colorLight: '#ffedd5',
    Icon: Compass,
  },
  {
    id: 'hours',
    title: 'Operating Hours',
    flavor: 'When are you open for business?',
    label: 'Hours',
    color: '#d97706',
    colorLight: '#fffbeb',
    Icon: Globe, // Fallback icon
  },
  {
    id: 'booking_prefs',
    title: 'Booking Preferences',
    flavor: 'How do you want to accept bookings?',
    label: 'Booking',
    color: '#ea580c',
    colorLight: '#fff7ed',
    Icon: Shield, // Fallback icon
  },
  {
    id: 'appointment_struct',
    title: 'Appointment Structure',
    flavor: 'Set your buffer times and daily limits.',
    label: 'Appointments',
    color: '#f97316',
    colorLight: '#ffedd5',
    Icon: Compass, // Fallback icon
  },
  {
    id: 'service_zones',
    title: 'Service Zones',
    flavor: 'Where do you offer your services?',
    label: 'Zones',
    color: '#d97706',
    colorLight: '#fffbeb',
    Icon: MapPin,
  },
  {
    id: 'fulfillment',
    title: 'Delivery & Pickup',
    flavor: 'How do customers get your products?',
    label: 'Fulfillment',
    color: '#ea580c',
    colorLight: '#fff7ed',
    Icon: Shield, // Fallback icon
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    shortDescription: '',
    businessPhone: '',
    logo: null as string | null,
    address: '',
    postcode: '',
    city: '',
    businessType: 'products' as 'products' | 'services' | 'both',
    sectorId: '',
    categoryId: '',
    subCategoryId: '',
    isStandardHours: true,
    is247: false,
    isCustomHours: false,
    customHours: [
      { dayOfWeek: 1, name: 'Monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 2, name: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 3, name: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 4, name: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 5, name: 'Friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 6, name: 'Saturday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 0, name: 'Sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
    ],
    sellingModes: ['pickup'] as string[],
    bookingAcceptance: 'manual' as 'auto' | 'manual',
    minimumNotice: '24h',
    cancellationPolicy: '',
    bufferTime: '15m',
    maxDailyBookings: '',
    serviceFulfillmentModel: 'in_store' as 'in_store' | 'mobile' | 'virtual',
    travelRadius: '',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  
  const activeQuests = QUESTS.filter(q => {
    const isService = formData.businessType === 'services' || formData.businessType === 'both';
    
    if (q.id === 'fulfillment' && formData.businessType === 'services') return false;
    if ((q.id === 'booking_prefs' || q.id === 'appointment_struct' || q.id === 'service_zones') && !isService) return false;
    
    return true;
  });

  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: sendOtp } = useSendOtp();
  const { mutateAsync: validateOtp } = useValidateOtp();
  const { mutateAsync: checkEmail } = useCheckEmail();
  const { mutateAsync: addListing } = useAddListing();

  const { data: sectors } = useGetSectors();
  const { data: categories } = useGetCategoriesBySector(formData.sectorId);
  const { data: subcategories } = useGetSubCategoriesByCategory(formData.categoryId);

  // --- Google Onboarding State ---
  const [isGoogleOnboarding, setIsGoogleOnboarding] = useState(false);
  const [googleStep, setGoogleStep] = useState<'branch_select' | 'fail_safe_form' | 'review_claim' | null>(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleBranches, setGoogleBranches] = useState<any[]>([]);
  const [selectedGoogleBranch, setSelectedGoogleBranch] = useState<any>(null);
  const [googleMapping, setGoogleMapping] = useState<any>(null);
  const [showGoogleMockPopup, setShowGoogleMockPopup] = useState(false);
  const [googleMockAccountStep, setGoogleMockAccountStep] = useState<'picker' | 'permissions'>('picker');
  
  // Fail-Safe Edit Form state
  const [googlePhoneInput, setGooglePhoneInput] = useState('');
  const [googleSectorId, setGoogleSectorId] = useState('');
  const [googleCategoryId, setGoogleCategoryId] = useState('');
  const [googleSubCategoryId, setGoogleSubCategoryId] = useState('');

  // Review & Claim Step state
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [ownerBusinessType, setOwnerBusinessType] = useState<'products' | 'services' | 'both'>('products');

  // Load Google mapping categories dynamically based on selected sector/category
  const { data: googleCategories } = useGetCategoriesBySector(googleSectorId);
  const { data: googleSubcategories } = useGetSubCategoriesByCategory(googleCategoryId);

  const handleGoogleStart = () => {
    setIsGoogleOnboarding(true);
    setGoogleMockAccountStep('picker');
    setShowGoogleMockPopup(true);
    setSubmitError(null);
  };

  const handleGoogleSelectAccount = (email: string, fName: string, lName: string) => {
    setGoogleEmail(email);
    setOwnerFirstName(fName);
    setOwnerLastName(lName);
    setGoogleMockAccountStep('permissions');
  };

  const handleGoogleGrantPermissions = async () => {
    setShowGoogleMockPopup(false);
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.get(`google-business/branches?email=${encodeURIComponent(googleEmail)}`);
      setGoogleBranches(res.data);
      setGoogleStep('branch_select');
    } catch (err: any) {
      setSubmitError('Failed to fetch Google Business storefront locations.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSelectBranch = async (branch: any) => {
    setSelectedGoogleBranch(branch);
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.get(`google-business/map-category?googleCategoryId=${encodeURIComponent(branch.googleCategoryId)}`);
      const mapping = res.data;
      setGoogleMapping(mapping);

      if (mapping && mapping.sectorId && mapping.categoryId && mapping.subCategoryId && branch.businessPhone) {
        setGoogleSectorId(mapping.sectorId);
        setGoogleCategoryId(mapping.categoryId);
        setGoogleSubCategoryId(mapping.subCategoryId);
        setGooglePhoneInput(branch.businessPhone);
        setGoogleStep('review_claim');
      } else {
        setGooglePhoneInput(branch.businessPhone || '');
        setGoogleSectorId(mapping?.sectorId || '');
        setGoogleCategoryId(mapping?.categoryId || '');
        setGoogleSubCategoryId(mapping?.subCategoryId || '');
        setGoogleStep('fail_safe_form');
      }
    } catch (err) {
      setGooglePhoneInput(branch.businessPhone || '');
      setGoogleSectorId('');
      setGoogleCategoryId('');
      setGoogleSubCategoryId('');
      setGoogleStep('fail_safe_form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleFailSafeSubmit = () => {
    setSubmitError(null);
    if (!googlePhoneInput) {
      setSubmitError('Phone number is required.');
      return;
    }
    if (!googleSectorId || !googleCategoryId || !googleSubCategoryId) {
      setSubmitError('All category levels must be selected.');
      return;
    }
    setGoogleStep('review_claim');
  };

  const handleGoogleCompleteClaim = async () => {
    setSubmitError(null);
    if (!ownerFirstName || !ownerLastName) {
      setSubmitError('Please enter your First Name and Last Name.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('google-business/complete-onboarding', {
        email: googleEmail,
        firstName: ownerFirstName,
        lastName: ownerLastName,
        businessType: ownerBusinessType,
        googlePlaceId: selectedGoogleBranch.googlePlaceId,
        businessName: selectedGoogleBranch.businessName,
        businessPhone: googlePhoneInput,
        address: selectedGoogleBranch.address,
        postcode: selectedGoogleBranch.postcode,
        sectorId: googleSectorId,
        categoryId: googleCategoryId,
        subCategoryId: googleSubCategoryId,
        logoUrl: '',
      });

      const { auth, user, listing } = res.data;

      // Set headers and auth cookies
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`;
      
      // Dispatch auth tokens and user data to store (which also sets cookies)
      dispatch(
        setAuthTokens({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        })
      );
      dispatch(
        setUserData({
          id: user?.id || user?._id || 'mock_user_id',
          userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : `${ownerFirstName} ${ownerLastName}`,
          userRole: user?.role || 'owner',
          packageInfo: user?.packageInfo
            ? { planType: user.packageInfo.planType }
            : null,
        })
      );

      // Persist to local storage for dashboard
      localStorage.setItem('businessOnboarding', JSON.stringify({
        businessName: listing.businessName,
        postcode: selectedGoogleBranch.postcode,
        address: selectedGoogleBranch.address,
        logo: null,
      }));
      localStorage.setItem('businessArea', 'London');
      localStorage.setItem('businessProximityTier', 'high_street');

      // Sync form data
      setFormData(prev => ({
        ...prev,
        email: googleEmail,
        firstName: ownerFirstName,
        lastName: ownerLastName,
        businessName: listing.businessName,
        businessPhone: googlePhoneInput,
        postcode: selectedGoogleBranch.postcode,
        address: selectedGoogleBranch.address,
      }));

      // Complete
      setShowComplete(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to claim business storefront.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleBack = () => {
    setSubmitError(null);
    if (googleStep === 'branch_select') {
      setIsGoogleOnboarding(false);
      setGoogleStep(null);
      setShowInitialPrompt(true);
    } else if (googleStep === 'fail_safe_form') {
      setGoogleStep('branch_select');
    } else if (googleStep === 'review_claim') {
      const mapping = googleMapping;
      if (mapping && mapping.sectorId && mapping.categoryId && mapping.subCategoryId && selectedGoogleBranch?.businessPhone) {
        setGoogleStep('branch_select');
      } else {
        setGoogleStep('fail_safe_form');
      }
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
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
  const [hasRegistered, setHasRegistered] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otp, setOtp] = useState(''); const [otpResending, setOtpResending] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCheckingProximity, setIsCheckingProximity] = useState(false);
  const [proximityResult, setProximityResult] = useState<{
    status: 'active' | 'inactive';
    resolvedArea?: string;
    localMallName?: string;
    localMallId?: string;
    message: string;
  } | null>(null);
  const [showProximityModal, setShowProximityModal] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const [showGoogleCategoryPage, setShowGoogleCategoryPage] = useState(false);
  const [showFindClaimPage, setShowFindClaimPage] = useState(false);
  const [showBusinessPreviewPage, setShowBusinessPreviewPage] = useState(false);
  const [showVerifyOwnershipPage, setShowVerifyOwnershipPage] = useState(false);
  const [showConnectGooglePage, setShowConnectGooglePage] = useState(false);
  const [showBusinessTypePage, setShowBusinessTypePage] = useState(false);
  const [showBusinessCategoryPage, setShowBusinessCategoryPage] = useState(false);
  const [showLocalNetworkPage, setShowLocalNetworkPage] = useState(false);
  const [showQuickSetupPage, setShowQuickSetupPage] = useState(false);
  const [showMembershipRoutingPage, setShowMembershipRoutingPage] = useState(false);
  const [showLinkAccountPage, setShowLinkAccountPage] = useState(false);
  const [showMembershipSelectionPage, setShowMembershipSelectionPage] = useState(false);
  const [showReviewStorefrontPage, setShowReviewStorefrontPage] = useState(false);
  const [showBuildingStorefrontPage, setShowBuildingStorefrontPage] = useState(false);
  const [isFinalizingStorefront, setIsFinalizingStorefront] = useState(false);
  const [showWelcomeChecklistPage, setShowWelcomeChecklistPage] = useState(false);
  const [storefrontLive, setStorefrontLive] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [lockedFeatureAttempt, setLockedFeatureAttempt] = useState<string | null>(null);
  const [cobrandedTab, setCobrandedTab] = useState<'standard' | 'pro' | 'plus'>('standard');
  const [quickSetupToggles, setQuickSetupToggles] = useState({
    loyalty: true,
    rewards: true,
    promotions: true,
    gamification: false,
    bookings: false,
    events: false,
    vouchers: true
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Restaurant', 'Italian']);
  const [storefrontProgress, setStorefrontProgress] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchHeaderCollapsed, setIsSearchHeaderCollapsed] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState<'google' | 'email' | 'sms'>('google');
  const [selectedPreviewBusiness, setSelectedPreviewBusiness] = useState<any>(null);
  const [mapViewToggle, setMapViewToggle] = useState<'list' | 'map'>('list');

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
      if (cached) setFormData(prev => ({ ...prev, ...JSON.parse(cached) }));
      if (cachedStep) {
        const step = parseInt(cachedStep, 10);
        setCurrentStep(step);
        if (step > 0) {
          setShowInitialPrompt(false);
        }
      }
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

  // ─── Storefront Progress Simulation ───────────────────
  // Replaced by standalone BuildingStorefrontPage component

  // ─── Derived ─────────────────────────────────────────
  const currentQuest = activeQuests[currentStep] || activeQuests[0];
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
      const res = await api.post('localmall/onboarding/check-location', {
        postcode: suggestion.postcode,
      });
      const result = res.data;
      setProximityResult(result);
      setShowProximityModal(true);
      // Persist to local storage for the dashboard
      if (result.status === 'active') {
        localStorage.setItem('businessProximityTier', 'high_street');
        localStorage.setItem('businessArea', result.resolvedArea || '');
        localStorage.setItem('localMallName', result.localMallName || '');
        localStorage.setItem('localMallId', result.localMallId || '');
      } else {
        localStorage.setItem('businessProximityTier', 'national');
        localStorage.setItem('businessArea', result.resolvedArea || 'Remote');
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

    // ── Final step: register + auto-login + create profile ──────────────────
    if (currentStep === activeQuests.length - 1) {
      if (!formData.sectorId || !formData.categoryId || !formData.subCategoryId) {
        setSubmitError('Please select your business categories.');
        return;
      }
      setIsSubmitting(true);
      try {
        if (!hasRegistered) {
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
          } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || '';
            const code = err?.response?.data?.code || err?.code || '';
            if (
              msg.toLowerCase().includes('email has been used') ||
              msg.toLowerCase().includes('email_exists') ||
              code === 'EMAIL_EXISTS'
            ) {
              await login({
                email: formData.email,
                password: formData.password,
                role: UserRole.OWNER,
              });
            } else {
              throw err;
            }
          }

          if (!api.defaults.headers.common['Authorization']) {
            await login({
              email: formData.email,
              password: formData.password,
              role: UserRole.OWNER,
            });
          }

          setHasRegistered(true);
        }

        let uploadedLogoUrl = '';
        if (logoFile) {
          try {
            const uploadRes = await uploadFile(logoFile);
            uploadedLogoUrl = uploadRes.secure_url;
          } catch (uploadErr) {
            setSubmitError('Logo upload failed. Please try again.');
            setIsSubmitting(false);
            return;
          }
        }

        const payload: any = {
          listingType: formData.businessType === 'both' ? ['product', 'service'] : formData.businessType === 'products' ? ['product'] : ['service'],
          businessName: formData.businessName,
          shortDescription: formData.shortDescription || 'Fresh local business profile.',
          businessPhone: formData.businessPhone || formData.phoneNumber,
          businessEmail: formData.email,
          location: {
            postcode: formData.postcode,
            addressLine1: formData.address || 'Local Street Address',
            city: localStorage.getItem('businessArea') || 'London',
            showPublicly: true,
          },
          sectorId: formData.sectorId,
          categoryId: formData.categoryId,
          subCategoryId: formData.subCategoryId,
          status: 'published',
          businessHours: formData.isStandardHours && !formData.is247 && !formData.isCustomHours
            ? [
                { dayOfWeek: 1, openTime: '09:00', closeTime: '17:00' },
                { dayOfWeek: 2, openTime: '09:00', closeTime: '17:00' },
                { dayOfWeek: 3, openTime: '09:00', closeTime: '17:00' },
                { dayOfWeek: 4, openTime: '09:00', closeTime: '17:00' },
                { dayOfWeek: 5, openTime: '09:00', closeTime: '17:00' },
              ]
            : formData.is247 
              ? [
                  { dayOfWeek: 1, openTime: '00:00', closeTime: '23:59', is24h: true },
                  { dayOfWeek: 2, openTime: '00:00', closeTime: '23:59', is24h: true },
                  { dayOfWeek: 3, openTime: '00:00', closeTime: '23:59', is24h: true },
                  { dayOfWeek: 4, openTime: '00:00', closeTime: '23:59', is24h: true },
                  { dayOfWeek: 5, openTime: '00:00', closeTime: '23:59', is24h: true },
                  { dayOfWeek: 6, openTime: '00:00', closeTime: '23:59', is24h: true },
                  { dayOfWeek: 0, openTime: '00:00', closeTime: '23:59', is24h: true },
                ]
              : formData.isCustomHours
                ? formData.customHours
                    .filter(day => day.isOpen)
                    .map(day => ({
                      dayOfWeek: day.dayOfWeek,
                      openTime: day.openTime,
                      closeTime: day.closeTime,
                    }))
                : undefined,
        };

        if (uploadedLogoUrl) {
          payload.logoUrl = uploadedLogoUrl;
        }

        if (payload.listingType.includes('product')) {
          payload.productSellerProfile = {
            sellingModes: formData.sellingModes.length > 0 ? formData.sellingModes : ['pickup'],
            hasAgeRestrictedItems: false,
          };
        }
        if (payload.listingType.includes('service')) {
          payload.serviceProviderProfile = {
            quoteOnly: false,
            hasPublicLiabilityInsurance: false,
            bookingAcceptance: formData.bookingAcceptance,
            minimumNotice: formData.minimumNotice,
            cancellationPolicy: formData.cancellationPolicy,
            bufferTime: formData.bufferTime,
            maxDailyBookings: formData.maxDailyBookings ? parseInt(formData.maxDailyBookings) : null,
            fulfillmentModel: formData.serviceFulfillmentModel,
            travelRadius: formData.travelRadius ? parseInt(formData.travelRadius) : null,
          };
        }

        await addListing(payload);

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
        setSubmitError(e?.message || 'Registration and profile creation failed. Please try again.');
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
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    } else if (currentStep === 0) {
      setShowInitialPrompt(true);
    }
  };

  useEffect(() => {
    if (currentStep === 1 && otp.length === 6 && !isSubmitting && !submitError) {
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  if (!isClient) return null;

  // ═══════════════════════════════════════════════════════
  // Pre-Onboarding Prompt
  // ═══════════════════════════════════════════════════════
  if (showInitialPrompt) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col relative overflow-y-auto overflow-x-hidden font-sans pt-16">
        {/* Subtle dot grid background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />


        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-[500px] flex flex-col space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 my-auto"
          >
            
            {/* Hero Illustration/Icon */}
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner transform rotate-3 hover:rotate-0 transition-transform">
                <svg className="w-10 h-10" viewBox="0 0 24 24">
                   <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.87z" />
                   <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z" />
                   <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 5 12c0-.79.13-1.57.38-2.32V6.53H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.37l4.06-3.13z" />
                   <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.39 0 3.18 2.12 1.21 5.37l4.06 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                 </svg>
              </div>
            </div>

            {/* Content Group */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Is your business on Google?
              </h1>
              <p className="text-base text-gray-500 max-w-sm mx-auto font-medium">
                Importing your business from Google saves time and ensures your profile is accurate.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 pt-2">
              <button 
                onClick={() => {
                  setShowInitialPrompt(false);
                  setShowBusinessPreviewPage(false);
                  setShowVerifyOwnershipPage(false);
                  setShowConnectGooglePage(false);
                  setShowBusinessTypePage(false);
                  setShowBusinessCategoryPage(false);
                  setShowLocalNetworkPage(false);
                  setShowQuickSetupPage(false);
                  setShowMembershipRoutingPage(false);
                  setShowLinkAccountPage(false);
                  setShowMembershipSelectionPage(false);
                  setShowReviewStorefrontPage(false);
                  setShowFindClaimPage(false);
                  setShowGoogleCategoryPage(true);
                }}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-base flex items-center justify-center shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-red-600 active:scale-[0.98] transition-all"
              >
                YES, IMPORT FROM GOOGLE
              </button>
              <button 
                onClick={() => {
                  setShowGoogleCategoryPage(false);
                  setShowFindClaimPage(false);
                  setShowBusinessPreviewPage(false);
                  setShowVerifyOwnershipPage(false);
                  setShowConnectGooglePage(false);
                  setShowBusinessTypePage(false);
                  setShowBusinessCategoryPage(false);
                  setShowLocalNetworkPage(false);
                  setShowQuickSetupPage(false);
                  setShowMembershipRoutingPage(false);
                  setShowLinkAccountPage(false);
                  setShowMembershipSelectionPage(false);
                  setShowReviewStorefrontPage(false);
                  setShowInitialPrompt(false);
                }}
                className="w-full h-14 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-base flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all"
              >
                NO, ENTER MANUALLY
              </button>
            </div>

            {/* Information Card */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <div className="bg-blue-100 p-1.5 rounded-lg shrink-0">
                <Shield className="text-blue-600 w-4 h-4" />
              </div>
              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                You can always manually enter your business details later if you choose "NO".
              </p>
            </div>

          </motion.div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Google Category Selection Page
  // ═══════════════════════════════════════════════════════
  if (showGoogleCategoryPage) {
    const categoryList = [
      { id: 'accounting', name: 'Accounting', icon: <Calculator className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'airport', name: 'Airport', icon: <Plane className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'amusement', name: 'Amusement Park', icon: <Ticket className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'aquarium', name: 'Aquarium', icon: <Umbrella className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'art_gallery', name: 'Art Gallery', icon: <Palette className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'atm', name: 'Atm', icon: <CreditCard className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'bakery', name: 'Bakery', icon: <Croissant className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'bank', name: 'Bank', icon: <Landmark className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'bar', name: 'Bar', icon: <Wine className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'cafe', name: 'Cafe', icon: <Coffee className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'restaurant', name: 'Restaurant', icon: <Utensils className="w-8 h-8 mb-2 mx-auto" /> },
      { id: 'store', name: 'Store', icon: <Store className="w-8 h-8 mb-2 mx-auto" /> },
    ];

    return (
      <div className="fixed top-16 inset-x-0 bottom-0 bg-gray-50 flex flex-col font-sans z-40 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 w-full py-4 px-4 sm:px-6 md:px-8 shadow-md z-10 sticky top-0">
          <div className="w-full mx-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-[2] w-full relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                defaultValue="Melbourne VIC, Australia"
                className="block w-full pl-11 pr-10 py-3 bg-white border-none rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black font-medium shadow-sm"
                placeholder="Search location..."
              />
              <button className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            {/* Distance Radar / Slider */}
            <div className="flex-[1.5] w-full flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-sm">
              <Map className="w-5 h-5 text-gray-500" />
              <div className="flex flex-col flex-1 w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Distance</span>
                  <span className="text-xs font-bold text-gray-900">5 km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  defaultValue="5"
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                />
              </div>
            </div>

            {/* Back to Prompt Button */}
            <button 
              onClick={() => {
                setShowGoogleCategoryPage(false);
                setShowInitialPrompt(true);
              }}
              className="hidden sm:block p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
          
          <div className="mb-8 mt-4">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Categories</h1>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black shadow-sm text-lg"
                placeholder="Find a category..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setShowGoogleCategoryPage(false);
                  setShowFindClaimPage(true);
                }}
                className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-gray-300 active:scale-95 transition-all group"
              >
                <div className="text-gray-700 group-hover:text-black transition-colors">
                  {cat.icon}
                </div>
                <span className="font-bold text-gray-800 text-sm mt-1">{cat.name}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Find & Claim Your Business Page
  // ═══════════════════════════════════════════════════════
  if (showFindClaimPage) {
    return (
      <div className="fixed top-16 inset-x-0 bottom-0 bg-white flex flex-col font-sans z-40">
        <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
          {/* Sidebar Search and Results */}
          <div className={`relative flex flex-col z-30 h-full transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarCollapsed ? 'w-0' : 'w-full md:w-[400px] lg:w-[480px]'} ${mapViewToggle === 'map' ? 'hidden md:flex' : 'flex'}`}>
            <aside className={`w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-hidden transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-full md:w-[400px] lg:w-[480px] h-full flex flex-col flex-shrink-0">
                {/* Search Header */}
                <div className="p-4 pt-8 md:pt-4 border-b border-gray-100 flex-shrink-0 transition-all duration-300 relative z-20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <button onClick={() => { setShowFindClaimPage(false); setShowInitialPrompt(true); }} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="pr-2">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Find & Claim Your Business</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium leading-snug">Search the directory to link your official business profile.</p>
                      </div>
                    </div>
                    {/* Mobile Collapse Arrow */}
                    <button 
                      onClick={() => setIsSearchHeaderCollapsed(!isSearchHeaderCollapsed)} 
                      className="md:hidden p-2 -mr-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0 shadow-sm"
                      aria-label="Toggle search fields"
                    >
                      {isSearchHeaderCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                  </div>
              
                  {/* Collapsible Content */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchHeaderCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-[400px] opacity-100 mb-2 mt-4 space-y-4'}`}>
                    {/* Multi-input Search Box */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm font-medium" placeholder="Business name or category" type="text" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm font-medium" placeholder="Borough, postcode, or city" type="text" />
                      </div>
                    </div>

                    {/* Radius Slider */}
                    <div className="pt-2 pb-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search Radius</label>
                        <span className="text-xs font-bold text-orange-600">5 miles</span>
                      </div>
                      <input className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" max="50" min="1" type="range" defaultValue="5" />
                    </div>
                  </div>
                </div>

            {/* View Toggle & Sort (Mobile Friendly) */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500">3 results found nearby</span>
              <div className="flex p-1 bg-gray-200 rounded-lg">
                <button onClick={() => setMapViewToggle('list')} className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-all ${mapViewToggle === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}>
                   List
                </button>
                <button onClick={() => setMapViewToggle('map')} className={`flex md:hidden items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-all ${mapViewToggle === 'map' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}>
                   Map
                </button>
              </div>
            </div>

            {/* Results Scroll Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {/* Business Card 1 */}
              <div className="group bg-white border border-gray-200 rounded-2xl p-3 flex gap-4 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer">
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLuLup_2kxtX6mJS-VcNrXwnsQsYDBvlAgISmW_YksxwZzLOLyP5JMMbKNcbh-5f5v-Mf6SjK8mNKExY7uxcbEAmTUtTKpm_Spog-jTXFGcpiqEOPorGy08-3L7HyBSPORJVurgvQGloT1TqrhgYKH2BCx0X2X45_nwNfkGYgm6UHRe2wCgHakXcl76eP-m8_bKkyDFcTcl9eRYYuQW9dh00Gd4bUmMhOS2vJlMpc0P8qglJPzEa5RJ9-u0" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">The Indigo Kitchen</h3>
                      <span className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-200">Unclaimed</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1 text-xs">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span className="font-bold">4.8</span>
                      <span className="text-gray-400">• European • ££</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">124 Baker St, Marylebone, NW1 6XE</p>
                  </div>
                  <button onClick={() => {
                      setSelectedPreviewBusiness({
                          googlePlaceId: 'mock_1',
                          businessName: 'The Indigo Kitchen',
                          address: '124 Baker St, Marylebone, NW1 6XE',
                          postcode: 'NW1 6XE',
                          googleCategoryId: 'gcid:restaurant',
                          businessPhone: '+44 20 7123 4567',
                          rating: '4.8',
                          reviews: '1,240',
                          type: 'Restaurant',
                          website: 'www.theindigokitchen.com',
                          hours: 'Open until 10:00 PM',
                          heroImg: 'https://lh3.googleusercontent.com/aida/AP1WRLutMNpev6WcnuTHJrB_bqpvVksnnweIXoMjdO6KNT8TxkrbYE6021UuCvBuUVI8lXqmTJBgVXWeT5N8omu9J2hf8uxSA5rXsaw6ccNFI71nSEaWyYedCytp5RsinavFnREFp0Vna0lGekkHUTJ8TYHI93aZc3ZyNzEJwJRYEvFGAbCvcHIx17FSukahs-Ig1sF4YGnGBFgYemhJNIlY4txOLVQ0N-iug_bROOpMUbVOP1uKzvV5enuhHg',
                          thumbImg: 'https://lh3.googleusercontent.com/aida/AP1WRLuqSbKkRpxnW4YEozQRIOMS_UJfqETepGIXrAzFxMnJ25SX7KgO-PYQ117n8E-b0_chZg3e6LljqRTEqrBlIvy2QiXqWNB8--Kqvmj37dKda3-RGjuf-pbl-1oeNDoL93HcelkE1TGrOOfFO8v8J_QWx4SXJ4DWWGTPfg7CuVCmuwz9l7qzilNjrsb2Zlt6n9OT0uwm86RmTIcAoER54ZIFfUA_fgfSaRJvk3d-3Dwd7Op-ugMCTmiUy9w'
                      });
                      setShowFindClaimPage(false);
                      setShowBusinessPreviewPage(true);
                  }} className="mt-2 text-orange-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Claim this business <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Business Card 2 */}
              <div className="group bg-gray-50 border border-gray-200 rounded-2xl p-3 flex gap-4 cursor-default opacity-75">
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 grayscale">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLuK5iw9CjRAO8IkIV6668oZMj0vmsDzM8bYVWe3F6rAWzf3s_oLKeTy8Ij-4K6AqUNT8Kd7Gy5miTU3qFev2Mte3NOgkItz1pC-4azY1HTIMyX2COhnDgG2yriThoU1Cp4zjsUNFE_k23pcUvfzdKSldEfwjseSlhdl-nYUBnoC0NgGcL_SZuLb_Gh8VOjR0hBo-BGNCvUTcGUbWZS-BEDj8yZF_w8kuod0XCx5Qp3TfP-oimam7AtYIw" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">The Sharp Cut</h3>
                      <span className="bg-green-50 text-green-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-green-200">Claimed</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1 text-xs">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span className="font-bold">4.6</span>
                      <span className="text-gray-400">• Barber • £</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">88 Marylebone High St, W1U 4QU</p>
                  </div>
                  <span className="mt-2 text-gray-400 text-xs font-medium italic flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Owner verified profile
                  </span>
                </div>
              </div>

              {/* Business Card 3 */}
              <div className="group bg-white border border-gray-200 rounded-2xl p-3 flex gap-4 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer">
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLutn6skbucCV30sZ5CHUu6wZpL_k9GM7QLQB5psmgY4KRd7jRJYKVHXqBtupPC66urmKRGvDMfafj_y6FdgN4j4VkPtpMWDryiVBgYiHbMudA3rpIWuF9iRj99oWUI5yIbGXqkmoNA8nuekRqb4RBy9iQMSlBkadapLYMsvE6fc6yVQdVwqh34ZTGSlQj3br8NxlWHtD5lrlIWZSM_FpwLv-CKo0wdY3dwotlsXBmSH8WwmAa1J5BGkCw" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Luxe Essentials</h3>
                      <span className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-200">Unclaimed</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1 text-xs">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span className="font-bold">4.9</span>
                      <span className="text-gray-400">• Retail • £££</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">12 George St, Marylebone, W1U 3PP</p>
                  </div>
                  <button onClick={() => {
                      setSelectedPreviewBusiness({
                          googlePlaceId: 'mock_3',
                          businessName: 'Luxe Essentials',
                          address: '12 George St, Marylebone, W1U 3PP',
                          postcode: 'W1U 3PP',
                          googleCategoryId: 'gcid:clothing_store',
                          businessPhone: '+44 20 8989 1234',
                          rating: '4.9',
                          reviews: '850',
                          type: 'Retail',
                          website: 'www.luxe-essentials.com',
                          hours: 'Open until 8:00 PM',
                          heroImg: 'https://lh3.googleusercontent.com/aida/AP1WRLutn6skbucCV30sZ5CHUu6wZpL_k9GM7QLQB5psmgY4KRd7jRJYKVHXqBtupPC66urmKRGvDMfafj_y6FdgN4j4VkPtpMWDryiVBgYiHbMudA3rpIWuF9iRj99oWUI5yIbGXqkmoNA8nuekRqb4RBy9iQMSlBkadapLYMsvE6fc6yVQdVwqh34ZTGSlQj3br8NxlWHtD5lrlIWZSM_FpwLv-CKo0wdY3dwotlsXBmSH8WwmAa1J5BGkCw',
                          thumbImg: 'https://lh3.googleusercontent.com/aida/AP1WRLutn6skbucCV30sZ5CHUu6wZpL_k9GM7QLQB5psmgY4KRd7jRJYKVHXqBtupPC66urmKRGvDMfafj_y6FdgN4j4VkPtpMWDryiVBgYiHbMudA3rpIWuF9iRj99oWUI5yIbGXqkmoNA8nuekRqb4RBy9iQMSlBkadapLYMsvE6fc6yVQdVwqh34ZTGSlQj3br8NxlWHtD5lrlIWZSM_FpwLv-CKo0wdY3dwotlsXBmSH8WwmAa1J5BGkCw'
                      });
                      setShowFindClaimPage(false);
                      setShowBusinessPreviewPage(true);
                  }} className="mt-2 text-orange-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Claim this business <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Not seeing your business? */}
              <div className="mt-8 p-6 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200 text-center">
                <h4 className="font-bold text-gray-900">Can't find your business?</h4>
                <p className="text-xs text-gray-500 mt-2 mb-4 font-medium leading-relaxed">If you're new or just moved in, you can create a fresh business listing on our platform.</p>
                <button onClick={() => {
                  setShowFindClaimPage(false);
                  setCurrentStep(0); // Manual flow
                }} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-[0.98]">
                    Add a New Business
                </button>
              </div>
            </div>
            </div>
            </aside>
            
            {/* Collapse/Expand Toggle Button */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex absolute top-[180px] right-0 translate-x-full w-8 h-16 bg-white border border-l-0 border-gray-200 rounded-r-xl shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] items-center justify-center text-gray-400 hover:text-orange-600 z-[60] transition-colors cursor-pointer outline-none focus:outline-none"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Map Section (Desktop Right) */}
          <section className={`flex-grow relative bg-gray-100 ${mapViewToggle === 'map' ? 'block absolute inset-0 z-20' : 'hidden md:block'}`}>
            <div className="absolute inset-0 grayscale-[0.2] opacity-90 contrast-[1.1]">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLuNzwxrl2iwl_GEfxnCkx5UFA1vsDwHDENTyV1udBmozSwamJtvjNaamIpmtnYhpfGY7Sm5yZSrIicyX_L7iwS_0SaEVl_t3mhgzYABbXLNu6yfBraa5hQp_0l9T2CCUVBmnFSj7A0JlrbTxh-z3NDK4HfsKVxjyPc1LN9lDT4zmAF-JwRcdaAtQEsrT4ClF-mvNPRbsGXHfR9sZ6gaDj7HrW1wgs-RggOWlLhHRHS2Ap3lphr5q4e0vkE" />
              
              {/* Map Pins */}
              <div className="absolute top-[40%] left-[45%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                <div className="relative flex flex-col items-center">
                  <div className="bg-orange-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce shadow-orange-500/40">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="hidden group-hover:block absolute top-full mt-2 w-48 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 shadow-xl z-20">
                    <p className="text-xs font-bold text-gray-900">The Indigo Kitchen</p>
                    <p className="text-[10px] font-medium text-gray-500 mt-0.5">4.8 Rating • European</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-[55%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-70">
                <div className="bg-gray-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              
              <div className="absolute top-[30%] left-[30%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                <div className="bg-orange-600 text-white p-2 rounded-full shadow-lg border-2 border-white shadow-orange-500/40">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            {/* Overlay Card (Contextual) */}
            <div className="absolute top-6 left-6 w-72 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-200 shadow-xl hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Live Search Area</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  We've found <strong className="text-gray-900">3 matches</strong> within 5 miles of your current selection. Drag the map or adjust the slider to expand.
              </p>
            </div>
          </section>
        </main>
        
        {/* Mobile footer navigation */}
        {mapViewToggle === 'map' && (
           <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
             <button onClick={() => setMapViewToggle('list')} className="text-gray-600 font-bold text-sm px-4 py-2 hover:bg-gray-50 rounded-xl">Back to List</button>
           </footer>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Business Profile Preview Page
  // ═══════════════════════════════════════════════════════
  if (showBusinessPreviewPage && selectedPreviewBusiness) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col font-sans overflow-x-hidden pt-16 pb-12">
        {/* Hero Section */}
        <div className="relative w-full h-64 overflow-hidden">
          {/* Floating Back Button */}
          <button 
            onClick={() => { setShowBusinessPreviewPage(false); setShowFindClaimPage(true); }}
            className="absolute top-4 left-4 z-30 w-10 h-10 bg-white/80 hover:bg-white text-orange-600 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm active:scale-95 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img alt="Interior" className="w-full h-full object-cover" src={selectedPreviewBusiness.heroImg} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Storefront Thumbnail Overlay */}
          <div className="absolute -bottom-6 left-6">
            <div className="w-24 h-24 rounded-xl border-4 border-white overflow-hidden shadow-lg bg-white">
              <img alt="Storefront" className="w-full h-full object-cover" src={selectedPreviewBusiness.thumbImg} />
            </div>
          </div>
        </div>

        <div className="mt-10 px-6 flex flex-col gap-6 max-w-3xl mx-auto w-full">
          {/* Business Identity */}
          <section className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{selectedPreviewBusiness.businessName}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-orange-600">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm ml-1">{selectedPreviewBusiness.rating}</span>
              </div>
              <span className="text-gray-500 font-medium text-sm">({selectedPreviewBusiness.reviews} reviews) • {selectedPreviewBusiness.type}</span>
            </div>
          </section>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 active:scale-95 transition-all text-orange-600">
              <Map className="w-6 h-6 mb-1" />
              <span className="font-bold text-[10px] tracking-wider">DIRECTIONS</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 active:scale-95 transition-all text-orange-600">
              <Phone className="w-6 h-6 mb-1" />
              <span className="font-bold text-[10px] tracking-wider">CALL</span>
            </button>
          </div>

          {/* Detailed Info List */}
          <section className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">Address</span>
                <p className="text-gray-500 text-sm font-medium">{selectedPreviewBusiness.address}</p>
              </div>
            </div>
            <div className="w-full h-px bg-gray-100"></div>
            
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">Opening Hours</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">Open</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">{selectedPreviewBusiness.hours}</p>
              </div>
            </div>
            <div className="w-full h-px bg-gray-100"></div>

            <div className="flex items-start gap-4">
              <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">Website</span>
                <a className="text-orange-600 text-sm font-bold underline" href="#">{selectedPreviewBusiness.website}</a>
              </div>
            </div>
          </section>

          {/* Verification Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-5 rounded-2xl flex gap-4 items-center shadow-lg shadow-orange-500/20">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base">Verify Ownership</span>
              <p className="text-sm font-medium opacity-90 mt-0.5">Confirming this is your business unlocks premium merchant tools.</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Shell */}
        <footer className="w-full mt-10 px-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <div className="text-center">
              <span className="font-bold text-[10px] text-gray-400 tracking-[0.2em] uppercase">Is this your business?</span>
            </div>
            <button onClick={() => {
                setShowBusinessPreviewPage(false);
                setShowVerifyOwnershipPage(true);
            }} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
              <span>CLAIM NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => {
                setShowBusinessPreviewPage(false);
                setShowFindClaimPage(true);
            }} className="w-full text-gray-500 hover:text-gray-900 font-bold text-xs py-2 active:opacity-60 transition-colors">
              NOT MY BUSINESS, SEARCH AGAIN
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Verify Ownership Page
  // ═══════════════════════════════════════════════════════
  if (showVerifyOwnershipPage && selectedPreviewBusiness) {
    return (
      <div className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden pb-40 pt-16">
        <main className="flex-grow flex flex-col px-6 pt-8 max-w-xl mx-auto w-full">
          {/* Back button */}
          <div className="flex justify-start mb-6">
            <button 
              onClick={() => { setShowVerifyOwnershipPage(false); setShowBusinessPreviewPage(true); }}
              className="flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          </div>
          {/* Headline Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Verify Ownership</h1>
            <p className="text-gray-500 font-medium">Choose how you'd like to verify you are the owner of this business.</p>
          </div>

          {/* Verification Options List */}
          <div className="space-y-4">
            {/* Option 1: Google (Recommended) */}
            <label className={`relative flex items-center p-4 bg-white border ${verifyMethod === 'google' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200'} rounded-2xl cursor-pointer hover:border-orange-300 transition-all active:scale-[0.98]`}>
              <input checked={verifyMethod === 'google'} onChange={() => setVerifyMethod('google')} className="hidden" name="verify_method" type="radio" value="google" />
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                <ShieldCheck className="text-orange-600 w-7 h-7" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">Google Verification</span>
                  <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-orange-200">Recommended</span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Instant verification via linked account</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-2 ${verifyMethod === 'google' ? 'border-orange-600 bg-orange-600' : 'border-gray-300'}`}>
                {verifyMethod === 'google' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </label>

            {/* Option 2: Email */}
            <label className={`relative flex items-center p-4 bg-white border ${verifyMethod === 'email' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200'} rounded-2xl cursor-pointer hover:border-orange-300 transition-all active:scale-[0.98]`}>
              <input checked={verifyMethod === 'email'} onChange={() => setVerifyMethod('email')} className="hidden" name="verify_method" type="radio" value="email" />
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                <Mail className="text-orange-600 w-7 h-7" />
              </div>
              <div className="flex-grow">
                <span className="font-bold text-gray-900 text-sm">Email Verification</span>
                <p className="text-xs text-gray-500 font-medium mt-0.5">to owner@indigo-kitchen.com</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-2 ${verifyMethod === 'email' ? 'border-orange-600 bg-orange-600' : 'border-gray-300'}`}>
                {verifyMethod === 'email' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </label>

            {/* Option 3: SMS */}
            <label className={`relative flex items-center p-4 bg-white border ${verifyMethod === 'sms' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200'} rounded-2xl cursor-pointer hover:border-orange-300 transition-all active:scale-[0.98]`}>
              <input checked={verifyMethod === 'sms'} onChange={() => setVerifyMethod('sms')} className="hidden" name="verify_method" type="radio" value="sms" />
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                <MessageSquare className="text-orange-600 w-7 h-7" />
              </div>
              <div className="flex-grow">
                <span className="font-bold text-gray-900 text-sm">SMS Verification</span>
                <p className="text-xs text-gray-500 font-medium mt-0.5">to •••• ••• 45</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-2 ${verifyMethod === 'sms' ? 'border-orange-600 bg-orange-600' : 'border-gray-300'}`}>
                {verifyMethod === 'sms' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </label>
          </div>

          {/* Illustration / Decor */}
          <div className="mt-12 flex justify-center pb-8">
            <div className="relative w-full max-w-[280px] aspect-square rounded-full bg-orange-50 flex items-center justify-center overflow-hidden">
              <img alt="Merchant verification background" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida/AP1WRLuvGVk7sCqcQlnPFGngel4qvlTHhBtKI74UE4avJxYI2HDp7O4_xkiu4Ht88m6n4as5F7Rf2jKmt8K3xw5_d2b08qkIiFVsUUXoG4HtCW9uSd5-iZFmie5MdLKoBAmS7qAC_Lp1XjrV6Q4lhxbsf03ND0AaZBVGywBzYCNjjCVgsGLGBOu8ikuGIL8dwmZRt5EsLGZjhJCBJYQHzk8KgNbI3b1bHrpZtTFGNrJLFIy_moNZoXtQuqGYkeE" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-100/50 to-transparent"></div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-gray-100">
                <ShieldCheck className="text-green-500 w-4 h-4" />
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Secure Verification</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Action */}
        <footer className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-xl mx-auto w-full">
            <button onClick={() => {
              if (verifyMethod === 'google') {
                setShowVerifyOwnershipPage(false);
                setShowConnectGooglePage(true);
              } else {
                // Mock logic for SMS/Email
                alert('Verification code sent via ' + verifyMethod.toUpperCase());
                setShowVerifyOwnershipPage(false);
                setShowConnectGooglePage(true);
              }
            }} className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600">
              Continue
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
            <p className="text-center text-xs font-medium text-gray-500 mt-4">
              Having trouble? <a className="text-orange-600 font-bold hover:underline" href="#">Contact Support</a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Connect Google Business Page
  // ═══════════════════════════════════════════════════════
  if (showConnectGooglePage && selectedPreviewBusiness) {
    return (
      <div className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden pt-16">
        <main className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-xl mx-auto w-full">
          {/* Back button */}
          <div className="flex justify-start mb-6">
            <button 
              onClick={() => { setShowConnectGooglePage(false); setShowVerifyOwnershipPage(true); }}
              className="flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          </div>
          {/* Header Text */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Connect your Google Business</h1>
            <p className="text-gray-500 font-medium">Import your business information automatically to speed up your setup process.</p>
          </div>

          {/* Central Visualization */}
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-orange-500 opacity-5 blur-3xl rounded-full transform group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center transform hover:rotate-3 transition-transform duration-300">
                <div className="grid grid-cols-2 gap-2 p-6">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#4285F4] rounded-sm"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#EA4335] rounded-sm"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#FBBC05] rounded-sm"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#34A853] rounded-sm"></div>
                </div>
              </div>
              
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center shadow-md animate-bounce border border-orange-200">
                <RefreshCw className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="mt-auto space-y-4">
            <button onClick={() => {
                setShowConnectGooglePage(false);
                setIsFinalizingStorefront(false);
                setShowBuildingStorefrontPage(true);
            }} className="w-full bg-white border border-gray-200 text-gray-900 h-14 rounded-xl flex items-center justify-center gap-3 px-6 shadow-sm active:scale-[0.98] transition-all hover:bg-gray-50 group">
              <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6001 10.2272C19.6001 9.51813 19.5364 8.83631 19.4183 8.18176H10.0001V12.0499H15.3819C15.1501 13.2999 14.4455 14.359 13.3864 15.0681V17.5772H16.6183C18.5092 15.8363 19.6001 13.2727 19.6001 10.2272Z" fill="#4285F4"></path>
                <path d="M10.0001 20C12.7001 20 14.9637 19.1045 16.6183 17.5773L13.3864 15.0682C12.491 15.6682 11.3455 16.0227 10.0001 16.0227C7.38642 16.0227 5.17279 14.2545 4.38188 11.8727H1.04553V14.4591C2.69553 17.7364 6.08188 20 10.0001 20Z" fill="#34A853"></path>
                <path d="M4.38188 11.8727C4.18188 11.2727 4.06824 10.6409 4.06824 9.99995C4.06824 9.35905 4.18188 8.72723 4.38188 8.12723V5.54087H1.04553C0.377353 6.88178 0 8.39541 0 9.99995C0 11.6045 0.377353 13.1181 1.04553 14.459L4.38188 11.8727Z" fill="#FBBC05"></path>
                <path d="M10.0001 3.97727C11.4683 3.97727 12.7864 4.48182 13.8228 5.47273L16.691 2.60455C14.9592 0.990909 12.6955 0 10.0001 0C6.08188 0 2.69553 2.26364 1.04553 5.54091L4.38188 8.12727C5.17279 5.74545 7.38642 3.97727 10.0001 3.97727Z" fill="#EA4335"></path>
              </svg>
              <span className="font-bold text-sm tracking-tight text-gray-700 group-hover:text-gray-900 transition-colors">SIGN IN WITH GOOGLE</span>
            </button>
            <button onClick={() => {
                setShowConnectGooglePage(false);
                setCurrentStep(0);
            }} className="w-full h-12 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors active:scale-95 duration-100">
              <span className="font-bold text-[10px] tracking-widest uppercase">I'LL ENTER DETAILS MANUALLY</span>
            </button>
          </div>

          {/* Informational Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3">
            <ShieldCheck className="text-orange-600 w-5 h-5 shrink-0" />
            <p className="text-xs font-medium text-gray-500 leading-relaxed">
              We only import your verified business location, hours, and contact info. We never post to your profile without permission.
            </p>
          </div>
        </main>

        {/* Contextual "Save and Exit" */}
        <footer className="p-4 flex justify-center pb-8">
          <button className="text-gray-400 font-bold text-xs hover:text-gray-900 hover:underline decoration-orange-500 underline-offset-4 transition-all">
            Save and Exit
          </button>
        </footer>
      </div>
    );
  }



  // ═══════════════════════════════════════════════════════
  // Business Type Page (Step 7)
  // ═══════════════════════════════════════════════════════
  if (showBusinessTypePage) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col font-sans overflow-x-hidden pt-14 pb-28">
        {/* Header / TopAppBar */}
        <nav className="flex justify-between items-center w-full px-4 h-14 z-50 bg-white fixed top-0 left-0 border-b border-gray-100 shadow-sm">
          <button onClick={() => { setShowBusinessTypePage(false); setShowConnectGooglePage(true); }} aria-label="Go back" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-6 h-6 text-orange-600" />
          </button>
          <div className="flex flex-col items-center">
            <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Step 7 of 12</span>
            <div className="w-32 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="w-[58%] h-full bg-orange-600 transition-all duration-500"></div>
            </div>
          </div>
          <button onClick={() => setShowComplete(true)} className="font-bold text-sm text-orange-600 px-3 py-1 rounded-lg hover:bg-orange-50 active:scale-95 transition-all">Save</button>
        </nav>

        {/* Main Content Canvas */}
        <main className="flex-grow pt-8 px-6 max-w-[640px] mx-auto w-full">
          {/* Hero Section */}
          <header className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">What do you offer?</h1>
            <p className="text-sm font-medium text-gray-500">Choose the category that best describes your core business activities.</p>
          </header>

          {/* Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <button
              onClick={() => setFormData({ ...formData, businessType: 'products' })}
              className={`p-6 rounded-2xl border-2 text-center transition-all outline-none flex flex-col items-center justify-center min-h-[200px] shadow-sm active:scale-95 ${formData.businessType === 'products' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'}`}
            >
              <Building2 className={`w-12 h-12 mb-4 transition-colors ${formData.businessType === 'products' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div className="font-bold text-gray-900 text-lg mb-1">Products Only</div>
              <div className="text-sm text-gray-500">Physical products storefront</div>
            </button>

            <button
              onClick={() => setFormData({ ...formData, businessType: 'services' })}
              className={`p-6 rounded-2xl border-2 text-center transition-all outline-none flex flex-col items-center justify-center min-h-[200px] shadow-sm active:scale-95 ${formData.businessType === 'services' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'}`}
            >
              <Globe className={`w-12 h-12 mb-4 transition-colors ${formData.businessType === 'services' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div className="font-bold text-gray-900 text-lg mb-1">Services Only</div>
              <div className="text-sm text-gray-500">Booking / service provider</div>
            </button>

            <button
              onClick={() => setFormData({ ...formData, businessType: 'both' })}
              className={`p-6 rounded-2xl border-2 text-center transition-all outline-none flex flex-col items-center justify-center min-h-[200px] shadow-sm active:scale-95 ${formData.businessType === 'both' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'}`}
            >
              <Crown className={`w-12 h-12 mb-4 transition-colors ${formData.businessType === 'both' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div className="font-bold text-gray-900 text-lg mb-1">Both</div>
              <div className="text-sm text-gray-500">Products and service bookings</div>
            </button>
          </div>
        </main>

        {/* Sticky Footer Button */}
        <footer className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-[640px] mx-auto">
            <button 
              disabled={!formData.businessType}
              onClick={() => {
                setShowBusinessTypePage(false);
                setShowBusinessCategoryPage(true);
              }}
              className={`w-full h-14 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-300 ${formData.businessType ? 'bg-gray-900 text-white hover:bg-black active:scale-95 shadow-xl' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Continue
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Business Category Page (Step 8)
  // ═══════════════════════════════════════════════════════
  if (showBusinessCategoryPage) {
    const toggleCategory = (cat: string) => {
      setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    return (
      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col items-center pb-32">
        {/* Top AppBar */}
        <header className="flex justify-between items-center w-full px-4 h-14 z-50 bg-white fixed top-0 left-0 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={() => { setShowBusinessCategoryPage(false); setShowBusinessTypePage(true); }} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-6 h-6 text-orange-600" />
            </button>
            <h1 className="text-xl font-black text-orange-600 tracking-tight">MCOMMALL</h1>
          </div>
          <div className="flex items-center">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
               <Bell className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-grow w-full max-w-[640px] px-6 pt-24 pb-12">
          {/* Onboarding Stepper */}
          <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">STEP 8 OF 12</span>
              <button className="text-orange-600 text-[10px] font-bold uppercase tracking-wider hover:text-orange-700 transition-colors">Save and Exit</button>
            </div>
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[66%] transition-all duration-500"></div>
            </div>
          </div>

          {/* Heading Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Select Your Category</h2>
            <p className="text-sm font-medium text-gray-500">We've suggested some categories based on your import.</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm" placeholder="Search other categories" type="text" />
          </div>

          {/* Selection Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Restaurant */}
            <button onClick={() => toggleCategory('Restaurant')} className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 text-center border-2 ${selectedCategories.includes('Restaurant') ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
              <Utensils className={`mb-2 w-7 h-7 transition-colors ${selectedCategories.includes('Restaurant') ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className={`text-sm font-bold transition-colors ${selectedCategories.includes('Restaurant') ? 'text-orange-700' : 'text-gray-700'}`}>Restaurant</span>
            </button>
            {/* Italian */}
            <button onClick={() => toggleCategory('Italian')} className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 text-center border-2 ${selectedCategories.includes('Italian') ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
              <UtensilsCrossed className={`mb-2 w-7 h-7 transition-colors ${selectedCategories.includes('Italian') ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className={`text-sm font-bold transition-colors ${selectedCategories.includes('Italian') ? 'text-orange-700' : 'text-gray-700'}`}>Italian</span>
            </button>
            {/* Fine Dining */}
            <button onClick={() => toggleCategory('Fine Dining')} className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 text-center border-2 ${selectedCategories.includes('Fine Dining') ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
              <Star className={`mb-2 w-7 h-7 transition-colors ${selectedCategories.includes('Fine Dining') ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className={`text-sm font-bold transition-colors ${selectedCategories.includes('Fine Dining') ? 'text-orange-700' : 'text-gray-700'}`}>Fine Dining</span>
            </button>
            {/* Bistro */}
            <button onClick={() => toggleCategory('Bistro')} className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 text-center border-2 ${selectedCategories.includes('Bistro') ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
              <Umbrella className={`mb-2 w-7 h-7 transition-colors ${selectedCategories.includes('Bistro') ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className={`text-sm font-bold transition-colors ${selectedCategories.includes('Bistro') ? 'text-orange-700' : 'text-gray-700'}`}>Bistro</span>
            </button>
            {/* Wine Bar */}
            <button onClick={() => toggleCategory('Wine Bar')} className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 text-center border-2 ${selectedCategories.includes('Wine Bar') ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
              <Wine className={`mb-2 w-7 h-7 transition-colors ${selectedCategories.includes('Wine Bar') ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className={`text-sm font-bold transition-colors ${selectedCategories.includes('Wine Bar') ? 'text-orange-700' : 'text-gray-700'}`}>Wine Bar</span>
            </button>
            {/* Cafe */}
            <button onClick={() => toggleCategory('Cafe')} className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 text-center border-2 ${selectedCategories.includes('Cafe') ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
              <Coffee className={`mb-2 w-7 h-7 transition-colors ${selectedCategories.includes('Cafe') ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className={`text-sm font-bold transition-colors ${selectedCategories.includes('Cafe') ? 'text-orange-700' : 'text-gray-700'}`}>Cafe</span>
            </button>
          </div>

          {/* Hint Card */}
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-4 items-start shadow-sm">
            <Lightbulb className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-orange-900 leading-relaxed">
              Selecting accurate categories helps local customers find you more easily during search and improves your store's visibility in the MCOMMALL community.
            </p>
          </div>
        </main>

        {/* Fixed Action Button / Bottom Footer */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 flex justify-center">
          <button 
            onClick={() => {
              setShowBusinessCategoryPage(false);
              setShowLocalNetworkPage(true);
            }}
            className="w-full max-w-[640px] bg-gray-900 hover:bg-black text-white font-bold text-sm py-4 rounded-xl shadow-xl active:scale-95 transition-all duration-100 flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Local Network Page (Step 9)
  // ═══════════════════════════════════════════════════════
  if (showLocalNetworkPage) {
    return (
      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-32">
        {/* Top AppBar */}
        <header className="flex justify-between items-center w-full px-4 h-14 z-50 bg-white fixed top-0 left-0 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => { setShowLocalNetworkPage(false); setShowBusinessCategoryPage(true); }} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-6 h-6 text-orange-600" />
            </button>
            <h1 className="text-xl font-black text-orange-600 tracking-tight">MCOMMALL</h1>
          </div>
          <div className="flex items-center">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 9 of 12</span>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-grow pt-24 pb-12 px-6 flex justify-center w-full">
          <div className="w-full max-w-[640px] flex flex-col gap-8">
            {/* Title Section */}
            <section className="text-center md:text-left">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Local Network</h2>
              <p className="text-sm font-medium text-gray-500">We've identified your business district to help you connect with the right shoppers.</p>
            </section>

            {/* Map & Location Card (Bento-style layout) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              {/* Visual Map Area */}
              <div className="h-48 w-full relative bg-gray-200 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida/AP1WRLsDnUCjMAn7qZUdsI1NbJgUWbPXFEErGrx5Fyjca_jlpCwbiN8VH_GW1vKNg00vC6vzDN4j51SSfmURwAEtr390wkpMtDR0c2xsYBTCpxnp6SIDnrWubTRJR9eV1GHbgwSLWTumf-cDp6wKxNXgAGaIVn_tOyiOKeFkuv-NVsCp8UM-1EcCLJe8M6NeavxSfd9C_CeDDMb9fah1TlJ3W4GE-LI1lAPQId1qzT0OE2f85qmDjXmbMfmsIF4" alt="Map" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-orange-600 tracking-wider">LIVE LOCATION DETECTED</span>
                </div>
              </div>
              {/* Location Details */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl text-orange-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Designation</p>
                    <h3 className="text-lg font-bold text-orange-600">Birmingham High Street Mall</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">Borough</p>
                    <p className="font-bold text-gray-900 text-sm">Birmingham B2</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">High Street</p>
                    <p className="font-bold text-gray-900 text-sm">Birmingham High St</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-3">
                  <CheckCircle2 className="text-orange-600 w-5 h-5 shrink-0" />
                  <p className="text-sm text-orange-800 font-bold">You are joining: Birmingham High Street Mall</p>
                </div>
              </div>
            </div>

            {/* Nearby Community Section */}
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <h4 className="text-lg font-bold text-gray-900">Nearby participating businesses</h4>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">42 active</span>
              </div>
              <div className="flex flex-col gap-3">
                {/* Merchant Avatars */}
                <div className="flex -space-x-3 overflow-hidden p-1">
                  <div className="w-12 h-12 rounded-full border-2 border-white ring-2 ring-gray-100 overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLvYewI3K94KKY1_DlRJEFb4o-Cnqrmgy7Boa2IEUNqdezwKQ0S2ECiIqsmwolVZcNF7gsrlUU6JhjrrPadA8q6NbPKDEUT2FeMkIvcUKyFimK0iOmGJFUp68DZx_ZcwMboy-rdCuM8n78ZB1lO9VeE__SggAi9qFH7fM9BtHNaWgoilxm0EsNWZbfslzJeuhWBZ_xCzZ3cD3Yy9M7DBMANyW1pixtf1EbKGjn5CXTxARBWOQdZ0dsTMTmU" alt="Merchant 1" 
                    onClick={() => {
                  setShowMembershipRoutingPage(false);
                  setShowLocalNetworkPage(true);
                }}/>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-white ring-2 ring-gray-100 overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLs0-5yaoQfQA3Ic6zhkxVXA7EYP0MeokZ6-cI-KDFnp2wVP2furSsMhsQxfRMbj3vaYDbqMDU8WU8EuxnnLkm85kYyz4On3gvjeEhXxdYDpfSdnoVTrLWh-IDcQUuYTS0zUGAhIPV1tBS6PmyeMwhH5a3Fp0FmpB2UCID414GFD1_4tuIhaRGPYQXJmvdACqvYnDwfWymilAD2IT7H7xGT221kEgMn3DZinQLEU9keC_3hV8wjGPDNWO5s" alt="Merchant 2" />
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-white ring-2 ring-gray-100 overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLudgDzpHvVrBEjQoKoOnkuWceMDHTmXvVQuSu7AtI9uAHsws1yO5IZcOHAzmcRQ9wrSGRVNhvgF2Kz5QReb944LeEFY-zmqR9HgITHtx-QYywvK3LMu7lHcH0Oi7bIMqh1odApyNLrx1qps3bCZ2H7JrYMSkxjtUxAQa-1lY9lu-nFoET84P_dLEXikmtniajfBpoaHPWbzIKHGgTkcukeT8Uhaz6Epp5ZgvPvaSOY48597QtVwlp2YraI" alt="Merchant 3" />
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-white ring-2 ring-gray-100 overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLuWJ-_1b8DfxUM4AxwNPgJxI8zHNAz11eHH7IaIzEcEbpe7sa2YwgrGpmeq-7p3Fxq3W2Y_hvYeo2JJaNB2yrlF2E3NE43NgTpDOZ3Cruk2ajrehYwRXV4vo1BhLj8x1ufiqyih52Ttki3Gu2QJGGm5ILrkvS-NNU72JTw-g0QCSbSsFzFKxg3w0Cxvmww5BYGdygcVtN9Eo-EHXjbWLcU2FhWhWKOh0tdbRfoYJMUgp5FXEXFw-RzBgZw" alt="Merchant 4" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border-2 border-white ring-2 ring-gray-100 text-xs font-black">
                    +38
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 italic">Join 40+ other local merchants already on the MCOMMALL network.</p>
              </div>
            </section>
          </div>
        </main>

        {/* Fixed Navigation Footer */}
        <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 py-4 z-50">
          <div className="max-w-[640px] mx-auto flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-600 h-full rounded-full transition-all duration-500 w-[75%]"></div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => { setShowLocalNetworkPage(false); setShowBusinessCategoryPage(true); }}
                className="px-6 py-3.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95 text-sm"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  setShowLocalNetworkPage(false);
                  setShowMembershipRoutingPage(true);
                }}
                className="flex-grow px-6 py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-md hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Membership Routing Page (Step 11)
  // ═══════════════════════════════════════════════════════
  if (showMembershipRoutingPage) {
    return (
      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-32">
        {/* Top AppBar */}
        <header className="flex justify-between items-center w-full px-4 h-14 z-50 bg-white fixed top-0 left-0 border-b border-gray-100 shadow-sm">
          <button onClick={() => { setShowMembershipRoutingPage(false); setShowLocalNetworkPage(true); }} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <h1 className="text-xl font-black text-orange-600 tracking-tight">MCOMMALL</h1>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-grow pt-24 pb-12 px-6 flex justify-center w-full">
          <div className="w-full max-w-[640px] flex flex-col gap-8">
            {/* Onboarding Progress Stepper */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Step 11 of 12</span>
                <span className="font-bold text-[10px] text-orange-600 uppercase tracking-widest">ALMOST THERE</span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 transition-all duration-500 w-[91.6%]"></div>
              </div>
            </div>

            {/* Heading Section */}
            <section className="text-center md:text-left">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Choose Your Membership Path</h2>
              <p className="text-sm font-medium text-gray-500">Whether you're continuing a legacy or starting fresh, we have the right tools for your business growth.</p>
            </section>

            {/* Routing Cards */}
            <div className="space-y-4">
              {/* Path A: Already a Member */}
              <button 
                onClick={() => { setShowMembershipRoutingPage(false); setShowLinkAccountPage(true); }}
                className="w-full group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Badge className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Already a Member</h3>
                    <p className="text-sm text-gray-500 font-medium">Link your 247GBS or MCOM membership using your unique ID</p>
                  </div>
                  <div className="self-center">
                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-orange-600 transition-colors" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-orange-600 group-hover:w-full transition-all duration-300"></div>
              </button>

              {/* Path B: Select a Plan */}
              <button 
                onClick={() => { setShowMembershipRoutingPage(false); setShowMembershipSelectionPage(true); }}
                className="w-full group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Select a Plan</h3>
                    <p className="text-sm text-gray-500 font-medium">Choose a new growth tier for your business</p>
                  </div>
                  <div className="self-center">
                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-orange-600 transition-colors" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-orange-600 group-hover:w-full transition-all duration-300"></div>
              </button>
            </div>

            {/* Decorative Image */}
            <div className="mt-4 rounded-2xl overflow-hidden relative h-48 bg-gray-100 border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-full object-cover mix-blend-multiply opacity-80" src="https://lh3.googleusercontent.com/aida/AP1WRLs-n6vIGc4C_3c5SXGYzXCL0uxcQVVhFh2TdkWokH9T8M6WuYq6glzAkipCCnlmSabIEcfSvdOy5Ol7UiKn67DTwmtbkCVoxGCtdMlqLjJuY-rhIon5heLrx9ZNRaVoEbQmb6hXCnQ-1zk0JJ4r06JWoBS3X6i5ZZc8QucCz32Zn8sQ3JqE-73NEilRazt1Mp0Dx7JkakHH82q13iElmQEfSy7RJvVdiG2WgD-pD3QsLFPFhnA0WolFSWo" alt="Workspace" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-6">
                <p className="text-sm font-medium text-gray-200 italic">"Success is a journey of continuous growth and collaboration."</p>
              </div>
            </div>

            {/* Secondary Action */}
            <div className="mt-8 flex flex-col items-center">
              <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-orange-600 transition-colors py-4">
                Save and Exit
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Link Your Account Page (Step 12)
  // ═══════════════════════════════════════════════════════
  if (showLinkAccountPage) {
    return (
      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-32">
        {/* Top Navigation Bar */}
        <header className="bg-white flex justify-between items-center w-full px-4 h-14 z-50 fixed top-0 border-b border-gray-100 shadow-sm">
          <button onClick={() => { setShowLinkAccountPage(false); setShowMembershipRoutingPage(true); }} className="text-orange-600 hover:bg-gray-100 p-2 rounded-full active:scale-95 duration-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-orange-600 tracking-tight">MCOMMALL</h1>
          <button className="text-orange-600 hover:bg-gray-100 p-2 rounded-full active:scale-95 duration-100">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-24 pb-10 max-w-[640px] mx-auto w-full">
          {/* Onboarding Progress Section */}
          <div className="w-full mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Existing Membership</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">STEP 11 OF 12</span>
            </div>
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-600 transition-all duration-500 w-[91.6%]"></div>
            </div>
          </div>

          {/* Visual Hero Element */}
          <div className="w-full aspect-[16/9] mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent z-10"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLsPkk1TptsiT6Gw6wQzYLumPo0dtdacIyPfbHOi0LA96BgDiiAzMRfXem8Qm3vuwwHHXskxl7nGklgHkVSOIPDEZ2VUVzu4B28BdkWsx1IffK709nqNJmXrWpknXdP1Xf0NCk6r58Yaiw4dg-MqMA3Tr8aLJczF0Z1QKRvKbrVMue8jZ35OgjcIlisDkb1Wojju901MyYSJ9I4QawgI0O5-tv5OD75WkDkd-wexocn6LJ_8UHG5jYXJVpY" alt="Merchant Interface" />
          </div>

          {/* Header */}
          <div className="w-full text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Link Your Account</h2>
            <p className="text-sm font-medium text-gray-500">Synchronize your established credentials to unlock premium merchant features.</p>
          </div>

          {/* Verification Form */}
          <div className="w-full bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2 ml-1" htmlFor="member_id">Member Unique ID / Code</label>
              <div className="relative group">
                <input 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-400" 
                  id="member_id" 
                  placeholder="e.g. MCOM-12345" 
                  type="text" 
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <Fingerprint className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-orange-900 leading-relaxed">
                Enter your 247GBS or MCOM credentials to sync your existing benefits and data.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-8 space-y-4">
            <button 
              onClick={() => { setShowLinkAccountPage(false); setShowQuickSetupPage(true); }}
              className="w-full bg-gray-900 text-white h-14 rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-md active:scale-95 duration-100"
            >
              Verify &amp; Continue
            </button>
            <button 
              onClick={() => { setShowLinkAccountPage(false); setShowMembershipRoutingPage(true); }}
              className="w-full bg-transparent text-gray-500 h-14 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors active:scale-95 duration-100"
            >
              Back
            </button>
          </div>

          {/* Secondary Info */}
          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-gray-500">
              Need help finding your ID? <a className="text-orange-600 font-bold hover:underline" href="#">Contact Support</a>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Membership Selection Page (Step 11 alternative)
  // ═══════════════════════════════════════════════════════
  if (showMembershipSelectionPage) {
    return (
      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-32">
        {/* Top Navigation Bar */}
        <header className="bg-white flex justify-between items-center w-full px-4 h-14 z-50 fixed top-0 border-b border-gray-100 shadow-sm">
          <button onClick={() => { setShowMembershipSelectionPage(false); setShowMembershipRoutingPage(true); }} className="text-orange-600 hover:bg-gray-100 p-2 rounded-full active:scale-95 duration-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-orange-600 tracking-tight">MCOMMALL</h1>
          <button className="text-orange-600 hover:bg-gray-100 p-2 rounded-full active:scale-95 duration-100">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        {/* Onboarding Stepper */}
        <div className="fixed top-14 left-0 w-full h-1 bg-gray-200 z-40">
          <div className="h-full bg-orange-600 w-[91.6%] transition-all duration-700 ease-out"></div>
        </div>

        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-24 pb-10 max-w-[1024px] mx-auto w-full">
          {/* Header Section */}
          <section className="mb-8 w-full text-center">
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Step 11 of 12</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Membership Selection</h2>
            <p className="text-sm text-gray-500 font-medium max-w-[600px] mx-auto">Choose a tier that matches your business velocity. Unlock premium features and community multipliers.</p>
          </section>

          {/* Membership Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* PAY-AS-YOU-GO Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 flex flex-col h-full border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="mb-4">
                <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-600 uppercase tracking-widest">Seasonal</span>
                <h3 className="text-2xl font-black mt-3 mb-1">PAY-AS-YOU-GO</h3>
                <p className="text-xs text-gray-500 font-medium">Basic Access to MCOM Ecosystem – Limited to services in the purchased seasonal package.</p>
              </div>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">Custom</span>
                <span className="text-xs text-gray-500 font-medium">/ season</span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {[
                  'External Evergreen Reward Programme QR Code',
                  'Directory Listing on 247GBS & MCOM Lead Traffic Hub',
                  'MCOM Wallet Access for payment & rewards',
                  'Seasonal Campaign Participation',
                  'Spare Capacity & Stock Audit Tool',
                  'Basic Consumer Rewards via Evergreen Programme',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-gray-700 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => { setShowMembershipSelectionPage(false); setShowQuickSetupPage(true); }}
                className="w-full py-4 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Select PAYG
              </button>
            </div>

            {/* CO-BRANDED Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 flex flex-col h-full border border-orange-200 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden ring-1 ring-orange-500">
              <div className="absolute -right-12 top-6 bg-orange-600 text-white px-12 py-1 rotate-45 text-[10px] font-bold tracking-widest uppercase shadow-md">Premium</div>
              <div className="mb-4">
                <span className="text-[10px] font-bold px-3 py-1 bg-orange-100 rounded-full text-orange-600 uppercase tracking-widest">Enterprise</span>
                <h3 className="text-2xl font-black mt-3 mb-1 text-orange-600">CO-BRANDED</h3>
                <p className="text-xs text-gray-500 font-medium">Highest tier – comprehensive access and control for serious growth.</p>
              </div>

              {/* Internal Tabs */}
              <div className="bg-gray-100 p-1 rounded-lg flex mb-4">
                <button 
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-md transition-all ${cobrandedTab === 'standard' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setCobrandedTab('standard')}
                >
                  Standard
                </button>
                <button 
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-md transition-all ${cobrandedTab === 'pro' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setCobrandedTab('pro')}
                >
                  Pro
                </button>
                <button 
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-md transition-all ${cobrandedTab === 'plus' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setCobrandedTab('plus')}
                >
                  Plus
                </button>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">
                  {cobrandedTab === 'standard' ? 'Standard' : cobrandedTab === 'pro' ? 'Pro' : 'Plus'}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {[
                  'All PAYG Benefits with full access',
                  'Customisable Rewards & Loyalty Program',
                  'White-Label Branding for cards & materials',
                  'Multiple QR Codes for branches',
                  ...(cobrandedTab === 'pro' || cobrandedTab === 'plus' ? [
                    'Priority Marketing Campaigns',
                    'Advanced Stock Audit Integration',
                    'Hyper-Local Partnerships',
                  ] : []),
                  ...(cobrandedTab === 'plus' ? [
                    'All Features Activated – No restrictions',
                    'Complete Automation & preset campaigns',
                    'Unlimited Consumer Rewards',
                  ] : []),
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-gray-700 leading-relaxed font-bold">{text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => { setShowMembershipSelectionPage(false); setShowQuickSetupPage(true); }}
                className="w-full py-4 bg-orange-600 text-white hover:bg-orange-700 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Select {cobrandedTab === 'standard' ? 'Standard' : cobrandedTab === 'pro' ? 'Pro' : 'Plus'}
              </button>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-4">
            <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-orange-600 transition-colors">
              Save and Exit
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Review Storefront Page (Step 13)
  // ═══════════════════════════════════════════════════════
  if (showReviewStorefrontPage) {
    const handleConfirm = () => {
      if (!termsAccepted) {
        setTermsError(true);
        setTimeout(() => setTermsError(false), 500);
        return;
      }
      setShowReviewStorefrontPage(false);
      setIsFinalizingStorefront(true);
      setShowBuildingStorefrontPage(true);
    };

    return (
      <div className="bg-orange-50/30 text-gray-900 min-h-screen flex flex-col font-sans pb-32 relative">
        {/* Header Navigation */}
        <header className="fixed top-0 w-full z-50 bg-white flex justify-between items-center px-4 h-16 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => { setShowReviewStorefrontPage(false); setShowQuickSetupPage(true); }} className="active:scale-95 transition-all p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-6 h-6 text-orange-600" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">STEP 13 OF 13</span>
              <h1 className="text-lg font-black text-orange-600 leading-tight">MCOMMALL</h1>
            </div>
          </div>
          <button className="hover:bg-gray-100 transition-colors text-orange-600 font-bold px-4 py-2 rounded-xl text-sm">
            Save & Exit
          </button>
        </header>

        {/* Onboarding Stepper Indicator */}
        <div className="pt-16 w-full">
          <div className="h-1 w-full bg-gray-200 flex">
            <div className="h-full bg-orange-600 w-full transition-all duration-700"></div>
          </div>
        </div>

        <main className="max-w-[800px] mx-auto px-4 pt-8 space-y-6 w-full flex-grow">
          {/* Title & Intro */}
          <header className="text-center space-y-2 mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Review Your Storefront</h2>
            <p className="text-sm font-medium text-gray-500 px-4 max-w-lg mx-auto">Ensure everything is perfect before launching your business to the community.</p>
          </header>

          {/* Asymmetric Bento-style Grid Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Profile Card (Full Width) */}
            <section className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Business Profile</h3>
                    <p className="text-xs font-medium text-gray-500">The core identity of your brand.</p>
                  </div>
                </div>
                <button className="text-orange-600 font-bold text-[10px] uppercase tracking-widest hover:underline">EDIT</button>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legal Name</p>
                  <p className="text-base font-bold text-gray-900">{formData.businessName || 'Artisanal Roast & Co.'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</p>
                  <p className="text-base font-bold text-gray-900">{selectedCategories.join(', ') || 'Specialty Cafe'}</p>
                </div>
              </div>
            </section>

            {/* Local Placement */}
            <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Local Placement</h3>
                </div>
                <button className="text-orange-600 font-bold text-[10px] uppercase tracking-widest hover:underline">EDIT</button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Primary Hub</p>
                  <p className="text-sm font-bold text-gray-900">{formData.city || 'Richmond Borough'} / {formData.postcode || 'High Street'}</p>
                </div>
                <div className="h-32 w-full rounded-xl overflow-hidden relative shadow-inner">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLuTyrpX6dGrEKR9oKiIoEa2O1LEGc70eQ1BvTi7Ys9rD032rrjNNp8qhA-sGjNQoHUXCgd-60nRbgjVxQ10BMATMAYKgaTqDgtBVV5DuNMELX3WYnFWSqdKIr1P5LdX-k5VcCVuVlpECLzkHFqB3AG0nKkk-Oqr79YMkx9zeF75Gpyzs0Sc4vv3Ghix7tgWiDlgirDeoc0Roj8fVt9rqJmrZGzfyz5MADjtCBk4oMnRLg9sIxJF2vbhAQ" alt="Map Location" />
                </div>
              </div>
            </section>

            {/* Membership Plan */}
            <section className="bg-blue-50/50 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Membership</h3>
                </div>
                <button className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline">EDIT</button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-blue-600">Growth</span>
                  <span className="text-xs font-bold text-blue-400">Annual Subscription</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Unlimited Community Posts</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Advanced Operational Analytics</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Products & Services */}
            <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Inventory</h3>
                </div>
                <button className="text-orange-600 font-bold text-[10px] uppercase tracking-widest hover:underline">EDIT</button>
              </div>
              <div className="flex gap-4 h-full items-center">
                <div className="flex-1 text-center border-r border-gray-100 py-2">
                  <p className="text-4xl font-black text-orange-600">24</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Products</p>
                </div>
                <div className="flex-1 text-center py-2">
                  <p className="text-4xl font-black text-orange-600">08</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Services</p>
                </div>
              </div>
            </section>

            {/* Enabled Features */}
            <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Puzzle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Features</h3>
                </div>
                <button className="text-orange-600 font-bold text-[10px] uppercase tracking-widest hover:underline">EDIT</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-orange-200">
                  <Heart className="w-3.5 h-3.5" /> Loyalty
                </span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-orange-200">
                  <Gift className="w-3.5 h-3.5" /> Rewards
                </span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-orange-200">
                  <Truck className="w-3.5 h-3.5" /> Delivery
                </span>
                <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200">
                  +2 more
                </span>
              </div>
            </section>
          </div>

          {/* Terms Agreement */}
          <div className={`flex items-start gap-3 p-5 bg-white/50 border rounded-2xl transition-all duration-300 ${termsError ? 'border-red-500 bg-red-50/50 animate-shake' : 'border-gray-200'}`}>
            <input 
              className="mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5 cursor-pointer" 
              id="terms" 
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-600 leading-relaxed cursor-pointer" htmlFor="terms">
              I confirm that all provided information is accurate and I agree to the MCOMMALL <a className="text-orange-600 font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-orange-600 font-bold hover:underline" href="#">Community Guidelines</a>.
            </label>
          </div>
        </main>

        {/* Bottom Action Bar (Fixed) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex flex-col gap-3 z-40">
          <div className="max-w-[800px] mx-auto w-full flex flex-col md:flex-row-reverse gap-3">
            <button 
              onClick={handleConfirm}
              className="w-full md:w-2/3 bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-orange-700"
            >
              CONFIRM & GO LIVE
              <Rocket className="w-5 h-5" />
            </button>
            <button className="w-full md:w-1/3 text-gray-500 font-bold py-4 rounded-xl transition-colors hover:bg-gray-100 uppercase tracking-widest text-xs">
              Save for later
            </button>
          </div>
        </div>

        {/* Success Feedback Overlay */}
        <AnimatePresence>
          {storefrontLive && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Storefront Live!</h2>
                <p className="text-base font-medium text-gray-500 mb-8 leading-relaxed">Congratulations, your business is now visible to the local community.</p>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.3s ease-in-out 0s 2; }
        `}} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Quick Setup Page (Step 10)
  // ═══════════════════════════════════════════════════════
  if (showQuickSetupPage) {
    const premiumFeatures = ['promotions', 'gamification', 'bookings', 'events'];

    const handleToggle = (key: keyof typeof quickSetupToggles) => {
      // If trying to turn ON a premium feature
      if (premiumFeatures.includes(key) && !quickSetupToggles[key]) {
        setLockedFeatureAttempt(key);
        return;
      }
      setQuickSetupToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans pb-32">
        {/* Top Navigation Bar */}
        <header className="bg-white flex justify-between items-center w-full px-4 h-14 z-50 fixed top-0 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => { setShowQuickSetupPage(false); setShowMembershipSelectionPage(true); }} className="hover:bg-gray-100 p-2 rounded-full transition-colors active:scale-95">
              <ChevronLeft className="w-6 h-6 text-orange-600" />
            </button>
            <h1 className="text-xl font-black text-orange-600 tracking-tight">MCOMMALL</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xs">JD</span>
            </div>
          </div>
        </header>

        <main className="max-w-[1280px] mx-auto px-6 pt-24 pb-32 w-full flex-grow flex justify-center">
          <div className="w-full max-w-[640px]">
            {/* Onboarding Stepper */}
            <div className="w-full mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Merchant Onboarding</span>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Step 10 of 12</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 transition-all duration-700 ease-in-out w-[83.33%]"></div>
              </div>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Quick Setup</h2>
              <p className="text-sm font-medium text-gray-500">Toggle the features you'd like to enable for your storefront. You can customize these later in your dashboard.</p>
            </div>

            {/* Feature Toggles Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="divide-y divide-gray-100">
                {/* Toggle Row: Loyalty */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Enable Loyalty</h3>
                      <p className="text-xs font-medium text-gray-500">Allow customers to earn points on every purchase.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={quickSetupToggles.loyalty} onChange={() => handleToggle('loyalty')} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${quickSetupToggles.loyalty ? 'bg-orange-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform border border-gray-200 ${quickSetupToggles.loyalty ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                {/* Toggle Row: Rewards */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Enable Rewards</h3>
                      <p className="text-xs font-medium text-gray-500">Offer milestone gifts and birthday surprises.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={quickSetupToggles.rewards} onChange={() => handleToggle('rewards')} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${quickSetupToggles.rewards ? 'bg-orange-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform border border-gray-200 ${quickSetupToggles.rewards ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                {/* Toggle Row: Promotions */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Enable Promotions</h3>
                      <p className="text-xs font-medium text-gray-500">Run flash sales and seasonal discount campaigns.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={quickSetupToggles.promotions} onChange={() => handleToggle('promotions')} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${quickSetupToggles.promotions ? 'bg-orange-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform border border-gray-200 ${quickSetupToggles.promotions ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                {/* Toggle Row: Gamification */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Enable Gamification</h3>
                      <p className="text-xs font-medium text-gray-500">Add interactive challenges and leaderboards.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={quickSetupToggles.gamification} onChange={() => handleToggle('gamification')} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${quickSetupToggles.gamification ? 'bg-orange-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform border border-gray-200 ${quickSetupToggles.gamification ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                {/* Toggle Row: Bookings */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Enable Bookings</h3>
                      <p className="text-xs font-medium text-gray-500">Accept appointments and reservations directly.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={quickSetupToggles.bookings} onChange={() => handleToggle('bookings')} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${quickSetupToggles.bookings ? 'bg-orange-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform border border-gray-200 ${quickSetupToggles.bookings ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                {/* Toggle Row: Events */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Enable Events</h3>
                      <p className="text-xs font-medium text-gray-500">Promote and sell tickets for in-store events.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={quickSetupToggles.events} onChange={() => handleToggle('events')} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${quickSetupToggles.events ? 'bg-orange-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform border border-gray-200 ${quickSetupToggles.events ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
                {/* Toggle Row: Vouchers */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Enable Vouchers</h3>
                      <p className="text-xs font-medium text-gray-500">Issue digital gift cards and store credit.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={quickSetupToggles.vouchers} onChange={() => handleToggle('vouchers')} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${quickSetupToggles.vouchers ? 'bg-orange-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform border border-gray-200 ${quickSetupToggles.vouchers ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 mt-8">
              <button 
                onClick={() => { setShowQuickSetupPage(false); setShowMembershipRoutingPage(true); }}
                className="w-full md:w-auto px-10 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
              >
                Back
              </button>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button className="hidden md:block px-6 py-3 rounded-full text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-orange-600 transition-colors">
                  Save and Exit
                </button>
                <button 
                  onClick={() => { setShowQuickSetupPage(false); setShowReviewStorefrontPage(true); }}
                  className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-md hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button className="md:hidden mt-4 w-full text-center text-gray-500 font-bold text-xs uppercase tracking-widest">
              Save and Exit
            </button>
          </div>
        </main>

        {/* Premium Upgrade Modal Overlay */}
        <AnimatePresence>
          {lockedFeatureAttempt && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-6 mx-auto">
                  <Crown className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-center mb-2 text-gray-900 capitalize">
                  Unlock {lockedFeatureAttempt}
                </h3>
                <p className="text-sm font-medium text-gray-500 text-center mb-8">
                  This is a premium feature. Subscribe to a Co-Branded or PAYG plan to enable {lockedFeatureAttempt} for your storefront.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setLockedFeatureAttempt(null);
                      setShowQuickSetupPage(false);
                      setShowMembershipRoutingPage(true);
                    }}
                    className="w-full py-4 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-lg hover:bg-orange-700 transition-all active:scale-95"
                  >
                    View Plans
                  </button>
                  <button 
                    onClick={() => setLockedFeatureAttempt(null)}
                    className="w-full py-4 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Not Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

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
          onClick={() => {
            if (formData.businessType === 'both') {
              router.push('/dashboard/store/products/add-product?fromOnboarding=true&hybridFlow=true');
            } else if (formData.businessType === 'products') {
              router.push('/dashboard/store/products/add-product?fromOnboarding=true');
            } else if (formData.businessType === 'services') {
              router.push('/dashboard/services/add-service?fromOnboarding=true');
            } else {
              router.push('/dashboard');
            }
          }}
          className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-500/25 flex items-center gap-2"
        >
          {formData.businessType === 'products' || formData.businessType === 'both' ? 'Start Product Setup' : 'Start Service Setup'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Building Storefront Page (Immersive Loading State)
  // ═══════════════════════════════════════════════════════
  if (showBuildingStorefrontPage) {
    return (
      <BuildingStorefrontPage
        onComplete={() => {
          setShowBuildingStorefrontPage(false);
          if (isFinalizingStorefront) {
            setShowWelcomeChecklistPage(true);
          } else {
            setShowBusinessTypePage(true);
          }
        }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════
  // Welcome Checklist Page (Final Dashboard Destination)
  // ═══════════════════════════════════════════════════════
  if (showWelcomeChecklistPage) {
    return <WelcomeChecklistPage onComplete={() => router.push('/dashboard')} />;
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
              Step {currentStep + 1} of {activeQuests.length}
            </span>
            <span className="text-xs text-gray-400">
              {Math.round((completedSteps.size / activeQuests.length) * 100)}% complete
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              animate={{ width: `${((currentStep + 1) / activeQuests.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ─── Quest Map — connected icon nodes ────────── */}
        <div className="flex items-center mb-2 sm:mb-6 px-1">
          {activeQuests.map((quest, i) => {
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
                {i < activeQuests.length - 1 && (
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
          <ParticleBurst color={isGoogleOnboarding ? '#ea580c' : currentQuest.color} trigger={particleTrigger} />

          <AnimatePresence mode="wait">
            <motion.div
              key={isGoogleOnboarding ? `google-${googleStep}` : currentStep}
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 overflow-hidden"
            >
              {/* Colored top stripe */}
              <div className="h-1.5" style={{ backgroundColor: isGoogleOnboarding ? '#ea580c' : currentQuest.color }} />

              <div className="p-6 sm:p-8">
                {/* Quest header */}
                <div className="flex items-start gap-3 mb-6 sm:mb-8">
                  <div
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isGoogleOnboarding ? '#fff7ed' : currentQuest.colorLight }}
                  >
                    {isGoogleOnboarding ? (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#ea580c" d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.05 3.1l3.17 2.46c1.85-1.71 2.9-4.22 2.9-7.26c0-.62-.05-1.21-.15-2z" />
                        <path fill="#f97316" d="M12 21c2.43 0 4.47-.8 5.96-2.2l-3.17-2.46c-.88.6-2.01.96-3.12.96c-2.4 0-4.44-1.63-5.17-3.82l-3.28 2.54C4.7 18.73 8.08 21 12 21z" />
                        <path fill="#f59e0b" d="M6.83 13.48a5.35 5.35 0 0 1 0-2.96L3.55 7.98A9.9 9.9 0 0 0 2 12c0 1.48.33 2.89.92 4.16l3.91-3.08z" />
                        <path fill="#ef4444" d="M12 5.7c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 3.03 14.42 2.3 12 2.3C8.08 2.3 4.7 4.57 2.92 8l3.28 2.54c.73-2.19 2.77-3.84 5.17-3.84z" />
                      </svg>
                    ) : (
                      <QuestIcon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: currentQuest.color }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                      {isGoogleOnboarding ? (
                        googleStep === 'branch_select' ? 'Select Your Branch' :
                        googleStep === 'fail_safe_form' ? 'Complete Profile Gaps' :
                        'Review & Claim Storefront'
                      ) : currentQuest.title}
                    </h2>
                    <p className="text-gray-500 mt-0.5 text-xs sm:text-sm sm:mt-1">
                      {isGoogleOnboarding ? (
                        googleStep === 'branch_select' ? 'Select the Google Business Profile branch you want to onboard.' :
                        googleStep === 'fail_safe_form' ? 'Google was missing some info. Fill the gaps below to proceed.' :
                        'Verify your details and click Claim to create your account.'
                      ) : currentQuest.flavor}
                    </p>
                  </div>
                </div>

                {/* --- Google Onboarding Step: Branch Select --- */}
                {isGoogleOnboarding && googleStep === 'branch_select' && (
                  <div className="space-y-4">
                    {isSubmitting ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"
                        />
                        <p className="text-sm text-gray-500 font-semibold animate-pulse">Fetching managed branches...</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3">
                          {googleBranches.map((branch) => (
                            <motion.button
                              key={branch.googlePlaceId}
                              whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleGoogleSelectBranch(branch)}
                              className="w-full p-4 rounded-xl border border-gray-100 bg-white hover:border-orange-200 text-left transition-colors flex items-start gap-4 shadow-sm"
                            >
                              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm truncate">{branch.businessName}</h4>
                                <p className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  {branch.address}
                                </p>
                                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                  Category: {branch.googleCategoryId.replace('gcid:', '').replace('_', ' ')}
                                </span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 self-center" />
                            </motion.button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* --- Google Onboarding Step: Fail Safe Form --- */}
                {isGoogleOnboarding && googleStep === 'fail_safe_form' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Business Name (Imported)</label>
                      <div className="relative">
                        <Input value={selectedGoogleBranch?.businessName || ''} disabled className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-500 pr-10 font-bold" />
                        <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Business Address (Imported)</label>
                      <div className="relative">
                        <Input value={selectedGoogleBranch?.address || ''} disabled className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-500 pr-10" />
                        <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Phone Number {(!selectedGoogleBranch?.businessPhone) && <span className="text-red-500">*</span>}
                      </label>
                      <Input
                        value={googlePhoneInput}
                        onChange={(e) => setGooglePhoneInput(e.target.value)}
                        className={`h-11 rounded-xl bg-white border-gray-200 text-sm ${(!selectedGoogleBranch?.businessPhone) ? 'border-amber-300 focus-visible:ring-amber-300 bg-amber-50/10' : ''}`}
                        placeholder="+44 7700 900000"
                      />
                      {(!selectedGoogleBranch?.businessPhone) && (
                        <p className="text-[11px] text-amber-600 mt-1 font-semibold">Google did not provide a phone number. Please enter it here.</p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/20 space-y-4">
                      <p className="text-xs text-amber-800 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        Assign Storefront Categories
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Sector</label>
                          <select
                            value={googleSectorId}
                            onChange={(e) => {
                              setGoogleSectorId(e.target.value);
                              setGoogleCategoryId('');
                              setGoogleSubCategoryId('');
                            }}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
                          >
                            <option value="">Select Sector</option>
                            {sectors?.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                          <select
                            value={googleCategoryId}
                            onChange={(e) => {
                              setGoogleCategoryId(e.target.value);
                              setGoogleSubCategoryId('');
                            }}
                            disabled={!googleSectorId}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                          >
                            <option value="">Select Category</option>
                            {googleCategories?.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Subcategory</label>
                          <select
                            value={googleSubCategoryId}
                            onChange={(e) => setGoogleSubCategoryId(e.target.value)}
                            disabled={!googleCategoryId}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                          >
                            <option value="">Select Subcategory</option>
                            {googleSubcategories?.map(sc => (
                              <option key={sc.id} value={sc.id}>{sc.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {submitError && (
                      <p className="text-red-500 text-xs font-bold">{submitError}</p>
                    )}
                  </div>
                )}

                {/* --- Google Onboarding Step: Review & Claim --- */}
                {isGoogleOnboarding && googleStep === 'review_claim' && (
                  <div className="space-y-4">
                    {/* Storefront Review Summary Card */}
                    <div className="p-5 rounded-2xl border border-orange-100 bg-orange-50/20 relative overflow-hidden">
                      <div className="absolute right-4 top-4">
                        <span className="flex items-center gap-1 bg-green-500/10 border border-green-500/25 rounded-full px-2.5 py-0.5 text-[10px] font-black text-green-700 uppercase">
                          <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                          Verified
                        </span>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shadow-orange-500/20 shrink-0">
                          {selectedGoogleBranch?.businessName[0]}
                        </div>
                        <div className="flex-1 min-w-0 pr-16">
                          <h4 className="font-extrabold text-gray-900 text-base leading-tight truncate">{selectedGoogleBranch?.businessName}</h4>
                          <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">{selectedGoogleBranch?.address}</p>
                          <p className="text-xs text-gray-400 mt-1">{googlePhoneInput}</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Account Information */}
                    <div className="p-4 rounded-xl border border-gray-150/40 bg-gray-50/50 space-y-4">
                      <h4 className="font-bold text-gray-800 text-sm">Owner Account Details</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                          <Input value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} placeholder="Jane" className="h-10 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                          <Input value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} placeholder="Smith" className="h-10 rounded-lg text-xs" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Login Email (Verified Google Account)</label>
                        <Input value={googleEmail} disabled className="h-10 rounded-lg text-xs bg-gray-100 text-gray-400" />
                      </div>
                    </div>

                    {/* McomMall Commerce Model */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">What do you sell in your storefront?</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['products', 'services', 'both'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setOwnerBusinessType(t)}
                            className="p-3.5 rounded-xl border text-center transition-colors font-bold text-xs uppercase cursor-pointer"
                            style={{
                              borderColor: ownerBusinessType === t ? '#ea580c' : '#e5e7eb',
                              backgroundColor: ownerBusinessType === t ? '#fff7ed' : '#fff',
                              color: ownerBusinessType === t ? '#ea580c' : '#4b5563',
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {submitError && (
                      <p className="text-red-500 text-xs font-bold">{submitError}</p>
                    )}
                  </div>
                )}

                {/* ─── Step 0: Email (Normal flow) ────────────────── */}
                {!isGoogleOnboarding && currentQuest.id === 'email' && (
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
                {!isGoogleOnboarding && currentQuest.id === 'otp' && (
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
                {currentQuest.id === 'postcode' && (
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
                {currentQuest.id === 'details' && (
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

                {/* ─── Step 4: Business Profile Setup ─── */}
                {currentQuest.id === 'profile' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Business Name
                      </label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        className="h-12 rounded-xl border-gray-200 bg-white text-base placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                        placeholder="Your business name"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Business Description
                      </label>
                      <textarea
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        className="w-full min-h-[5.5rem] p-3 rounded-xl border border-gray-200 bg-white text-base placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder="Describe your business in a few sentences..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Business Phone Number
                      </label>
                      <Input
                        value={formData.businessPhone}
                        onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        className="h-12 rounded-xl border-gray-200 bg-white text-base placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                        placeholder="+44 7700 900000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Business Logo
                      </label>
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
                          minHeight: '8rem',
                          borderColor: formData.logo ? '#ea580c' : '#d1d5db',
                          backgroundColor: formData.logo ? '#fff7ed' : '#fafafa',
                        }}
                      >
                        {formData.logo ? (
                          <div className="flex flex-col items-center justify-center gap-2 py-4 px-4 w-full">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-16 h-16 rounded-xl overflow-hidden shadow-md border border-orange-100 bg-white flex-shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={formData.logo} alt="Business Logo Preview" className="w-full h-full object-cover" />
                            </motion.div>
                            <span className="font-bold text-orange-700 text-xs">Logo selected</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-5 gap-1.5">
                            <Upload className="w-8 h-8 text-gray-300" />
                            <span className="font-semibold text-gray-400 text-xs">Click to select your logo</span>
                            <span className="text-gray-300 text-[10px]">PNG, SVG, or JPG</span>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* ─── Step 5: Business Type Selection ─── */}
                {currentQuest.id === 'business_type' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFormData({ ...formData, businessType: 'products' })}
                      className="p-5 rounded-xl border-2 text-left transition-colors outline-none flex flex-col items-center text-center justify-center"
                      style={{
                        borderColor: formData.businessType === 'products' ? currentQuest.color : '#e5e7eb',
                        backgroundColor: formData.businessType === 'products' ? currentQuest.colorLight : '#fff',
                      }}
                    >
                      <Building2
                        className="w-8 h-8 mb-2"
                        style={{ color: formData.businessType === 'products' ? currentQuest.color : '#9ca3af' }}
                      />
                      <div className="font-bold text-gray-900 text-sm">Products Only</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Physical products storefront</div>
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFormData({ ...formData, businessType: 'services' })}
                      className="p-5 rounded-xl border-2 text-left transition-colors outline-none flex flex-col items-center text-center justify-center"
                      style={{
                        borderColor: formData.businessType === 'services' ? currentQuest.color : '#e5e7eb',
                        backgroundColor: formData.businessType === 'services' ? currentQuest.colorLight : '#fff',
                      }}
                    >
                      <Globe
                        className="w-8 h-8 mb-2"
                        style={{ color: formData.businessType === 'services' ? currentQuest.color : '#9ca3af' }}
                      />
                      <div className="font-bold text-gray-900 text-sm">Services Only</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Booking / service provider</div>
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFormData({ ...formData, businessType: 'both' })}
                      className="p-5 rounded-xl border-2 text-left transition-colors outline-none flex flex-col items-center text-center justify-center"
                      style={{
                        borderColor: formData.businessType === 'both' ? currentQuest.color : '#e5e7eb',
                        backgroundColor: formData.businessType === 'both' ? currentQuest.colorLight : '#fff',
                      }}
                    >
                      <Crown
                        className="w-8 h-8 mb-2"
                        style={{ color: formData.businessType === 'both' ? currentQuest.color : '#9ca3af' }}
                      />
                      <div className="font-bold text-gray-900 text-sm">Both</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Products and service bookings</div>
                    </motion.button>
                  </div>
                )}

                {/* ─── Step 6: Category Selection ─── */}
                {currentQuest.id === 'category' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sector</label>
                      <select
                        value={formData.sectorId}
                        onChange={(e) => setFormData({ ...formData, sectorId: e.target.value, categoryId: '', subCategoryId: '' })}
                        className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="">Select a Sector</option>
                        {sectors?.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Category</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                        disabled={!formData.sectorId}
                        className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a Category</option>
                        {categories?.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Secondary Category (Subcategory)</label>
                      <select
                        value={formData.subCategoryId}
                        onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                        disabled={!formData.categoryId}
                        className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a Subcategory</option>
                        {subcategories?.map(sc => (
                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ─── Step 7: Operating Hours ─── */}
                {currentQuest.id === 'hours' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-500 text-center mb-2">
                      You can set detailed day-by-day hours later in your dashboard.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, isStandardHours: true, is247: false, isCustomHours: false })}
                        className="p-4 sm:p-5 rounded-xl border-2 text-left transition-colors outline-none flex flex-col items-center text-center justify-center"
                        style={{
                          borderColor: formData.isStandardHours && !formData.is247 && !formData.isCustomHours ? currentQuest.color : '#e5e7eb',
                          backgroundColor: formData.isStandardHours && !formData.is247 && !formData.isCustomHours ? currentQuest.colorLight : '#fff',
                        }}
                      >
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">Standard Hours</div>
                        <div className="text-xs text-gray-500">Mon-Fri, 9am - 5pm</div>
                      </motion.button>

                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, isStandardHours: false, is247: true, isCustomHours: false })}
                        className="p-4 sm:p-5 rounded-xl border-2 text-left transition-colors outline-none flex flex-col items-center text-center justify-center"
                        style={{
                          borderColor: formData.is247 ? currentQuest.color : '#e5e7eb',
                          backgroundColor: formData.is247 ? currentQuest.colorLight : '#fff',
                        }}
                      >
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">Open 24/7</div>
                        <div className="text-xs text-gray-500">Always open</div>
                      </motion.button>

                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, isStandardHours: false, is247: false, isCustomHours: true })}
                        className="p-4 sm:p-5 rounded-xl border-2 text-left transition-colors outline-none flex flex-col items-center text-center justify-center"
                        style={{
                          borderColor: formData.isCustomHours ? currentQuest.color : '#e5e7eb',
                          backgroundColor: formData.isCustomHours ? currentQuest.colorLight : '#fff',
                        }}
                      >
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">Custom Setup</div>
                        <div className="text-xs text-gray-500">Set day-by-day</div>
                      </motion.button>
                    </div>

                    {/* Custom Hours Panel */}
                    <AnimatePresence>
                      {formData.isCustomHours && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                            {formData.customHours.map((day, idx) => (
                              <div key={day.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      const newHours = formData.customHours.map((h, i) => 
                                        i === idx ? { ...h, isOpen: !h.isOpen } : h
                                      );
                                      setFormData({ ...formData, customHours: newHours });
                                    }}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${day.isOpen ? 'bg-orange-500' : 'bg-gray-300'}`}
                                  >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${day.isOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                                  </button>
                                  <span className={`font-semibold text-sm ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {day.name}
                                  </span>
                                </div>
                                
                                {day.isOpen ? (
                                  <div className="flex items-center gap-2 pl-14 sm:pl-0">
                                    <input
                                      type="time"
                                      value={day.openTime}
                                      onChange={(e) => {
                                        const newHours = formData.customHours.map((h, i) => 
                                          i === idx ? { ...h, openTime: e.target.value } : h
                                        );
                                        setFormData({ ...formData, customHours: newHours });
                                      }}
                                      className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                    <span className="text-gray-400 text-sm">to</span>
                                    <input
                                      type="time"
                                      value={day.closeTime}
                                      onChange={(e) => {
                                        const newHours = formData.customHours.map((h, i) => 
                                          i === idx ? { ...h, closeTime: e.target.value } : h
                                        );
                                        setFormData({ ...formData, customHours: newHours });
                                      }}
                                      className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                  </div>
                                ) : (
                                  <div className="pl-14 sm:pl-0 text-sm text-gray-400 italic">
                                    Closed
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ─── Service Step: Booking Preferences ─── */}
                {currentQuest.id === 'booking_prefs' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Booking Acceptance</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, bookingAcceptance: 'auto' })}
                          className="p-4 rounded-xl border-2 text-left transition-colors flex items-center gap-3"
                          style={{
                            borderColor: formData.bookingAcceptance === 'auto' ? currentQuest.color : '#e5e7eb',
                            backgroundColor: formData.bookingAcceptance === 'auto' ? currentQuest.colorLight : '#fff',
                          }}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.bookingAcceptance === 'auto' ? 'border-orange-500' : 'border-gray-300'}`}>
                            {formData.bookingAcceptance === 'auto' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">Auto-Accept</div>
                            <div className="text-[11px] text-gray-500">Confirm bookings instantly</div>
                          </div>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, bookingAcceptance: 'manual' })}
                          className="p-4 rounded-xl border-2 text-left transition-colors flex items-center gap-3"
                          style={{
                            borderColor: formData.bookingAcceptance === 'manual' ? currentQuest.color : '#e5e7eb',
                            backgroundColor: formData.bookingAcceptance === 'manual' ? currentQuest.colorLight : '#fff',
                          }}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.bookingAcceptance === 'manual' ? 'border-orange-500' : 'border-gray-300'}`}>
                            {formData.bookingAcceptance === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">Manual Review</div>
                            <div className="text-[11px] text-gray-500">You approve each request</div>
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum Notice Period</label>
                      <select
                        value={formData.minimumNotice}
                        onChange={(e) => setFormData({ ...formData, minimumNotice: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="none">No notice required</option>
                        <option value="1h">1 Hour</option>
                        <option value="2h">2 Hours</option>
                        <option value="12h">12 Hours</option>
                        <option value="24h">24 Hours</option>
                        <option value="48h">48 Hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cancellation Policy</label>
                      <textarea
                        value={formData.cancellationPolicy}
                        onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                        className="w-full h-20 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                        placeholder="e.g., Free cancellation up to 24 hours before the appointment."
                      />
                    </div>
                  </div>
                )}

                {/* ─── Service Step: Appointment Structure ─── */}
                {currentQuest.id === 'appointment_struct' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Buffer Time Between Appointments</label>
                      <p className="text-xs text-gray-500 mb-2">Time needed to clean up or travel to your next client.</p>
                      <select
                        value={formData.bufferTime}
                        onChange={(e) => setFormData({ ...formData, bufferTime: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="none">No buffer time</option>
                        <option value="5m">5 Minutes</option>
                        <option value="15m">15 Minutes</option>
                        <option value="30m">30 Minutes</option>
                        <option value="1h">1 Hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Daily Bookings (Optional)</label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maxDailyBookings}
                        onChange={(e) => setFormData({ ...formData, maxDailyBookings: e.target.value })}
                        placeholder="e.g., 5"
                        className="h-11 rounded-xl border-gray-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                )}

                {/* ─── Service Step: Service Zones ─── */}
                {currentQuest.id === 'service_zones' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Where do you provide services?</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'in_store', label: 'At my business location', desc: 'Customers come to you' },
                          { id: 'mobile', label: 'At customer location (Mobile)', desc: 'You travel to the customer' },
                          { id: 'virtual', label: 'Online / Virtual', desc: 'Services provided remotely via video/call' }
                        ].map((model) => (
                          <motion.button
                            key={model.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, serviceFulfillmentModel: model.id as any })}
                            className="p-4 rounded-xl border-2 text-left transition-colors flex items-center gap-3"
                            style={{
                              borderColor: formData.serviceFulfillmentModel === model.id ? currentQuest.color : '#e5e7eb',
                              backgroundColor: formData.serviceFulfillmentModel === model.id ? currentQuest.colorLight : '#fff',
                            }}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.serviceFulfillmentModel === model.id ? 'border-orange-500' : 'border-gray-300'}`}>
                              {formData.serviceFulfillmentModel === model.id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{model.label}</div>
                              <div className="text-[11px] text-gray-500">{model.desc}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {formData.serviceFulfillmentModel === 'mobile' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden pt-2"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Travel Radius (Miles)</label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.travelRadius}
                          onChange={(e) => setFormData({ ...formData, travelRadius: e.target.value })}
                          placeholder="e.g., 10"
                          className="h-11 rounded-xl border-gray-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0"
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ─── Step 8: Delivery & Pickup ─── */}
                {currentQuest.id === 'fulfillment' && (
                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'pickup', label: 'Click & Collect', desc: 'Customers pick up in-store' },
                      { id: 'local_delivery', label: 'Local Delivery', desc: 'You deliver to nearby areas' },
                      { id: 'uk_shipping', label: 'National Shipping', desc: 'You post items UK-wide' }
                    ].map(mode => {
                      const isSelected = formData.sellingModes?.includes(mode.id);
                      return (
                        <motion.button
                          key={mode.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            const newModes = isSelected 
                              ? formData.sellingModes.filter(m => m !== mode.id)
                              : [...formData.sellingModes, mode.id];
                            // Ensure at least one is selected, or let it be empty?
                            setFormData({ ...formData, sellingModes: newModes });
                          }}
                          className={`flex items-center p-4 rounded-xl border-2 transition-colors outline-none ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                            {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-gray-900 text-sm sm:text-base">{mode.label}</div>
                            <div className="text-xs text-gray-500">{mode.desc}</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Navigation ──────────────────────────────── */}
        <div className="fixed bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl z-55 sm:static sm:bg-transparent sm:border-none sm:shadow-none sm:p-0 sm:mt-8">
          <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
            <button
              onClick={isGoogleOnboarding ? handleGoogleBack : handleBack}
              aria-label="Go back"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all outline-none text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <motion.button
              whileHover={isSubmitting ? {} : { scale: 1.03 }}
              whileTap={isSubmitting ? {} : { scale: 0.97 }}
              onClick={isGoogleOnboarding 
                ? (googleStep === 'fail_safe_form' ? handleGoogleFailSafeSubmit : handleGoogleCompleteClaim) 
                : handleNext}
              disabled={isSubmitting || (isGoogleOnboarding && googleStep === 'branch_select')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base transition-all outline-none disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              style={{
                backgroundColor: isGoogleOnboarding ? '#ea580c' : currentQuest.color,
                boxShadow: isSubmitting ? 'none' : `0 8px 24px -4px ${isGoogleOnboarding ? '#ea580c' : currentQuest.color}44`,
              }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  {isGoogleOnboarding ? 'Claiming...' : 'Registering...'}
                </>
              ) : (
                <>
                  {isGoogleOnboarding 
                    ? (googleStep === 'review_claim' ? 'Claim Business' : 'Continue')
                    : (currentStep === activeQuests.length - 1 ? 'Complete Setup' : 'Continue')}
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
                className={`h-2.5 bg-gradient-to-r ${proximityResult.status === 'active'
                    ? 'from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/30'
                    : 'from-orange-600 via-red-500 to-red-600 shadow-red-500/30'
                  }`}
              />

              <div className="p-5 sm:p-8 flex-1 flex flex-col items-center text-center">
                {/* Pulsing Icon */}
                <div className="relative mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl ${proximityResult.status === 'active'
                        ? 'from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/30'
                        : 'from-orange-650 via-red-500 to-red-600 shadow-red-500/30'
                      }`}
                  >
                    {proximityResult.status === 'active' ? (
                      <Building2 className="w-8 h-8 animate-pulse" />
                    ) : (
                      <Globe className="w-8 h-8 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 tracking-tight">
                  {proximityResult.status === 'active' ? 'Active Local Mall Found!' : 'Area Not Fully Active Yet'}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm px-2 mb-4">
                  {proximityResult.message}
                </p>

                {/* Verified Badge Details */}
                <div className="w-full bg-gray-50 rounded-2xl p-4 sm:p-6 mb-4 text-left border border-gray-100">
                  <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-widest mb-3">
                    Your positioning details:
                  </h4>
                  <ul className="space-y-3.5">
                    {proximityResult.status === 'active' ? (
                      <>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Linked to {proximityResult.localMallName}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Active in the {proximityResult.resolvedArea} Borough network
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Early access waitlist registration enabled
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            Digital-only store placement allowed in {proximityResult.resolvedArea || 'your region'}
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
                  className={`w-full py-4 bg-gradient-to-r text-white text-base font-extrabold rounded-2xl hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-2 ${proximityResult.status === 'active'
                      ? 'from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/25'
                      : 'from-orange-600 via-red-500 to-red-650 shadow-red-500/25'
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

      {/* ─── Google Mock Account Picker Popup / Overlay ─── */}
      <AnimatePresence>
        {showGoogleMockPopup && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Dark glassmorphic overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowGoogleMockPopup(false)}
            />

            {/* Popup window simulating Chrome window */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              className="bg-[#f0f4f9] rounded-2xl w-full max-w-md shadow-2xl relative z-10 border border-gray-250/20 overflow-hidden flex flex-col font-sans"
              style={{ minHeight: '420px' }}
            >
              {/* Chrome Mock Header */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 tracking-wide">Sign in with Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleMockPopup(false)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Popup Content */}
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                {googleMockAccountStep === 'picker' ? (
                  <div className="space-y-6">
                    {/* Google Logo */}
                    <div className="flex justify-center">
                      <svg className="w-14 h-14" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.87z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z" />
                        <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 5 12c0-.79.13-1.57.38-2.32V6.53H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.37l4.06-3.13z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.39 0 3.18 2.12 1.21 5.37l4.06 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                      </svg>
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900">Choose an account</h3>
                      <p className="text-xs text-gray-500 mt-1">to continue to <span className="font-semibold text-orange-600">McomMall</span></p>
                    </div>

                    {/* Account options */}
                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {[
                        { email: 'merchant.jane@gmail.com', name: 'Jane Smith', initials: 'JS', bg: 'bg-orange-500' },
                        { email: 'shopowner.peckham@gmail.com', name: 'Mark Robinson', initials: 'MR', bg: 'bg-blue-500' },
                        { email: 'guest.merchant@gmail.com', name: 'Guest Merchant', initials: 'GM', bg: 'bg-emerald-500' }
                      ].map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => {
                            const names = acc.name.split(' ');
                            handleGoogleSelectAccount(acc.email, names[0], names[1] || '');
                          }}
                          className="w-full p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 text-left cursor-pointer"
                        >
                          <div className={`w-9 h-9 rounded-full ${acc.bg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                            {acc.initials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-none">{acc.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{acc.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      {/* App header in permissions */}
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-xs text-white shadow-sm">
                          M
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">McomMall wishes to access:</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">{googleEmail}</p>
                        </div>
                      </div>

                      {/* Permissions checkboxes */}
                      <div className="space-y-3.5 pt-2">
                        {[
                          'View and manage your Google Business Profile locations and branches',
                          'View your primary email address and basic profile info'
                        ].map((perm, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                            </div>
                            <span className="text-xs text-gray-600 leading-normal font-medium">{perm}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-gray-400 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                        By clicking "Allow", you agree to McomMall sharing your business listing info to publish your storefront. Read our Privacy Policy.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setGoogleMockAccountStep('picker')}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleGoogleGrantPermissions}
                        className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        Allow
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Internal Component: BuildingStorefrontPage (Immersive Loading)
// ============================================================================

const BUILDING_STEPS = [
  "Syncing Storefront",
  "Mapping Local Mall Placement",
  "Generating QR Links",
  "Configuring Rewards System",
  "Initializing Loyalty Engine",
  "Connecting to Borough",
  "Verifying High Street Connection",
  "Setting up Gamification"
];

function BuildingStorefrontPage({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(72);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p < 95) return p + 0.5;
        clearInterval(interval);
        return 100; // Finish the rest to 100
      });
    }, 100); 
    // 23 / 0.5 = 46 ticks. 46 * 100ms = 4.6 seconds.
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [progress, onComplete]);

  return (
    <div className="bg-orange-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .animate-shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
            background-size: 200% 100%;
            animation: progress-shimmer 2s infinite linear;
        }
        .progress-pulse {
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        .loading-ring {
            border: 3px solid rgba(234, 88, 12, 0.1);
            border-top: 3px solid #ea580c;
            border-radius: 50%;
            width: 80px;
            height: 80px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}} />

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-12 max-w-[640px] mx-auto w-full">
        {/* Central Animation State */}
        <div className="relative flex flex-col items-center mb-6">
          <div className="loading-ring mb-4"></div>
          {/* Decorative pulses */}
          <div className="absolute -top-4 w-24 h-24 rounded-full border border-orange-600/10 progress-pulse"></div>
          <div className="absolute -top-8 w-32 h-32 rounded-full border border-orange-600/5 progress-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Typography Cluster */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Building Your Storefront...
          </h1>
          <p className="text-base text-gray-500">
            We're importing your images, reviews, and details from Google.
          </p>
        </div>

        {/* Progress List */}
        <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex flex-col gap-4">
              {/* Item 1: Complete */}
              <div className="flex items-center gap-4 transition-all duration-500 opacity-100">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <CheckCircle2 className="w-[16px] h-[16px] text-orange-800" />
                </div>
                <span className="text-sm text-gray-900">Business name imported</span>
              </div>
              {/* Item 2: Complete */}
              <div className="flex items-center gap-4 transition-all duration-500 opacity-100">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <CheckCircle2 className="w-[16px] h-[16px] text-orange-800" />
                </div>
                <span className="text-sm text-gray-900">12 images synced</span>
              </div>
              {/* Item 3: Active */}
              <div className="flex items-center gap-4 relative">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping absolute"></div>
                  <div className="w-2 h-2 bg-orange-600 rounded-full relative"></div>
                </div>
                <span className="text-sm font-semibold text-orange-600">Contact details verified</span>
              </div>
              {/* Item 4: Pending */}
              <div className="flex items-center gap-4 opacity-40">
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-500">Opening hours set</span>
              </div>
            </div>
          </div>
          {/* Inline Modern Progress Bar */}
          <div className="bg-gray-100 h-1.5 w-full relative">
            <div className="absolute left-0 top-0 h-full bg-orange-600 transition-all duration-100 ease-linear overflow-hidden" style={{ width: `${progress}%` }}>
              <div className="w-full h-full animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Visual Context Card */}
        <div className="mt-6 w-full">
          <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200">
            <img 
              alt="Storefront building preview" 
              className="w-full h-full object-cover blur-[2px] opacity-40" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLvSYCNcXOMbmYlZsaqTqav0iat9-v22ogSKpghgsEOKK7Jx-pNvMp2VFGT-Y6CWKfiQEOEtmgS19oTTjqJA2zRq1wbX1YYFumJBpug2LhVU5rf98JhDU7v3Y88JWyfraRNF4YaSphkj4MIt2z2i8Jq7ZUd4K0dX9VEiOMYhfa-gOyoDSeVHDZs3uQZkuCV65cVyKPITadwvUNdigNgsY5Kyk5dIIt57LJ0zUHFfBxjAGHYfj9GyHW6iXg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-50/30 via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <CloudDownload className="w-[20px] h-[20px] text-orange-600" />
                <span className="text-xs font-medium text-gray-900">Syncing assets...</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Operational Message */}
      <div className="fixed bottom-8 w-full text-center px-4">
        <p className="text-xs text-gray-500 italic opacity-60">
          This usually takes less than 30 seconds...
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Internal Component: WelcomeChecklistPage (Final Destination)
// ============================================================================

function WelcomeChecklistPage({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Micro-interaction for celebration effect
    const container = document.getElementById('welcome-checklist-main');
    if (!container) return;
    const colors = ['#a23a00', '#8f4c30', '#005f9e'];
    
    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'absolute w-2 h-2 rounded-full opacity-0 pointer-events-none';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = (Math.random() * 40) + '%';
        
        container.appendChild(confetti);
        
        confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${Math.random() * 200 + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1000,
            delay: Math.random() * 500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            iterations: 1
        });
    }
  }, []);

  useEffect(() => {
    // Ensure we set mock cookies so the dashboard auth redirects don't kick them out
    if (!Cookies.get('access')) {
      Cookies.set('access', 'mock_access_token', { expires: 1 / 72 }); // 20 minutes
      Cookies.set('refresh', 'mock_refresh_token', { expires: 7 });
      Cookies.set('userId', 'mock_user_id', { expires: 7 });
      Cookies.set('userRole', 'owner', { expires: 7 });
      localStorage.setItem('user-name', 'Merchant Onboarding');
      
      // Also load auth into Redux store immediately
      dispatch(loadAuthFromCookies());
    }
  }, [dispatch]);

  return (
    <div className="bg-[#fff8f6] text-[#261812] font-sans min-h-screen relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .celebration-sparkle {
            position: absolute;
            pointer-events: none;
            animation: sparkle-float 3s ease-in-out infinite;
        }
        @keyframes sparkle-float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
            50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        .gradient-mesh {
            background-color: #fff8f6;
            background-image: 
                radial-gradient(at 0% 0%, rgba(255, 169, 135, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(162, 58, 0, 0.05) 0px, transparent 50%);
        }
      `}} />
      <div className="absolute inset-0 gradient-mesh -z-10"></div>
      
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f6]/80 backdrop-blur-md border-b border-[#e2bfb0] h-16 flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-orange-600" style={{fontVariationSettings: "'FILL' 1"}} />
          <span className="font-bold text-lg text-orange-600 tracking-tight">MCOMMALL</span>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-sm font-medium text-gray-500 hover:bg-orange-50 transition-colors px-3 py-2 rounded-lg"
        >
          Save & Exit
        </button>
      </header>

      <main id="welcome-checklist-main" className="pt-24 pb-32 px-4 md:max-w-xl md:mx-auto relative">
        {/* Celebration Hero */}
        <section className="relative text-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative inline-block mb-4"
          >
            <div className="w-24 h-24 bg-[#ff6900] rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
              <Trophy className="w-12 h-12 text-white" style={{fontVariationSettings: "'FILL' 1"}} />
            </div>
            {/* Animated Sparkles */}
            <Sparkles className="w-6 h-6 text-[#97481e] absolute -top-2 -right-2 celebration-sparkle" />
            <Sparkles className="w-8 h-8 text-[#00629f] absolute bottom-0 -left-4 celebration-sparkle" style={{animationDelay: '1s'}} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            Your Business Is Now Live On MCOMMALL
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-[#5a4136] text-sm px-4"
          >
            Congratulations! Your shop is now visible to the local community. It's time to build your operational velocity.
          </motion.p>
        </section>

        {/* Primary Action Cluster */}
        <section className="space-y-2 mb-8">
          <button onClick={onComplete} className="w-full bg-[#a14000] hover:bg-[#8f3800] text-white h-14 rounded-xl font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            GO TO DASHBOARD
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => router.push('/dashboard/store')}
              className="bg-white border border-[#e2bfb0] text-[#261812] h-12 rounded-xl font-bold text-xs hover:bg-[#fff1ec] transition-colors flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              VIEW STOREFRONT
            </button>
            <button 
              onClick={() => {
                navigator.clipboard?.writeText(window.location.origin + '/store');
                alert('Store link copied to clipboard!');
              }}
              className="bg-white border border-[#e2bfb0] text-[#261812] h-12 rounded-xl font-bold text-xs hover:bg-[#fff1ec] transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              SHARE
            </button>
          </div>
        </section>

        {/* Welcome Checklist Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-lg text-[#261812]">Welcome Checklist</h2>
            <span className="text-[#a14000] text-xs font-bold">0/6 COMPLETE</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Item: Products */}
            <div 
              onClick={() => router.push('/dashboard/store/products/add-product')}
              className="bg-white p-4 rounded-xl border border-[#e2bfb0] shadow-sm flex flex-col gap-2 group hover:border-[#a14000] transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#fff1ec] rounded-lg flex items-center justify-center text-[#a14000]">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-[#261812]">Add first product</h3>
                  <p className="text-[#5a4136] text-sm leading-tight">Populate your inventory for customers to browse and buy.</p>
                </div>
              </div>
              <button className="w-full bg-[#ff9969] text-[#773005] h-10 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all uppercase">
                ADD PRODUCT
              </button>
            </div>

            {/* Item: Services */}
            <div 
              onClick={() => router.push('/dashboard/services/add-service?fromOnboarding=true')}
              className="bg-white p-4 rounded-xl border border-[#e2bfb0] shadow-sm flex flex-col gap-2 group hover:border-[#a14000] transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#fff1ec] rounded-lg flex items-center justify-center text-[#a14000]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-[#261812]">Add first service</h3>
                  <p className="text-[#5a4136] text-sm leading-tight">Set up booking slots and service descriptions.</p>
                </div>
              </div>
              <button className="w-full bg-[#ff9969] text-[#773005] h-10 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all uppercase">
                ADD SERVICE
              </button>
            </div>

            {/* Item: Promotions */}
            <div 
              onClick={() => router.push('/dashboard/loyalty/promotion/new')}
              className="bg-white p-4 rounded-xl border border-[#e2bfb0] shadow-sm flex flex-col gap-2 group hover:border-[#a14000] transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#fff1ec] rounded-lg flex items-center justify-center text-[#a14000]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-[#261812]">Create first promotion</h3>
                  <p className="text-[#5a4136] text-sm leading-tight">Launch a 'Grand Opening' discount to drive traffic.</p>
                </div>
              </div>
              <button className="w-full bg-[#ff9969] text-[#773005] h-10 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all uppercase">
                CREATE PROMOTION
              </button>
            </div>

            {/* Secondary items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              <div 
                onClick={() => router.push('/dashboard/loyalty')}
                className="bg-[#ffffff] border border-[#e2bfb0] p-4 rounded-xl flex flex-col items-center text-center gap-2 hover:border-[#a14000] cursor-pointer transition-colors"
              >
                <Award className="w-6 h-6 text-[#a14000]" />
                <p className="text-xs text-[#261812] font-bold">Enable rewards</p>
                <span className="text-[#a14000] text-xs font-bold">ACTIVATE</span>
              </div>
              <div 
                onClick={() => router.push('/dashboard')}
                className="bg-[#ffffff] border border-[#e2bfb0] p-4 rounded-xl flex flex-col items-center text-center gap-2 hover:border-[#a14000] cursor-pointer transition-colors"
              >
                <Gamepad2 className="w-6 h-6 text-[#a14000]" />
                <p className="text-xs text-[#261812] font-bold">Launch gamification</p>
                <span className="text-[#a14000] text-xs font-bold">SET UP</span>
              </div>
              <div 
                onClick={() => router.push('/dashboard')}
                className="bg-[#ffffff] border border-[#e2bfb0] p-4 rounded-xl flex flex-col items-center text-center gap-2 hover:border-[#a14000] cursor-pointer transition-colors"
              >
                <UserPlus className="w-6 h-6 text-[#a14000]" />
                <p className="text-xs text-[#261812] font-bold">Invite customers</p>
                <span className="text-[#a14000] text-xs font-bold">SEND INVITE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Identity */}
        <section className="mt-6 text-center pt-6 border-t border-[#e2bfb0] opacity-70">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img alt="Borough Identity" className="w-6 h-6 grayscale" src="https://lh3.googleusercontent.com/aida/AP1WRLsNGCalx_YeTu9oiZzALHRnAFyepU1IU7P6wwgysxcuWdMw09RqJK4ebfc9-HE7dZVjdKrcHV2o3lwb7wlEo2pux3RC-rfLqOZwO79YBd_VrVKoDscrxVHACUmFjkw-WCKz1-1PlnW6WYfCN7YwCQbjToGYLBi2tOfOOMbwc2kCKr8zZSJtaLcjYMvELVfVa-Ux6b1uK_Wh24IliD95yi-9wlHzeM-gPpRZ_zvtGw1yqKTDgXlWfWYrcNE" />
            <span className="font-bold text-[10px] text-[#5a4136] tracking-widest uppercase">Official High Street Merchant</span>
          </div>
          <p className="text-[10px] text-[#5a4136]">Powered by MCOMMALL Urban Connectivity Platform</p>
        </section>
      </main>
    </div>
  );
}
