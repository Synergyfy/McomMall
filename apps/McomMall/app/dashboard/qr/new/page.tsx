'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { 
  ArrowLeft, 
  ArrowRight, 
  Store, 
  ShoppingBag, 
  Tag, 
  Calendar, 
  Gift, 
  Download, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Palette, 
  Sparkles,
  Link2,
  Search,
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useGetUserListings } from '@/service/listings/hook';
import { useGetMyProducts } from '@/service/store/products/hook';
import { useGetVoucherProducts } from '@/service/hooks/useVoucherService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type QrType = 'storefront' | 'product' | 'promo' | 'event' | 'reward';

export default function QrCreatorWizard() {
  const router = useRouter();
  
  // Retrieve actual user listing ID
  const { data: listingsData, isLoading: isLoadingListing } = useGetUserListings(1, 1);
  const listing = listingsData?.data?.[0];
  const businessId = listing?.id;

  const [step, setStep] = useState<number>(1);
  
  // Wizard state parameters
  const [selectedType, setSelectedType] = useState<QrType>('storefront');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  const [qrColor, setQrColor] = useState<string>('#a14000'); // Terracotta brand default
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [copied, setCopied] = useState<boolean>(false);
  
  // Simulated generated QR parameters
  const [generatedId, setGeneratedId] = useState<string>('abc123');

  // Real product & promotion listings from database queries
  const { data: realProducts = [] } = useGetMyProducts();
  const { voucherProducts: realVouchers = [] } = useGetVoucherProducts();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Prepare bento grid selectable items based on type & data hooks
  const getSelectableItems = () => {
    switch (selectedType) {
      case 'storefront':
        return [
          {
            id: 'storefront-main',
            title: listing?.businessName || 'General Storefront',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGqd6FaS7BNCEivNL3bLL3cpht4BuHGE9x_fTYaKJE5gBa_nsMyybXlT1QNQ_BRojp9bMeXv3gpCiYZEYFd9nfjXeSvIwslGuwZeX88kZxxc-P6N5Gofc0p-oqOLKkHt7XOqLH4NeVw3_Uszn-d-jqgGx49T0GRZTdbkPn7U5LsVPCc0L67SfxO3Y0MOsekCxvv9C13c2Bgs5Gm2QpbLxHp0P4Y7P8iT8a-_kZ8XFuiFuuOdeJ42uBjSxVEi1HFEFMJcUQkWLnpVc',
            badge: 'Storefront',
            subtext: `Main landing page catalog: /business/${businessId || 'default'}`
          }
        ];
      case 'product':
        if (realProducts && realProducts.length > 0) {
          return realProducts.map((p: any) => ({
            id: p.id,
            title: p.title || p.name,
            image: p.images?.[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfV37AW7Qrg0GZDK8GumHmVuJ_RKXRdOgi0W540QfF1h2EMug24tmbQB1RS4iSC80_DE804UGXvMSoUuAv8iNwihNqhma5kMS2v82i97OooGpYtKyEYmtqp8M-sYmDVM9e46D9UZuJPHkbOwJ_f0xac2cP58S4gcF-6eNrNYu8HFw-IPVsytQlXIr3BNv44QvKLMt572mXRqfDrZr000gM55edSuhHydTA69awbOhvfGiUEYwuZsEwQ8WqgtD7whRTrCsVMYTRK9g',
            badge: p.category || 'Product',
            subtext: `£${p.price || 0.0} • In Stock`
          }));
        }
        // Fallback preview templates
        return [
          {
            id: 'mock-prod-1',
            title: 'Artisan Sourdough Loaf',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfV37AW7Qrg0GZDK8GumHmVuJ_RKXRdOgi0W540QfF1h2EMug24tmbQB1RS4iSC80_DE804UGXvMSoUuAv8iNwihNqhma5kMS2v82i97OooGpYtKyEYmtqp8M-sYmDVM9e46D9UZuJPHkbOwJ_f0xac2cP58S4gcF-6eNrNYu8HFw-IPVsytQlXIr3BNv44QvKLMt572mXRqfDrZr000gM55edSuhHydTA69awbOhvfGiUEYwuZsEwQ8WqgtD7whRTrCsVMYTRK9g',
            badge: 'Product Template',
            subtext: '£4.50 • 24 items in stock today'
          },
          {
            id: 'mock-prod-2',
            title: 'Handwoven Linen Table Apron',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrFU4BtNu-bZqZnHY6gj7vFgjIhwGMZyUn4poMxNREZ2-kkh3KBJkDX558UgNwOnmNu2xv8qieyE8Wf8oXj78yT58t7Wznluc0QoSdzWhJnpzTsdUP5ksIwv92KCkqOTM6ap71nZaTls4yKDEfl3tTEDPlWC4xoMWiZ_nWE5E7q5mPpYl48Qg2w5UTX_0p1iTNSdz3rq7OF8oNa-Fz16_vSQ13E9XXsJuOJsGtFQAtNcY_CJ7W3n1E-KSgnrnTn7BeBEEVbBsLpm8',
            badge: 'Product Template',
            subtext: '£28.00 • 8 items left in store'
          }
        ];
      case 'promo':
        if (realVouchers && realVouchers.length > 0) {
          return realVouchers.map((v: any) => ({
            id: v.id,
            title: v.name,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrFU4BtNu-bZqZnHY6gj7vFgjIhwGMZyUn4poMxNREZ2-kkh3KBJkDX558UgNwOnmNu2xv8qieyE8Wf8oXj78yT58t7Wznluc0QoSdzWhJnpzTsdUP5ksIwv92KCkqOTM6ap71nZaTls4yKDEfl3tTEDPlWC4xoMWiZ_nWE5E7q5mPpYl48Qg2w5UTX_0p1iTNSdz3rq7OF8oNa-Fz16_vSQ13E9XXsJuOJsGtFQAtNcY_CJ7W3n1E-KSgnrnTn7BeBEEVbBsLpm8',
            badge: v.voucherType || 'Discount',
            subtext: `${v.valueType === 'percentage' ? `${v.value}% OFF` : `£${v.value} OFF`} • Active`
          }));
        }
        // Fallback/design template promotions matching the user's mockup HTML
        return [
          {
            id: 'mock-promo-1',
            title: 'Spring Artisanal Collection — 20% OFF',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfV37AW7Qrg0GZDK8GumHmVuJ_RKXRdOgi0W540QfF1h2EMug24tmbQB1RS4iSC80_DE804UGXvMSoUuAv8iNwihNqhma5kMS2v82i97OooGpYtKyEYmtqp8M-sYmDVM9e46D9UZuJPHkbOwJ_f0xac2cP58S4gcF-6eNrNYu8HFw-IPVsytQlXIr3BNv44QvKLMt572mXRqfDrZr000gM55edSuhHydTA69awbOhvfGiUEYwuZsEwQ8WqgtD7whRTrCsVMYTRK9g',
            badge: 'Flash Sale',
            subtext: 'Expires in 3 days • 124 clicks'
          },
          {
            id: 'mock-promo-2',
            title: 'Sustainability Awareness Month Promo',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrFU4BtNu-bZqZnHY6gj7vFgjIhwGMZyUn4poMxNREZ2-kkh3KBJkDX558UgNwOnmNu2xv8qieyE8Wf8oXj78yT58t7Wznluc0QoSdzWhJnpzTsdUP5ksIwv92KCkqOTM6ap71nZaTls4yKDEfl3tTEDPlWC4xoMWiZ_nWE5E7q5mPpYl48Qg2w5UTX_0p1iTNSdz3rq7OF8oNa-Fz16_vSQ13E9XXsJuOJsGtFQAtNcY_CJ7W3n1E-KSgnrnTn7BeBEEVbBsLpm8',
            badge: 'Seasonal',
            subtext: 'Ends May 31 • 45 active links'
          },
          {
            id: 'mock-promo-3',
            title: 'Buy One Get One — Summer Ceramics',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGqd6FaS7BNCEivNL3bLL3cpht4BuHGE9x_fTYaKJE5gBa_nsMyybXlT1QNQ_BRojp9bMeXv3gpCiYZEYFd9nfjXeSvIwslGuwZeX88kZxxc-P6N5Gofc0p-oqOLKkHt7XOqLH4NeVw3_Uszn-d-jqgGx49T0GRZTdbkPn7U5LsVPCc0L67SfxO3Y0MOsekCxvv9C13c2Bgs5Gm2QpbLxHp0P4Y7P8iT8a-_kZ8XFuiFuuOdeJ42uBjSxVEi1HFEFMJcUQkWLnpVc',
            badge: 'Bundle',
            subtext: 'Limited time offer • 89 clicks today'
          }
        ];
      case 'event':
        return [
          {
            id: 'mock-event-1',
            title: 'Sourdough Baking Workshop',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGqd6FaS7BNCEivNL3bLL3cpht4BuHGE9x_fTYaKJE5gBa_nsMyybXlT1QNQ_BRojp9bMeXv3gpCiYZEYFd9nfjXeSvIwslGuwZeX88kZxxc-P6N5Gofc0p-oqOLKkHt7XOqLH4NeVw3_Uszn-d-jqgGx49T0GRZTdbkPn7U5LsVPCc0L67SfxO3Y0MOsekCxvv9C13c2Bgs5Gm2QpbLxHp0P4Y7P8iT8a-_kZ8XFuiFuuOdeJ42uBjSxVEi1HFEFMJcUQkWLnpVc',
            badge: 'Workshop',
            subtext: 'June 25, 2026 • 15 RSVP\'d'
          },
          {
            id: 'mock-event-2',
            title: 'Borough Lights Night Social',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfV37AW7Qrg0GZDK8GumHmVuJ_RKXRdOgi0W540QfF1h2EMug24tmbQB1RS4iSC80_DE804UGXvMSoUuAv8iNwihNqhma5kMS2v82i97OooGpYtKyEYmtqp8M-sYmDVM9e46D9UZuJPHkbOwJ_f0xac2cP58S4gcF-6eNrNYu8HFw-IPVsytQlXIr3BNv44QvKLMt572mXRqfDrZr000gM55edSuhHydTA69awbOhvfGiUEYwuZsEwQ8WqgtD7whRTrCsVMYTRK9g',
            badge: 'Pop-Up',
            subtext: 'July 21, 2026 • 48 interested'
          }
        ];
      case 'reward':
        return [
          {
            id: 'mock-reward-1',
            title: 'Default Referral Signup Bonus',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGqd6FaS7BNCEivNL3bLL3cpht4BuHGE9x_fTYaKJE5gBa_nsMyybXlT1QNQ_BRojp9bMeXv3gpCiYZEYFd9nfjXeSvIwslGuwZeX88kZxxc-P6N5Gofc0p-oqOLKkHt7XOqLH4NeVw3_Uszn-d-jqgGx49T0GRZTdbkPn7U5LsVPCc0L67SfxO3Y0MOsekCxvv9C13c2Bgs5Gm2QpbLxHp0P4Y7P8iT8a-_kZ8XFuiFuuOdeJ42uBjSxVEi1HFEFMJcUQkWLnpVc',
            badge: 'Referral',
            subtext: '100 Points • Direct signup points code'
          },
          {
            id: 'mock-reward-2',
            title: 'Local Loyalty Stamp Card',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrFU4BtNu-bZqZnHY6gj7vFgjIhwGMZyUn4poMxNREZ2-kkh3KBJkDX558UgNwOnmNu2xv8qieyE8Wf8oXj78yT58t7Wznluc0QoSdzWhJnpzTsdUP5ksIwv92KCkqOTM6ap71nZaTls4yKDEfl3tTEDPlWC4xoMWiZ_nWE5E7q5mPpYl48Qg2w5UTX_0p1iTNSdz3rq7OF8oNa-Fz16_vSQ13E9XXsJuOJsGtFQAtNcY_CJ7W3n1E-KSgnrnTn7BeBEEVbBsLpm8',
            badge: 'Loyalty',
            subtext: 'Buy 9 Get 1 Free • Active loyalty stamp'
          }
        ];
      default:
        return [];
    }
  };

  const selectableItems = getSelectableItems();
  const filteredItems = selectableItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createQrMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: campaignName || `${selectedType.toUpperCase()} QR`,
        qrType: selectedType,
        targetId: selectedTargetId || 'storefront-main',
        businessId
      };
      const res = await api.post('qr-codes', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setGeneratedId(data.id || 'abc123');
      toast.success('QR Code registered successfully!');
      setStep(3);
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to create QR';
      toast.error(`Creation failed: ${errMsg}`);
    }
  });

  const handleCreateQR = () => {
    if (!campaignName) {
      toast.error('Please select an item and enter a campaign name');
      return;
    }
    createQrMutation.mutate();
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/api/qr-codes/scan/${generatedId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Campaign link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDownload = (format: 'svg' | 'png') => {
    const svgEl = document.getElementById('generated-svg-qr');
    if (!svgEl) return;
    
    if (format === 'svg') {
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${campaignName || 'qr-code'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('Downloaded SVG file');
    } else {
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.src = svgUrl;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, 256, 256);
          context.drawImage(image, 0, 0, 256, 256);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${campaignName || 'qr-code'}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success('Downloaded PNG file');
        }
      };
    }
  };

  const shortLinkVal = `shp.hub/${generatedId.substring(0, 6)}`;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <button 
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else router.push('/dashboard/qr');
          }}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a14000] hover:text-[#ff6900] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-xs font-bold text-gray-500">STEP {step} OF 4</span>
      </div>

      {/* Steps Progress Indicators */}
      <div className="w-full max-w-xl mb-12 flex items-center justify-between relative px-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10">
          <div 
            className="h-full bg-[#ff6900] transition-all duration-300"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
        {[1, 2, 3, 4].map((num) => (
          <div 
            key={num}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
              step >= num 
                ? 'bg-[#ff6900] text-white border-[#ff6900] scale-110 shadow' 
                : 'bg-white text-gray-400 border-gray-200'
            }`}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Step Content Wrapper */}
      <div className="w-full max-w-5xl">
        
        {/* --- STEP 1: CHOOSE TYPE --- */}
        {step === 1 && (
          <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#a14000] tracking-tight">Select QR Campaign Type</h2>
              <p className="text-sm text-[#5a4136] max-w-md mx-auto mt-1">Choose the type of digital page or action you want this QR code to trigger.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
              {[
                { type: 'storefront', label: 'Storefront', icon: <Store className="w-6 h-6" />, desc: 'Main digital store' },
                { type: 'product', label: 'Product', icon: <ShoppingBag className="w-6 h-6" />, desc: 'Link specific item' },
                { type: 'promo', label: 'Promotion', icon: <Tag className="w-6 h-6" />, desc: 'Discount code offer' },
                { type: 'event', label: 'Event', icon: <Calendar className="w-6 h-6" />, desc: 'Neighborhood workshop' },
                { type: 'reward', label: 'Reward', icon: <Gift className="w-6 h-6" />, desc: 'Referral/Loyalty wallet' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setSelectedType(item.type as QrType)}
                  className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-between gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    selectedType === item.type 
                      ? 'border-[#ff6900] bg-[#ff6900]/5 text-[#a14000] ring-2 ring-[#ff6900]/25' 
                      : 'border-gray-150 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedType === item.type ? 'bg-[#ff6900] text-white' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight mt-1">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                className="bg-[#a14000] text-white hover:bg-[#ff6900] font-bold px-6 py-5 rounded-xl flex items-center gap-1"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 2: LINK CONTENT (Premium Bento layout) --- */}
        {step === 2 && (
          <div className="space-y-10">
            {/* Steps title and progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">Link QR Code</h1>
                <span className="text-sm font-semibold text-[#5a4136]">Step 2 of 4</span>
              </div>
              <div className="w-full bg-[#e2dfde] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#ff6900] h-full w-[50%] transition-all duration-500 ease-out"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Link Options */}
              <div className="lg:col-span-4 space-y-4">
                <h2 className="text-lg font-bold text-[#0b1c30] mb-2">What are you linking?</h2>
                <div className="space-y-3">
                  {[
                    { type: 'product', label: 'Product', icon: <ShoppingBag className="w-5 h-5" />, desc: 'Link specific item' },
                    { type: 'promo', label: 'Promotion', icon: <Tag className="w-5 h-5" />, desc: 'Direct customers to a flash sale' },
                    { type: 'event', label: 'Event', icon: <Calendar className="w-5 h-5" />, desc: 'RSVP for workshops or pop-ups' },
                    { type: 'reward', label: 'Reward', icon: <Gift className="w-5 h-5" />, desc: 'Redeemable loyalty points' },
                    { type: 'storefront', label: 'Storefront', icon: <Store className="w-5 h-5" />, desc: 'General landing page of your shop' }
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => {
                        setSelectedType(item.type as QrType);
                        setSelectedTargetId('');
                        setCampaignName('');
                      }}
                      className={`w-full p-4 flex items-center gap-4 border rounded-xl transition-all text-left group ${
                        selectedType === item.type
                          ? 'border-[#ff6900] ring-1 ring-[#ff6900] bg-[#ff6900]/5'
                          : 'border-gray-200 hover:border-[#ff6900]/40 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        selectedType === item.type
                          ? 'bg-[#ff6900] text-white'
                          : 'bg-gray-100 text-[#a14000] group-hover:bg-[#ff6900] group-hover:text-white'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#0b1c30]">{item.label}</p>
                        <p className="text-xs text-[#5a4136] leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Search and Selection */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#a14000] transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search promotions, products, or keywords..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 focus:border-[#ff6900] focus:ring-1 focus:ring-[#ff6900] transition-all font-sans shadow-sm text-sm"
                  />
                </div>

                {/* Bento Selection Grid */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-lg font-bold text-[#0b1c30] capitalize">
                      {selectedType === 'storefront' ? 'Storefront Destination' : `Recent ${selectedType}s`}
                    </h3>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center bg-white">
                      <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-500">No active {selectedType}s found</p>
                      <p className="text-xs text-gray-400 mt-1">Add them under your main dashboard first or select another option.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredItems.map((item, idx) => {
                        const isSelected = selectedTargetId === item.id;
                        const isWide = selectedType !== 'storefront' && idx === 2 && filteredItems.length >= 3;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedTargetId(item.id);
                              setCampaignName(item.title);
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex ${
                              isWide ? 'md:col-span-2 flex-row gap-4 items-center' : 'flex-col gap-3'
                            } ${
                              isSelected
                                ? 'border-[#a14000] ring-2 ring-[#a14000] bg-white'
                                : 'border-gray-250 hover:border-[#ff6900]/60 bg-white'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-[#a14000] rounded-full flex items-center justify-center text-white z-10">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}

                            <div className={`${
                              isWide ? 'w-20 h-20 shrink-0' : 'h-32 w-full'
                            } rounded-xl overflow-hidden bg-gray-50 relative`}>
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-orange-50 text-[#a14000] font-semibold text-[10px] mb-1 uppercase tracking-wider">
                                {item.badge}
                              </span>
                              <h4 className="font-bold text-base leading-tight text-[#0b1c30]">
                                {item.title}
                              </h4>
                              <p className="text-xs text-[#5a4136] mt-1">
                                {item.subtext}
                              </p>
                            </div>

                            {isWide && (
                              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-auto" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Campaign Reference Input */}
                {selectedTargetId && (
                  <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-3 shadow-sm">
                    <label className="text-xs font-bold text-[#5a4136] uppercase tracking-wider block">
                      Campaign Reference Name
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Enter a campaign reference name for analytics"
                      className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-[#ff6900] focus:ring-1 focus:ring-[#ff6900] text-sm transition-all"
                    />
                  </div>
                )}

                {/* Warning / Tip Card */}
                <div className="bg-[#cec5bc]/20 border border-[#e2bfb0]/40 p-4 rounded-2xl flex gap-4 items-start">
                  <Info className="w-5 h-5 text-[#a14000] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-[#0b1c30]">Pro Tip: Deep Linking</p>
                    <p className="text-xs text-[#5a4136] leading-relaxed mt-0.5">
                      Linking to a specific promotion often results in a 40% higher conversion rate compared to general storefront links. Use this for specific in-store displays.
                    </p>
                  </div>
                </div>

                {/* Navigation Sticky Footer inside Wizard wrapper */}
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <button 
                    onClick={() => setStep(1)} 
                    className="px-6 py-3 rounded-full text-[#a14000] font-bold hover:bg-orange-50/50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toast.success('Draft saved successfully')}
                      className="px-6 py-3 rounded-full bg-[#e2dfde] text-[#5f5e5e] font-bold hover:opacity-90 transition-opacity"
                    >
                      Save Draft
                    </button>
                    <Button 
                      onClick={handleCreateQR}
                      disabled={createQrMutation.isPending}
                      className="px-10 py-3 rounded-full bg-[#ff6900] text-white hover:bg-[#a14000] font-bold shadow-lg active:scale-95 transition-transform"
                    >
                      {createQrMutation.isPending ? 'Generating...' : 'Next Step'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#a14000] tracking-tight">Your QR Asset is Live</h2>
              <p className="text-sm text-[#5a4136] max-w-sm mx-auto mt-1">Configure brand styling colors and download vector or pixel files.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
              {/* QR Preview Column */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="p-6 bg-white rounded-3xl border border-[#e2bfb0]/40 shadow-inner flex items-center justify-center relative overflow-hidden">
                  {/* react-qr-code SVG render */}
                  <QRCode
                    id="generated-svg-qr"
                    value={`${window.location.origin}/api/qr-codes/scan/${generatedId}`}
                    size={200}
                    fgColor={qrColor}
                    bgColor={bgColor}
                    level="Q"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 bg-[#f8f9ff] px-4 py-2 rounded-full border border-gray-100">
                  <span className="font-bold text-xs text-[#a14000]">{shortLinkVal}</span>
                  <button onClick={handleCopyLink} className="text-[#a14000] hover:scale-110 active:scale-95">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Style & Download Control Column */}
              <div className="md:col-span-6 space-y-5">
                <div className="p-5 rounded-2xl bg-[#f8f9ff] border border-gray-150 space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[#ff6900]" />
                    Style Customization
                  </h3>
                  <div className="flex gap-2">
                    {['#a14000', '#ff6900', '#0b1c30', '#1e8e3e', '#000000'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setQrColor(color)}
                        className={`w-7 h-7 rounded-full border border-white transition-transform ${
                          qrColor === color ? 'scale-125 ring-2 ring-[#ff6900]/40' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#5a4136]">Download Files</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => triggerDownload('svg')}
                      className="p-3 border border-gray-200 hover:border-[#ff6900] hover:bg-[#ff6900]/5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                      SVG (Vector)
                    </button>
                    <button
                      onClick={() => triggerDownload('png')}
                      className="p-3 border border-gray-200 hover:border-[#ff6900] hover:bg-[#ff6900]/5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                      PNG (High Res)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline" className="rounded-xl border-gray-200 font-bold px-5">
                Back
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                className="bg-[#a14000] text-white hover:bg-[#ff6900] font-bold px-6 py-5 rounded-xl flex items-center gap-1"
              >
                Continue to Share
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 4: SHARE QR FLOW --- */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#a14000] tracking-tight">Your QR is ready to promote!</h2>
              <p className="text-sm text-[#5a4136] max-w-sm mx-auto mt-1">Connect storefront window prints, social profiles, and campaigns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="border border-gray-150 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#a14000] shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-950 mb-1">Printcounter Posters</h3>
                  <p className="text-xs text-gray-500 mb-3">Print high-quality templates sized perfectly for window glass or counters.</p>
                  <Button size="sm" variant="outline" className="border-[#a14000] text-[#a14000] hover:bg-orange-50/50 rounded-lg">
                    Print Window Poster
                  </Button>
                </div>
              </div>

              <div className="border border-gray-150 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#a14000] shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-950 mb-1">Social Sharing Channels</h3>
                  <p className="text-xs text-gray-500 mb-3">Copy optimized links to paste directly into Instagram stories, Twitter, or WhatsApp broadcasts.</p>
                  <Button onClick={handleCopyLink} size="sm" className="bg-[#ff6900] text-white rounded-lg">
                    Copy Direct Link
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between">
              <Button onClick={() => setStep(3)} variant="outline" className="rounded-xl border-gray-200 font-bold px-5">
                Back
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/qr')} 
                className="bg-[#a14000] text-white hover:bg-[#ff6900] font-bold px-6 py-5 rounded-xl"
              >
                Finish Campaign
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
