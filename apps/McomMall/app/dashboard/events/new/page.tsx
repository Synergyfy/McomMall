'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Rocket,
  Video,
  Utensils,
  Flower2,
  Tent,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users2,
  Lock,
  Gift,
  Coins,
  Ticket,
  Check,
  Megaphone,
  Bell,
  QrCode,
  Store,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/service/api';
import { getVoucherProducts } from '@/service/vouchers';

// --- Types ---
type EventType =
  | 'in-store'
  | 'workshop'
  | 'product-launch'
  | 'webinar'
  | 'demonstration'
  | 'food-competition'
  | 'beauty-session'
  | 'community-event'
  | 'expo-booth'
  | 'live-stream'
  | 'training';

interface TemplateItem {
  id: string;
  title: string;
  description: string;
  image: string;
  trending?: boolean;
}

// --- Data Lists ---
const EVENT_TYPES = [
  {
    id: 'in-store' as EventType,
    title: 'In-Store Event',
    description: 'Drive foot traffic and create personal connections with a local community gathering.',
    span: 'col-span-12 md:col-span-8 h-80',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIQpOXpsFS4T4TSO4__3RLpTKedKwoGR75wY-Uffy9B-9QnxLicA-fBaQIVk45cWTNgLedSiTpSbCv2SRxpwMHh8KzCLBVd0umivITebvlVqQI9GIxDVZf4Lj4fEF9hmiDjjJmr1rnul5Vfj_oTqvMIIVxZDm9nCfbtGgSKIF7pD691SYaClwBuh9Oi_jChgAedkX-LPtiLFdTyjp7kaZVTeUSB4_ZD7NyNVCiiSA4bVUSJ3nC8CXWaqEz4g3uwfGe7vV94RTL2s4',
    badge: 'MOST POPULAR',
  },
  {
    id: 'workshop' as EventType,
    title: 'Workshop',
    description: 'Host a hands-on learning experience for your customers.',
    span: 'col-span-12 md:col-span-4 h-80',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQZ8QXdJUxunK11iQBVmeTyIqv_G8RTEl4C5j0hcXf75giYylfXgJPXlxnPGqweqqw3y1cXZK1q0xwHG8gJraBXVnYHVrcPGR6Pw6J7D7r4l_n86ewiwhiGBKk24YkOzxG_ysIxcNdCUDZyujvR2XGqXUcR0SE6yPyotxbbQYV-qu5jb60h2CMWnPZGSRBwLVF-JpCHstoW8qbCPwYuc5wa7poEbZ0ZBbOfDUJ4QIpgY24ijU1gABMImmYNmwREaAte9d0gCCX0RI',
  },
  {
    id: 'product-launch' as EventType,
    title: 'Product Launch',
    description: 'Reveal your latest innovations with a high-energy debut.',
    span: 'col-span-12 md:col-span-4 h-64',
    bg: 'bg-[#a14000] text-white',
    icon: Rocket,
  },
  {
    id: 'webinar' as EventType,
    title: 'Webinar',
    description: 'Reach a global audience with a professional live presentation.',
    span: 'col-span-12 md:col-span-4 h-64',
    bg: 'bg-[#d3e4fe] border border-slate-200/60 text-[#0b1c30]',
    icon: Video,
  },
  {
    id: 'demonstration' as EventType,
    title: 'Demonstration',
    description: 'Showcase exactly how your products work in real-time.',
    span: 'col-span-12 md:col-span-4 h-64',
    bg: 'bg-white border border-slate-200/60 text-[#0b1c30]',
    icon: Eye,
    bgIcon: Sparkles,
  },
  {
    id: 'food-competition' as EventType,
    title: 'Food Competition',
    description: 'Bring the heat with tastings and culinary battles.',
    span: 'col-span-12 md:col-span-6 h-72',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4oRRl6ZZLBzEwFWFUtNAK39ZuxSW3YwJ8nP06PV2qrRRIGIFzdPaV6DvKUIlYeFIxB6jD50Fs-KnM00uYMjlz4yI5CeY_VfI7_DkvQpZ-lhjVMXjVdvDd8MwasQFP2qenlo_glJdq-N26hBrk1PVtqUfp65AsxqlxLQyh3cQsLX9reL1GpAX6b9_aVL2uQsAwM7hdAHJOfsEdPq8C_0PwbBnIbOmdQYOVr3GKs2SMYKCvKEh1Jq8G592RK74BUEHLO1CHgfLqSgc',
    icon: Utensils,
  },
  {
    id: 'beauty-session' as EventType,
    title: 'Beauty Session',
    description: 'Personalized makeovers and skincare consultations.',
    span: 'col-span-12 md:col-span-6 h-72',
    bg: 'bg-[#9f978e] text-white',
    icon: Flower2,
  },
  {
    id: 'community-event' as EventType,
    title: 'Community Event',
    description: 'Fostering connections beyond commerce.',
    span: 'col-span-12 md:col-span-4 h-64',
    bg: 'bg-[#e5eeff] border border-slate-200/60 text-[#0b1c30]',
    icon: Users2,
  },
  {
    id: 'expo-booth' as EventType,
    title: 'Expo Booth Event',
    description: 'Maximize your impact at trade shows and local fairs.',
    span: 'col-span-12 md:col-span-4 h-64',
    bg: 'bg-[#e2dfde] border border-[#8e7164] text-[#1c1b1b]',
    icon: Tent,
    badge: 'NEW',
  },
  {
    id: 'live-stream' as EventType,
    title: 'Live Stream Event',
    description: 'Interactive real-time shopping and Q&A sessions.',
    span: 'col-span-12 md:col-span-4 h-64',
    bg: 'bg-[#213145] text-white',
    badge: 'LIVE NOW TOOLS',
  },
  {
    id: 'training' as EventType,
    title: 'Training Session',
    description: 'Educate your partners or staff on new protocols and products.',
    span: 'col-span-12 h-32',
    bg: 'bg-white border-2 border-dashed border-[#e2bfb0] hover:border-[#a14000] text-[#0b1c30] hover:bg-orange-50/10',
    icon: GraduationCap,
  }
];

const TEMPLATES: TemplateItem[] = [
  {
    id: 'weekend-tasting',
    title: 'Weekend Tasting',
    description: 'Perfect for gourmet shops and wineries. Features high-engagement RSVP flows and social sharing cards.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr1RQYZDVW_8zoVFGH1ZjResNPRTJ1Y7Uy-ZkSc1JDGXc78SYxo965OsTDhfOfWWEOPx2pndmHcaCdQvYgp6rabyof8bTO92qXr7b75w74gy_tKQMdDJ056UJfxLUtCBkYlePhdXJwYhJPVl17MYhC-AglPDBJ5J3UzONkDVae34q2AY7wOb98nn5HtE6dhuuxT-LG4hlV-wOACVJ9llHdf8839_76J9YT1LLhftHbRR7jdY3VwHlXLCJwIuFuRvAQWlckXwBeBfU',
    trending: true,
  },
  {
    id: 'pizza-competition',
    title: 'Pizza Competition',
    description: 'A culinary showdown for local pizzaiolos. Features live polling, public tasting votes, and reward claims.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4oRRl6ZZLBzEwFWFUtNAK39ZuxSW3YwJ8nP06PV2qrRRIGIFzdPaV6DvKUIlYeFIxB6jD50Fs-KnM00uYMjlz4yI5CeY_VfI7_DkvQpZ-lhjVMXjVdvDd8MwasQFP2qenlo_glJdq-N26hBrk1PVtqUfp65AsxqlxLQyh3cQsLX9reL1GpAX6b9_aVL2uQsAwM7hdAHJOfsEdPq8C_0PwbBnIbOmdQYOVr3GKs2SMYKCvKEh1Jq8G592RK74BUEHLO1CHgfLqSgc',
    trending: true,
  },
  {
    id: 'hair-workshop',
    title: 'Hair Workshop',
    description: 'Designed for salons and educators. Includes built-in ticket tiers and equipment checklist integration.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOcBLFXaspAv_spPl4CiJxNoe0X1vLa0nhtG4pNeOpZq8omQ_NNzmsb8TZrCe1h5Tb6xmzrJE7hO2oZycZQ1o_yPVwJD6AGZCGdiBKoEAfyOEvZrwIiYQwbCpTW9XpGpLiMCVHwUOk6SjEEXFVsMj22mIpTVOsaNzB1TCzxXShV5vPsDvZ1GrMMTAcmzncLwFRZf3ayABB_3Q2wcMfJTY37imqGsdb1yZKa5NpoS56RKziry-SOD0YD7-pGJn4V-cTupibHQZNSLQ',
  },
  {
    id: 'chef-demo',
    title: 'Chef Demo',
    description: 'Ideal for restaurants and kitchenware stores. Optimized for video embeds and live streaming countdowns.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE0fCqMkTa7uOskGp9_e7jvC-fsxd4NnZhjgbb0rauQ1zaFuSSCjB9JBPvIWVu1-JVrJFKUhwHAcLfAgGYNfyhW7RFo8leI55U3I0FipJrbITPGX03x1v3JfZsAm3KcSyinSPaUGoSD6BxlA_FuaUZXhNK7nRhFWxD_MaA1MdpbQuBylTWHrWfCKBpoNMeLjnrsxCY2MGRMVtKmtyrKuAJv2FrI6tJEct9RMs2ziXGxmxVadSBMg4ufWkjO9_FC-y1uNyKfqcm0k4',
  },
  {
    id: 'beauty-demo',
    title: 'Beauty Demo & Skincare Clinic',
    description: 'Live beauty routines, makeup masterclasses, and customized skincare consultations.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8GDhDR_b3s6TweTs8QAkcULmJVj1z_7y1n_7WImqA3b-BNWNGWRq6c93cLhiJq3C4XrvIOEPO_BtDMWLCJQNxRY5qZvVdCwZqcVi7wV1onojwy6QUrKOP3Xdsc1Ioe5g1iZfgYVokbiFkr0nOPzSkMzFYa6hMz7nQQAahtCQnNsLe8qJeAaLA-UJcwaUV_cBqkh6nuLOniLVAA_TJHS68mQyGh4NHx8LBNVTbnTBOB3T8F4TdWAonc5EGEz5zm9kCDBc5DZ4itOM',
  },
  {
    id: 'fashion-showcase',
    title: 'Fashion Showcase',
    description: 'Launch your new collection with style. Features a dynamic lookbook gallery and \'Shop the Runway\' links.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_0UMDi13BscZgmRsOQuedBecVYYKRLas--Czl-xjNuwqSwd1F1rTepZnMpBnVPaIRFvaByTpwhy086J9eQkWSSgd-zU-267tf1jiESkDaH7O5ES-mWcFnOZ_AsI4cMHyZPo5MQqsWPaMatB4Z8f4esD0O0pnnVkyWlaeiSWrGRjVJQPa4xAkGEPXUAD9aIGYGbb3qP27uE7xJyXH3Bd7XsO65uTL2Ck6GEqZ-kdyRiCRfwmGmmZNI2KjpAvpevK4FlSBCyS_lThQ',
  },
  {
    id: 'business-networking',
    title: 'Business Networking',
    description: 'Grow your local ecosystem. Includes attendee directory features and automated LinkedIn follow-ups.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Fow7V-JrC9GHZsFk10osEPa822FiXA6C_NHxXNEqQdwjonCOTsxl4wwHAhlsA4EBht3B2arIP8PQmpl0Khe-E5B0GOOxGNXpq3XbofygPh9-lXoPau920lw6X59D7SUHodg-oRUDxaySNt2E7wUYkGpjWkQ0eOh32Jgx3W6zjooMTZwcM66RFapHy1fRGiOAY6SbUF6vF9IdUIGLsH1fPV7G0gB-7mCzC4syG9m94vd95XpcLEuSkevqIVHAAqd6SO853fu30Pg',
  },
  {
    id: 'borough-expo',
    title: 'Borough Expo',
    description: 'For multi-vendor neighborhood events. Optimized for interactive maps and vendor spotlight bios.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHCULvEmC6sB4aNGRM_UFEkIk0aucq3Nyji7o0g8sjjZj5NiLXMUfYqSGDKEPxm4h7dzlOQSBn_h4vuxw-hxBoOq9ndQaSaiwgtIuhz78NC17JaacHXMN03mndWF23dHSo7tSwX2pzzNz_kuna2HiLV5FNjUHGXdtjJgZa3XizAowS6uJHtW39m872BE3EE8t-Ez-HyT_Yuu60XFGREwywqWt3OeTeK91osc4EeXNHwTy0JU94jNZBvivE4F2mWm-18kQnrXlqS2o',
  }
];

export default function NewEventWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [venueType, setVenueType] = useState<'in-person' | 'online'>('in-person');
  const [location, setLocation] = useState('');
  const [entryType, setEntryType] = useState<'free' | 'paid' | 'points' | 'invite'>('free');
  const [entryPrice, setEntryPrice] = useState('');
  const [entryPoints, setEntryPoints] = useState('');
  const [borough, setBorough] = useState('Southwark');
  const [highStreet, setHighStreet] = useState('Peckham High Street');
  const [customHighStreet, setCustomHighStreet] = useState('');

  // Promotion Fields
  const [promoteRotator, setPromoteRotator] = useState(true);
  const [promoteQR, setPromoteQR] = useState(true);
  const [promoteAlert, setPromoteAlert] = useState(false);
  const [associateVoucher, setAssociateVoucher] = useState(false);
  const [voucherProductId, setVoucherProductId] = useState('');
  const [createCountdown, setCreateCountdown] = useState(false);
  const [countdownTime, setCountdownTime] = useState('24');

  // Dynamic Data States
  const [voucherProducts, setVoucherProducts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Voucher templates
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await getVoucherProducts();
        setVoucherProducts(response || []);
      } catch (err) {
        console.error('Error fetching voucher products:', err);
      }
    };
    fetchVouchers();
  }, []);

  // Status Modals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Reset scroll on step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Handle Event Type Selection
  const handleSelectEventType = (type: EventType) => {
    setSelectedEventType(type);
    setStep(2);
  };

  // Handle Template Selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const selected = TEMPLATES.find(t => t.id === templateId);
    if (selected) {
      setTitle(selected.title);
      setDescription(selected.description);
    }
    setStep(3);
  };

  // Skip template & custom build
  const handleStartCustom = () => {
    setSelectedTemplate('custom');
    setTitle('');
    setDescription('');
    setStep(3);
  };

  const handleLaunchEvent = async () => {
    const finalHighStreet = (borough !== 'Other' && highStreet === 'Other') ? customHighStreet : highStreet;

    if (!title || !date || !time || !location || !borough || !finalHighStreet) {
      toast.error('Please fill out all required fields on the details step.');
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        date,
        time,
        capacity: parseInt(capacity) || 100,
        venueType,
        location,
        borough,
        highStreet: finalHighStreet,
        entryType,
        entryPrice: entryType === 'paid' ? parseFloat(entryPrice) || 0 : undefined,
        entryPoints: entryType === 'points' ? parseInt(entryPoints) || 0 : undefined,
        selectedTemplate,
        promoteRotator,
        promoteQR,
        promoteAlert,
        associateVoucher,
        voucherProductId: associateVoucher && voucherProductId ? voucherProductId : undefined,
        createCountdown,
        countdownTime: createCountdown ? countdownTime : undefined,
        status: 'upcoming',
        imageUrl: selectedTemplate && selectedTemplate !== 'custom' 
          ? TEMPLATES.find(t => t.id === selectedTemplate)?.image 
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8GDhDR_b3s6TweTs8QAkcULmJVj1z_7y1n_7WImqA3b-BNWNGWRq6c93cLhiJq3C4XrvIOEPO_BtDMWLCJQNxRY5qZvVdCwZqcVi7wV1onojwy6QUrKOP3Xdsc1Ioe5g1iZfgYVokbiFkr0nOPzSkMzFYa6hMz7nQQAahtCQnNsLe8qJeAaLA-UJcwaUV_cBqkh6nuLOniLVAA_TJHS68mQyGh4NHx8LBNVTbnTBOB3T8F4TdWAonc5EGEz5zm9kCDBc5DZ4itOM'
      };

      const response = await api.post('/events', payload);
      if (response.data) {
        setIsSuccessModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error creating event:', err);
      toast.error(err.response?.data?.message || 'Failed to create event. Please try again.');
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
            <span>Step {step} of 4</span>
            <span>·</span>
            <span className="text-gray-500">
              {step === 1 && 'Select Experience'}
              {step === 2 && 'Pick Preset Template'}
              {step === 3 && 'Details Setup'}
              {step === 4 && 'Launch Setup'}
            </span>
          </div>
          <button
            onClick={() => router.push('/dashboard/events')}
            className="text-xs font-bold text-gray-500 hover:text-[#a14000] transition-colors"
          >
            Cancel Wizard
          </button>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#ff6900] transition-all duration-500 ease-out"
            style={{ width: `${step * 25}%` }}
          />
        </div>
      </div>

      {/* --- Step Contents --- */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30] mb-2">
                Create New Event
              </h1>
              <p className="text-sm sm:text-base text-gray-500 font-medium">
                Select the type of experience you want to offer your community. Choose a category to get started with tailored tools.
              </p>
            </div>

            {/* Bento Grid Event Types */}
            <div className="grid grid-cols-12 gap-6 pb-12">
              {EVENT_TYPES.map((type) => {
                const isImage = !!type.image;
                const IconComp = type.icon;
                const BgIconComp = type.bgIcon;

                return (
                  <div
                    key={type.id}
                    onClick={() => handleSelectEventType(type.id)}
                    className={`bento-card group cursor-pointer relative overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-700/5 ${type.span}`}
                  >
                    {isImage ? (
                      <>
                        <img
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          src={type.image}
                          alt={type.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 sm:p-8 flex flex-col justify-end h-full w-full">
                          {type.badge && (
                            <span className="self-start inline-block px-3 py-1 rounded-full bg-[#ff6900] text-white text-[10px] font-black tracking-wider mb-3 shadow-md">
                              {type.badge}
                            </span>
                          )}
                          <h4 className="text-xl sm:text-2xl font-black text-white">{type.title}</h4>
                          <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-md line-clamp-2 leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className={`p-6 sm:p-8 flex flex-col justify-between h-full relative ${type.bg || ''}`}>
                        {BgIconComp && (
                          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 rotate-12 transition-transform duration-700 group-hover:rotate-45">
                            <BgIconComp size={120} />
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${type.bg ? 'bg-white/10 text-white' : 'bg-orange-50 text-[#a14000]'}`}>
                            {IconComp ? <IconComp size={24} /> : <Rocket size={24} />}
                          </div>
                          {type.badge && (
                            <span className="bg-[#a14000] text-white px-2 py-0.5 rounded text-[9px] font-black tracking-wider shadow-sm uppercase animate-pulse">
                              {type.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-8">
                          <h4 className="text-lg font-bold leading-tight">{type.title}</h4>
                          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${type.bg ? 'text-white/80' : 'text-gray-500'}`}>
                            {type.description}
                          </p>
                        </div>
                        <div className="flex justify-end mt-4">
                          <span className={`transition-transform duration-300 group-hover:translate-x-1.5 ${type.bg ? 'text-white' : 'text-[#a14000]'}`}>
                            <ArrowRight size={18} />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
              <div className="max-w-2xl">
                <span className="text-xs font-bold text-[#a14000] uppercase tracking-widest mb-1.5 block">
                  Campaign Creator
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] mb-3">
                  Event Template Library
                </h2>
                <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                  Empower your store presence with high-conversion event presets. Select a starting point or customize every detail to match your brand's unique energy.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => toast.info('Historical templates setup')}
                  className="px-5 py-3 border border-[#a14000] text-[#a14000] font-bold text-xs rounded-xl hover:bg-orange-50/50 transition-colors active:scale-95 duration-150 bg-white"
                >
                  View History
                </button>
                <button
                  onClick={handleStartCustom}
                  className="px-5 py-3 bg-[#a14000] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-700/10 hover:bg-[#a14000]/95 transition-all active:scale-95 duration-150"
                >
                  + Custom Event
                </button>
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((tmpl) => (
                <article
                  key={tmpl.id}
                  className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-700/5"
                >
                  <div className="h-48 overflow-hidden relative bg-slate-100 shrink-0">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={tmpl.image}
                      alt={tmpl.title}
                    />
                    {tmpl.trending && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={10} className="fill-emerald-800 text-emerald-100" />
                          Trending
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 min-h-[180px] justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#0b1c30] mb-2">{tmpl.title}</h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        className="py-3 bg-orange-50 text-[#ff6900] font-black rounded-xl text-xs active:scale-95 duration-150 transition-transform"
                      >
                        Use Template
                      </button>
                      <button
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        className="py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 active:scale-95 duration-150 transition-all"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Empty State Suggestion */}
            <div className="bg-slate-100/60 rounded-3xl p-8 sm:p-10 text-center border-2 border-dashed border-slate-200 max-w-3xl mx-auto mt-6">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6900] mx-auto shadow-sm">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30]">Not seeing the right vibe?</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Our design team is constantly crafting new high-engagement templates. Suggest a theme or use our AI Generator to build a custom structure.
                </p>
                <button
                  onClick={() => toast.success('AI Event Architect activated')}
                  className="px-6 py-3 bg-[#0b1c30] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#0b1c30]/90 transition-all active:scale-95"
                >
                  Launch AI Event Architect
                </button>
              </div>
            </div>

            {/* Footer Back */}
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-6 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-500 hover:text-[#a14000] font-bold text-sm transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Event Types
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] mb-2">
                Event Setup Details
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Configure your event scheduling, location, ticketing parameters, and basic description rules.
              </p>
            </div>

            <form className="space-y-6 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              {/* Event Title */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wine & Tapas Saturday Soiree"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                />
              </div>

              {/* Event Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Tell your local community what makes this experience special. Outline activities, schedules, and dress codes."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                />
              </div>

              {/* Date, Time & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Max Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                  />
                </div>
              </div>

              {/* Venue Type & Details */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Venue Type <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl bg-slate-100 p-1 w-full max-w-[300px]">
                  <button
                    type="button"
                    onClick={() => {
                      setVenueType('in-person');
                      setLocation('');
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${venueType === 'in-person' ? 'bg-white shadow-sm text-[#ff6900]' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    In-Person Venue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVenueType('online');
                      setLocation('');
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${venueType === 'online' ? 'bg-white shadow-sm text-[#ff6900]' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Online Webinar
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600">
                    {venueType === 'in-person' ? 'Physical Address or Location details' : 'Stream Link or Meeting URL'}
                  </label>
                  <input
                    type="text"
                    placeholder={venueType === 'in-person' ? 'Store Front, Aisle 3 / 45 High St, Shoreditch' : 'https://zoom.us/j/982173...'}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                  />
                </div>
              </div>

              {/* Borough & High Street Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Borough <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={borough}
                    onChange={(e) => {
                      const b = e.target.value;
                      setBorough(b);
                      if (b === 'Southwark') setHighStreet('Peckham High Street');
                      else if (b === 'Lambeth') setHighStreet('Brixton High Street');
                      else if (b === 'Camden') setHighStreet('Camden High Street');
                      else setHighStreet('');
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900] bg-white"
                  >
                    <option value="Southwark">Southwark</option>
                    <option value="Lambeth">Lambeth</option>
                    <option value="Camden">Camden</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    High Street <span className="text-red-500">*</span>
                  </label>
                  {borough === 'Other' ? (
                    <input
                      type="text"
                      placeholder="e.g. Oxford Street"
                      value={highStreet}
                      onChange={(e) => setHighStreet(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                    />
                  ) : (
                    <select
                      value={highStreet}
                      onChange={(e) => setHighStreet(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900] bg-white"
                    >
                      {borough === 'Southwark' && <option value="Peckham High Street">Peckham High Street</option>}
                      {borough === 'Lambeth' && <option value="Brixton High Street">Brixton High Street</option>}
                      {borough === 'Camden' && <option value="Camden High Street">Camden High Street</option>}
                      <option value="Other">Other / Custom</option>
                    </select>
                  )}
                </div>
              </div>

              {borough !== 'Other' && highStreet === 'Other' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600">Custom High Street Name</label>
                  <input
                    type="text"
                    placeholder="Enter custom high street name..."
                    value={customHighStreet}
                    onChange={(e) => setCustomHighStreet(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                  />
                </div>
              )}

              {/* Entry Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ticket Entry Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'free', label: 'Free RSVP', icon: Gift },
                    { id: 'paid', label: 'Paid Ticket', icon: Ticket },
                    { id: 'points', label: 'Points Only', icon: Coins },
                    { id: 'invite', label: 'Invite Only', icon: Lock }
                  ].map((item) => {
                    const SelectedIcon = item.icon;
                    const isSelected = entryType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEntryType(item.id as any)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${isSelected ? 'border-[#ff6900] bg-orange-50/10 text-[#ff6900] ring-1 ring-[#ff6900]/20' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <SelectedIcon size={20} className="mb-2" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Entry Type Specific Input fields */}
                {entryType === 'paid' && (
                  <div className="flex flex-col gap-2 p-4 bg-orange-50/5 rounded-2xl border border-slate-200/60 mt-2">
                    <label className="text-xs font-bold text-slate-600">Ticket Price (£)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15.00"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-32 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                    />
                  </div>
                )}
                {entryType === 'points' && (
                  <div className="flex flex-col gap-2 p-4 bg-orange-50/5 rounded-2xl border border-slate-200/60 mt-2">
                    <label className="text-xs font-bold text-slate-600">Points Cost</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={entryPoints}
                      onChange={(e) => setEntryPoints(e.target.value)}
                      className="w-32 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
                    />
                  </div>
                )}
              </div>
            </form>

            {/* Form Footer Buttons */}
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-6 mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-500 hover:text-[#a14000] font-bold text-sm transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Templates
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalHighStreet = (borough !== 'Other' && highStreet === 'Other') ? customHighStreet : highStreet;
                  if (!title || !date || !time || !location || !borough || !finalHighStreet) {
                    toast.error('Please fill out all required fields including Borough and High Street.');
                    return;
                  }
                  setStep(4);
                }}
                className="px-6 py-3.5 bg-[#a14000] hover:bg-[#a14000]/95 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-700/10 flex items-center gap-2 transition-all active:scale-95"
              >
                Continue Setup
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] mb-2">
                Promote & Confirm Event
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Review your event parameters and customize your localized marketing campaigns before launching.
              </p>
            </div>

            {/* Review Summary Card */}
            <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-100 text-[#ff6900] tracking-wider">
                    {selectedEventType?.replace('-', ' ')}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-2">{title}</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-md line-clamp-2 leading-relaxed">{description}</p>
                </div>
                {selectedTemplate && selectedTemplate !== 'custom' && (
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Template</span>
                    <p className="text-xs font-bold text-[#a14000]">{selectedTemplate.replace('-', ' ')}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Date</p>
                    <p className="font-bold text-slate-800">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Clock size={15} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Start Time</p>
                    <p className="font-bold text-slate-800">{time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <MapPin size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                      {venueType === 'in-person' ? 'Location' : 'Stream Link'}
                    </p>
                    <p className="font-bold text-slate-800 truncate">{location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Users size={15} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Attendees Limit</p>
                    <p className="font-bold text-slate-800">{capacity} max</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2 border-t pt-2 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Compass size={15} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Borough & High Street</p>
                    <p className="font-bold text-slate-800">{borough} · {highStreet === 'Other' ? customHighStreet : highStreet}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wide">Access Mode</span>
                <span className="font-black text-[#ff6900]">
                  {entryType === 'free' && 'Free RSVP'}
                  {entryType === 'paid' && `Paid (£${entryPrice})`}
                  {entryType === 'points' && `Redeem (${entryPoints} pts)`}
                  {entryType === 'invite' && 'Invite Only'}
                </span>
              </div>
            </div>

            {/* Marketing Promotion Setup */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Marketing Launcher Options
              </h4>
              <div className="space-y-3">
                {/* Option 1: Local feed rotator */}
                <div
                  onClick={() => setPromoteRotator(!promoteRotator)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${promoteRotator ? 'border-[#ff6900] bg-orange-50/5 ring-1 ring-[#ff6900]/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${promoteRotator ? 'bg-[#ff6900] border-[#ff6900] text-white' : 'border-slate-300'}`}>
                    {promoteRotator && <Check size={12} className="stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">Auto-push to local high-street feed rotator</p>
                      <span className="bg-orange-100 text-[#ff6900] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Promote this event at the top of the local mall search pages to triple attendee interest.
                    </p>
                  </div>
                  <Megaphone className={`shrink-0 ${promoteRotator ? 'text-[#ff6900]' : 'text-slate-400'}`} size={20} />
                </div>

                {/* Option 2: QR Check-in */}
                <div
                  onClick={() => setPromoteQR(!promoteQR)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${promoteQR ? 'border-[#ff6900] bg-orange-50/5 ring-1 ring-[#ff6900]/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${promoteQR ? 'bg-[#ff6900] border-[#ff6900] text-white' : 'border-slate-300'}`}>
                    {promoteQR && <Check size={12} className="stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">Generate QR Check-in Codes</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Create scans for store arrivals, allowing immediate registration verification on the shopper's dashboard.
                    </p>
                  </div>
                  <QrCode className={`shrink-0 ${promoteQR ? 'text-[#ff6900]' : 'text-slate-400'}`} size={20} />
                </div>

                {/* Option 3: Proximity Alerts */}
                <div
                  onClick={() => setPromoteAlert(!promoteAlert)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${promoteAlert ? 'border-[#ff6900] bg-orange-50/5 ring-1 ring-[#ff6900]/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${promoteAlert ? 'bg-[#ff6900] border-[#ff6900] text-white' : 'border-slate-300'}`}>
                    {promoteAlert && <Check size={12} className="stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">Schedule Proximity Notifications</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Send an alert to customers within a 5-mile radius exactly 24 hours prior to the event launching.
                    </p>
                  </div>
                  <Bell className={`shrink-0 ${promoteAlert ? 'text-[#ff6900]' : 'text-slate-400'}`} size={20} />
                </div>

                {/* Option 4: Associate Vouchers */}
                <div
                  className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all ${associateVoucher ? 'border-[#ff6900] bg-orange-50/5 ring-1 ring-[#ff6900]/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <div 
                    onClick={() => setAssociateVoucher(!associateVoucher)}
                    className="flex items-start gap-4 cursor-pointer"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${associateVoucher ? 'bg-[#ff6900] border-[#ff6900] text-white' : 'border-slate-300'}`}>
                      {associateVoucher && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Associate Vouchers with Event</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Distribute shopping vouchers automatically to customers who successfully check in.
                      </p>
                    </div>
                    <Gift className={`shrink-0 ${associateVoucher ? 'text-[#ff6900]' : 'text-slate-400'}`} size={20} />
                  </div>

                  {associateVoucher && (
                    <div className="pl-9 pr-4 pb-2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Select Voucher Template</label>
                      <select
                        value={voucherProductId}
                        onChange={(e) => setVoucherProductId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff6900] focus:border-[#ff6900] bg-white text-slate-700"
                      >
                        <option value="">-- Choose a Voucher Template --</option>
                        {voucherProducts.map((vp) => (
                          <option key={vp.id} value={vp.id}>{vp.name} (£{vp.fixedAmounts?.[0] || '10'})</option>
                        ))}
                      </select>
                      {voucherProducts.length === 0 && (
                        <p className="text-[10px] text-gray-400">No voucher templates found. You can create one in the Vouchers tab first.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Option 5: Create Countdown */}
                <div
                  className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all ${createCountdown ? 'border-[#ff6900] bg-orange-50/5 ring-1 ring-[#ff6900]/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <div 
                    onClick={() => setCreateCountdown(!createCountdown)}
                    className="flex items-start gap-4 cursor-pointer"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${createCountdown ? 'bg-[#ff6900] border-[#ff6900] text-white' : 'border-slate-300'}`}>
                      {createCountdown && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Launch Active Live Countdown</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Display a countdown timer on the event preview page to build anticipation.
                      </p>
                    </div>
                    <Clock className={`shrink-0 ${createCountdown ? 'text-[#ff6900]' : 'text-slate-400'}`} size={20} />
                  </div>

                  {createCountdown && (
                    <div className="pl-9 pr-4 pb-2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Countdown Duration (Hours before start)</label>
                      <select
                        value={countdownTime}
                        onChange={(e) => setCountdownTime(e.target.value)}
                        className="w-48 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff6900] focus:border-[#ff6900] bg-white text-slate-700"
                      >
                        <option value="1">1 Hour</option>
                        <option value="3">3 Hours</option>
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours</option>
                        <option value="48">48 Hours</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 4 Footer */}
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-6 mt-8">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 text-gray-500 hover:text-[#a14000] font-bold text-sm transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleLaunchEvent}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-[#ff6900] hover:bg-[#ff6900]/90 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Launching...' : 'Launch Experience'}
                <Rocket size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Fullscreen Success Modal --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-[#ff6900] shadow-md border border-orange-100">
              <CheckCircle2 size={40} className="stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
                Event Live Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                "{title}" has been launched in the borough feed and is now ready for local check-ins and RSVPs.
              </p>
            </div>

            {/* Quick stats generated summary */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Event Status</p>
                <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Soon
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Borough Reach</p>
                <p className="font-bold text-slate-800 mt-0.5">{borough}</p>
              </div>
              <div className="col-span-2 border-t pt-2 mt-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Launch Promotions</p>
                <p className="font-bold text-[#ff6900] mt-0.5">
                  {[
                    promoteRotator && 'Rotator Feed',
                    promoteQR && 'Check-in QR Code',
                    promoteAlert && 'Shopper alerts',
                    associateVoucher && 'Vouchers',
                    createCountdown && 'Countdown'
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'None'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  router.push('/dashboard/events');
                }}
                className="w-full py-3.5 bg-[#a14000] hover:bg-[#a14000]/95 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Go to Events Manager
              </button>
              <button
                onClick={() => {
                  // Reset wizard states
                  setIsSuccessModalOpen(false);
                  setStep(1);
                  setSelectedEventType(null);
                  setSelectedTemplate(null);
                  setTitle('');
                  setDescription('');
                  setDate('');
                  setTime('');
                  setCapacity('100');
                  setLocation('');
                  setEntryType('free');
                }}
                className="w-full py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all active:scale-95"
              >
                + Create Another Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
