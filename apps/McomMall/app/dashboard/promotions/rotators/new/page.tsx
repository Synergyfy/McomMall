'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ShoppingBag, 
  Star, 
  Tag, 
  MapPin, 
  Calendar,
  Sparkles,
  Sliders,
  Tv,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/service/api';

type RotatorType = 'product' | 'promotion' | 'event' | 'borough' | 'featured';

interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  type: string;
}

export default function NewRotatorWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Type Selection
  const [rotatorType, setRotatorType] = useState<RotatorType>('product');

  // Step 2: Content Selection
  const [candidateItems, setCandidateItems] = useState<ContentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);

  // Step 3: Display Settings
  const [title, setTitle] = useState('');
  const [rotationSpeed, setRotationSpeed] = useState(5); // in seconds
  const [priority, setPriority] = useState('medium'); // low | medium | high
  const [visibility, setVisibility] = useState('public'); // public | private | restricted
  const [boroughTarget, setBoroughTarget] = useState('Southwark');
  const [storefrontTarget, setStorefrontTarget] = useState('Peckham High Street');

  // Preview state (Step 4 Carousel index)
  const [previewIndex, setPreviewIndex] = useState(0);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Reset scroll on step transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Load candidates dynamically based on selected rotator type
  useEffect(() => {
    if (step !== 2) return;

    const loadContent = async () => {
      setIsContentLoading(true);
      setCandidateItems([]);
      setSelectedIds([]);

      try {
        if (rotatorType === 'product' || rotatorType === 'featured') {
          const res = await api.get('/product/mine');
          const list = res.data || [];
          setCandidateItems(list.map((item: any) => ({
            id: item.id,
            title: item.name,
            subtitle: `£${item.price}`,
            image: item.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4MNMm7x0-TBN7JmHBdrdezDEiPTsyKNoi4liYAn9qCz42D554k63-a4w13kXoBpzCt7mter6-d3AjbEJA776I8jikEBgWzNRakdryPSQaOq3KlidgbCj9fP903Q1v1WcBRHJdjK3E4-8ZGhyHpcvdlMdzr1V3PQDiVkocOUAlDPmnWmCkkhmoqs5MqvDrt7iT--oNk2N7V91g3XLl7K2JT3IVgR0P7AfryaEV0f9nJ1ItbsMHEAvIRSQhSgUw8fMSUO8JuPeDEqc',
            type: 'product'
          })));
        } else if (rotatorType === 'promotion') {
          const res = await api.get('/promotions/my-participations');
          const list = res.data || [];
          setCandidateItems(list.map((item: any) => ({
            id: item.id,
            title: item.name,
            subtitle: item.promotionType || 'Active Promotion',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgdP73-Zkls1p0Xl2Av26-cD-inwEekjcFSWy4uvkZl71AnWsdoMS7H12TyQ_fndyjTA80wzjlsDCkY_SvechOwMdXzWJSJ7-jGvv5h4i7Ytcy5kihtvPbJ0Ay8vFX0c3X1-P-AivUX6JUqwNj9mSCXuJJwhIobtIYoT-Rd9Ux_R2-nz0rAbHSwzAjLrIuLKW2htMCqoy_pz4UiM-Cj0BijsbE7DxsbyhWkNDN-jJLy9Em5o9Wmvg0UAS03_VTpQpDsQi-yioXw4A',
            type: 'promotion'
          })));
        } else if (rotatorType === 'event') {
          const res = await api.get('/events/my-events');
          const list = res.data || [];
          setCandidateItems(list.map((item: any) => ({
            id: item.id,
            title: item.title,
            subtitle: `${item.date} • ${item.time}`,
            image: item.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8GDhDR_b3s6TweTs8QAkcULmJVj1z_7y1n_7WImqA3b-BNWNGWRq6c93cLhiJq3C4XrvIOEPO_BtDMWLCJQNxRY5qZvVdCwZqcVi7wV1onojwy6QUrKOP3Xdsc1Ioe5g1iZfgYVokbiFkr0nOPzSkMzFYa6hMz7nQQAahtCQnNsLe8qJeAaLA-UJcwaUV_cBqkh6nuLOniLVAA_TJHS68mQyGh4NHx8LBNVTbnTBOB3T8F4TdWAonc5EGEz5zm9kCDBc5DZ4itOM',
            type: 'event'
          })));
        } else if (rotatorType === 'borough') {
          // Combined list for Borough Rotators
          const [prodRes, evtRes] = await Promise.allSettled([
            api.get('/product/mine'),
            api.get('/events/my-events')
          ]);
          
          let list: ContentItem[] = [];
          if (prodRes.status === 'fulfilled') {
            list = [...list, ...(prodRes.value.data || []).map((item: any) => ({
              id: item.id,
              title: item.name,
              subtitle: `Product • £${item.price}`,
              image: item.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4MNMm7x0-TBN7JmHBdrdezDEiPTsyKNoi4liYAn9qCz42D554k63-a4w13kXoBpzCt7mter6-d3AjbEJA776I8jikEBgWzNRakdryPSQaOq3KlidgbCj9fP903Q1v1WcBRHJdjK3E4-8ZGhyHpcvdlMdzr1V3PQDiVkocOUAlDPmnWmCkkhmoqs5MqvDrt7iT--oNk2N7V91g3XLl7K2JT3IVgR0P7AfryaEV0f9nJ1ItbsMHEAvIRSQhSgUw8fMSUO8JuPeDEqc',
              type: 'product'
            }))];
          }
          if (evtRes.status === 'fulfilled') {
            list = [...list, ...(evtRes.value.data || []).map((item: any) => ({
              id: item.id,
              title: item.title,
              subtitle: `Event • ${item.date}`,
              image: item.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8GDhDR_b3s6TweTs8QAkcULmJVj1z_7y1n_7WImqA3b-BNWNGWRq6c93cLhiJq3C4XrvIOEPO_BtDMWLCJQNxRY5qZvVdCwZqcVi7wV1onojwy6QUrKOP3Xdsc1Ioe5g1iZfgYVokbiFkr0nOPzSkMzFYa6hMz7nQQAahtCQnNsLe8qJeAaLA-UJcwaUV_cBqkh6nuLOniLVAA_TJHS68mQyGh4NHx8LBNVTbnTBOB3T8F4TdWAonc5EGEz5zm9kCDBc5DZ4itOM',
              type: 'event'
            }))];
          }
          setCandidateItems(list);
        }
      } catch (err) {
        console.error('Error loading rotator content:', err);
        toast.error('Failed to load candidate content items.');
      } finally {
        setIsContentLoading(false);
      }
    };

    loadContent();
  }, [rotatorType, step]);

  // Selected content preview objects
  const selectedPreviewItems = useMemo(() => {
    return candidateItems.filter(item => selectedIds.includes(item.id));
  }, [candidateItems, selectedIds]);

  // Autoplay preview simulation in Step 4
  useEffect(() => {
    if (step !== 4 || selectedPreviewItems.length <= 1) return;

    const timer = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % selectedPreviewItems.length);
    }, rotationSpeed * 1000);

    return () => clearInterval(timer);
  }, [step, selectedPreviewItems, rotationSpeed]);

  // Handle select toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Submit Handler
  const handleLaunchRotator = async () => {
    if (!title) {
      toast.error('Please enter a rotator campaign title.');
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        rotatorType,
        rotationSpeed,
        priority,
        visibility,
        boroughTarget,
        storefrontTarget,
        contentIds: selectedIds,
        status: 'active'
      };

      await api.post('/rotators', payload);
      setIsSuccessOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to launch rotator campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* --- Progress Header & Wizard Tracker --- */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a14000]">
            <span>Step {step} of 5</span>
            <span>·</span>
            <span className="text-gray-500">
              {step === 1 && 'Select Rotator Type'}
              {step === 2 && 'Choose Campaign Content'}
              {step === 3 && 'Display Parameters'}
              {step === 4 && 'Interactive Live Preview'}
              {step === 5 && 'Activate Campaign'}
            </span>
          </div>
          <button
            onClick={() => router.push('/dashboard/promotions/rotators')}
            className="text-base font-bold text-gray-400 hover:text-[#a14000] transition-colors p-1 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center"
            title="Cancel Wizard"
          >
            ✕
          </button>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#ff6900] transition-all duration-500 ease-out"
            style={{ width: `${step * 20}%` }}
          />
        </div>
      </div>

      {/* --- Step Contents --- */}
      <AnimatePresence mode="wait">
        
        {/* Step 1: Select Rotator Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200/60 text-[#a14000] text-[10px] font-black mb-4 uppercase tracking-widest">
                Campaign Creator
              </span>
              <h2 className="text-3xl font-extrabold text-[#0b1c30] leading-tight">
                Select Rotator Type
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mt-2">
                Choose where and how your content will appear across the platform. Each rotator is optimized for specific business goals and audience segments.
              </p>
            </div>

            {/* Bento Grid Selection */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
              
              {/* Product Rotator */}
              <div 
                onClick={() => {
                  setRotatorType('product');
                  setTitle('My Catalog Product Rotator');
                  setStep(2);
                }}
                className={`md:col-span-8 group relative overflow-hidden rounded-3xl bg-white border cursor-pointer flex flex-col md:flex-row transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  rotatorType === 'product' ? 'border-[#ff6900] ring-1 ring-[#ff6900]/20' : 'border-slate-200'
                }`}
              >
                <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff6900] mb-5">
                      <ShoppingBag size={22} />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800">Product Rotator</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2">
                      Display your best-selling items directly on high-traffic category pages. Perfect for boosting direct sales and clearing seasonal inventory.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 font-bold text-xs">
                    <span>Select this type</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="hidden md:block w-1/3 relative min-h-[260px] bg-slate-100 shrink-0">
                  <img 
                    alt="Product Showcase" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4MNMm7x0-TBN7JmHBdrdezDEiPTsyKNoi4liYAn9qCz42D554k63-a4w13kXoBpzCt7mter6-d3AjbEJA776I8jikEBgWzNRakdryPSQaOq3KlidgbCj9fP903Q1v1WcBRHJdjK3E4-8ZGhyHpcvdlMdzr1V3PQDiVkocOUAlDPmnWmCkkhmoqs5MqvDrt7iT--oNk2N7V91g3XLl7K2JT3IVgR0P7AfryaEV0f9nJ1ItbsMHEAvIRSQhSgUw8fMSUO8JuPeDEqc" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
                </div>
              </div>

              {/* Featured Rotator */}
              <div 
                onClick={() => {
                  setRotatorType('featured');
                  setTitle('Homepage Featured Rotator');
                  setStep(2);
                }}
                className={`md:col-span-4 rounded-3xl bg-slate-900 text-white p-8 flex flex-col justify-between cursor-pointer border hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group ${
                  rotatorType === 'featured' ? 'border-[#ff6900] ring-1 ring-[#ff6900]/20' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-5">
                    <Star size={22} className="fill-white" />
                  </div>
                  <h3 className="text-xl font-extrabold">Featured Rotator</h3>
                  <p className="text-xs text-white/70 leading-relaxed mt-2">
                    Premium home-page placement with maximum visibility to all users entering the ecosystem.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6 border-t border-white/10 pt-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-white/15 rounded-lg">Premium Spot</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-orange-500" />
                </div>
              </div>

              {/* Promotion Rotator */}
              <div 
                onClick={() => {
                  setRotatorType('promotion');
                  setTitle('Merchant Deals Rotator');
                  setStep(2);
                }}
                className={`md:col-span-4 rounded-3xl bg-white border p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  rotatorType === 'promotion' ? 'border-[#ff6900] ring-1 ring-[#ff6900]/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
                    <Tag size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Promotion Rotator</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                    Highlight flash sales, discount codes, or limited-time offers to price-sensitive shoppers.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-orange-600 mt-4 flex items-center gap-0.5">Select type <ChevronRight size={12} /></span>
              </div>

              {/* Borough Rotator */}
              <div 
                onClick={() => {
                  setRotatorType('borough');
                  setTitle('Borough Wide Engagement Rotator');
                  setStep(2);
                }}
                className={`md:col-span-4 rounded-3xl bg-orange-50/20 border p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  rotatorType === 'borough' ? 'border-[#ff6900] ring-1 ring-[#ff6900]/20' : 'border-slate-200'
                }`}
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center mb-5">
                    <MapPin size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Borough Rotator</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                    Geo-targeted placement specifically for users browsing in your store's physical neighborhood.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-orange-600 mt-4 flex items-center gap-0.5 relative z-10">Select type <ChevronRight size={12} /></span>
                <div className="absolute -bottom-8 -right-8 opacity-5 text-orange-950 pointer-events-none">
                  <MapPin size={100} />
                </div>
              </div>

              {/* Event Rotator */}
              <div 
                onClick={() => {
                  setRotatorType('event');
                  setTitle('Live Workshop & Event Rotator');
                  setStep(2);
                }}
                className={`md:col-span-4 rounded-3xl bg-white border p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  rotatorType === 'event' ? 'border-[#ff6900] ring-1 ring-[#ff6900]/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-5">
                    <Calendar size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Event Rotator</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                    Promote in-store workshops, grand openings, or community events to local residents.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-orange-600 mt-4 flex items-center gap-0.5">Select type <ChevronRight size={12} /></span>
              </div>

            </div>
          </motion.div>
        )}

        {/* Step 2: Choose Content */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs font-bold text-[#a14000] uppercase tracking-widest mb-1 block">Step 2 of 5</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">Choose Rotator Content</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mt-1">
                Select items from your {rotatorType} collection to display inside the rotating stream. Select multiple items to activate transitions.
              </p>
            </div>

            {isContentLoading ? (
              <div className="py-20 text-center text-gray-400 font-bold">Querying asset list...</div>
            ) : candidateItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                {candidateItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(item.id)}
                      className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all flex items-center gap-3 relative hover:shadow-md ${
                        isSelected ? 'border-[#ff6900] ring-1 ring-[#ff6900]/25' : 'border-slate-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">{item.subtitle}</p>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-200 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center max-w-md mx-auto space-y-3">
                <Sliders className="w-12 h-12 text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No matching assets found</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  You don't have any items registered under the "{rotatorType}" category yet. Setup products or events first.
                </p>
                <button
                  onClick={() => router.push(rotatorType === 'event' ? '/dashboard/events/new' : '/dashboard/store/products/add-product')}
                  className="px-4 py-2 bg-[#a14000] text-white text-[10px] font-bold rounded-xl shadow-md"
                >
                  Create Asset Now
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-6 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-[#a14000] font-bold text-xs transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                disabled={selectedIds.length === 0}
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-5 py-3 bg-[#a14000] hover:bg-[#a14000]/95 text-white font-bold text-xs rounded-xl disabled:opacity-50 disabled:pointer-events-none shadow-md"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Display Settings */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div>
              <span className="text-xs font-bold text-[#a14000] uppercase tracking-widest mb-1 block">Step 3 of 5</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">Display Settings</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Configure rotator interval pacing, search priority levels, and geography-fence constraints.
              </p>
            </div>

            <form className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Rotator Campaign Title */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rotator Campaign Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Spring Seasonal Featured Product Rotator"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                />
              </div>

              {/* Rotation speed interval (Autoplay) */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rotation Interval Speed</label>
                  <span className="text-xs font-bold text-orange-600">{rotationSpeed} seconds</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <p className="text-[10px] text-gray-400 font-medium">Interval represents the duration each slide displays before transitioning.</p>
              </div>

              {/* Priority & Visibility dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900] bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Visibility Type</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900] bg-white"
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="private">Private (Direct link only)</option>
                    <option value="restricted">Restricted (Signed-in neighbors only)</option>
                  </select>
                </div>
              </div>

              {/* Borough and Storefront targeting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Borough Target *</label>
                  <select
                    value={boroughTarget}
                    onChange={(e) => setBoroughTarget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900] bg-white"
                  >
                    <option value="Southwark">Southwark</option>
                    <option value="Lambeth">Lambeth</option>
                    <option value="Camden">Camden</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Storefront High Street Target *</label>
                  <input
                    type="text"
                    value={storefrontTarget}
                    onChange={(e) => setStorefrontTarget(e.target.value)}
                    placeholder="e.g. Peckham High Street"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                  />
                </div>
              </div>
            </form>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-6 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-[#a14000] font-bold text-xs transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 px-5 py-3 bg-[#a14000] hover:bg-[#a14000]/95 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Continue to Preview
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div>
              <span className="text-xs font-bold text-[#a14000] uppercase tracking-widest mb-1 block">Step 4 of 5</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">Live Rotator Preview</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                See exactly how your selected items cycle inside the sliding window. Simulated rotation speed is set to {rotationSpeed}s.
              </p>
            </div>

            {/* Carousel Mockup Container */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
              <div className="absolute top-4 left-6 flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                <Tv size={12} className="text-orange-500 animate-pulse" />
                Live Storefront Simulator
              </div>

              {selectedPreviewItems.length > 0 ? (
                <div className="w-full max-w-sm flex flex-col items-center space-y-4 pt-6">
                  {/* Sliding slide item */}
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative shadow-md bg-slate-50 group border border-slate-100">
                    <img 
                      className="w-full h-full object-cover" 
                      src={selectedPreviewItems[previewIndex]?.image} 
                      alt={selectedPreviewItems[previewIndex]?.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <span className="bg-[#ff6900] px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                        {rotatorType} Campaign
                      </span>
                      <h4 className="text-base font-extrabold mt-1.5 truncate">
                        {selectedPreviewItems[previewIndex]?.title}
                      </h4>
                      <p className="text-[11px] text-white/80 font-semibold mt-0.5">
                        {selectedPreviewItems[previewIndex]?.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bullet Navigation Indicators */}
                  <div className="flex gap-2">
                    {selectedPreviewItems.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setPreviewIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === previewIndex ? 'bg-orange-600 w-5' : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Metainfo Badge */}
                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-2 text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                    <Clock size={12} className="text-orange-500" />
                    Autoplay: Next item in {rotationSpeed}s.
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 font-bold">No content items configured. Go back to choose content.</div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-6 mt-8">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-[#a14000] font-bold text-xs transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                onClick={handleLaunchRotator}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-3 bg-[#a14000] hover:bg-[#a14000]/95 text-white font-extrabold text-xs rounded-xl shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Launching...' : 'Activate Campaign'}
                <Check size={14} className="stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- Fullscreen Success Dialog --- */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-orange-600 shadow-md border border-orange-100">
              <CheckCircle2 size={40} className="stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
                Rotator Live!
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                "{title}" is now active in the {boroughTarget} high-street feed, cycling {selectedIds.length} items.
              </p>
            </div>

            <button
              onClick={() => {
                setIsSuccessOpen(false);
                router.push('/dashboard/promotions/rotators');
              }}
              className="w-full py-3.5 bg-[#a14000] hover:bg-[#a14000]/95 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Go to Rotators Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
