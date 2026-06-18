'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  PlusCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Percent,
  Users,
  X,
  Volume2,
  Grid,
  MapPin,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CapacityOffer {
  id: string;
  type: string;
  title: string;
  slots: number;
  dateTime: string;
  discount: number;
  bonusPoints: number;
  status: 'active' | 'scheduled';
}

export default function CapacityManagerDashboard() {
  const router = useRouter();

  // Active Capacity Offers
  const [offers, setOffers] = useState<CapacityOffer[]>([
    {
      id: '1',
      type: 'Empty Seats',
      title: 'Midweek Dinner Rush Special',
      slots: 6,
      dateTime: 'Tonight, 7:00 PM - 9:00 PM',
      discount: 25,
      bonusPoints: 100,
      status: 'active',
    },
    {
      id: '2',
      type: 'Appointment Slots',
      title: 'Afternoon Downtime Special',
      slots: 4,
      dateTime: 'Tomorrow, 2:00 PM - 4:00 PM',
      discount: 15,
      bonusPoints: 50,
      status: 'scheduled',
    },
  ]);

  // Instant Booking toggles & capacity inputs
  const [instantBooking, setInstantBooking] = useState(true);
  const [availableSeats, setAvailableSeats] = useState(12);

  // Wizard state machine (1 to 5 steps)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard form inputs
  const [selectedType, setSelectedType] = useState('Empty Seats');
  const [offerTitle, setOfferTitle] = useState('Happy Hour Table Booking');
  const [bookingDate, setBookingDate] = useState('2026-06-18');
  const [bookingTime, setBookingTime] = useState('18:00');
  const [bookingDuration, setBookingDuration] = useState('2 hours');
  const [quantity, setQuantity] = useState(4);
  const [discountRate, setDiscountRate] = useState(20);
  const [rewardPoints, setRewardPoints] = useState(100);
  const [targetAudience, setTargetAudience] = useState<string[]>(['nearby', 'loyalty']);

  const handleOpenWizard = () => {
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    if (wizardStep < 5) {
      setWizardStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(prev => prev - 1);
    }
  };

  const toggleAudience = (segment: string) => {
    if (targetAudience.includes(segment)) {
      setTargetAudience(targetAudience.filter(s => s !== segment));
    } else {
      setTargetAudience([...targetAudience, segment]);
    }
  };

  const handleActivate = () => {
    const newOffer: CapacityOffer = {
      id: Math.random().toString(),
      type: selectedType,
      title: offerTitle || `${selectedType} Offer`,
      slots: quantity,
      dateTime: `${bookingDate} at ${bookingTime} (${bookingDuration})`,
      discount: discountRate,
      bonusPoints: rewardPoints,
      status: 'active',
    };
    setOffers([newOffer, ...offers]);
    setIsWizardOpen(false);
    toast.success('Instant Booking offer launched live to selected neighborhood zones!');
  };

  const handleCancelOffer = (id: string) => {
    setOffers(offers.filter(o => o.id !== id));
    toast.success('Capacity offer cancelled.');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header back button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-150 pb-6">
        <div>
          <button 
            onClick={() => router.push('/dashboard/tools')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a14000] hover:text-[#ff6900] mb-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools Overview
          </button>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Capacity Manager</h1>
          <p className="text-sm text-[#5a4136]">Maximize occupancy and fill quiet periods with real-time dynamic slots.</p>
        </div>
        <Button 
          onClick={handleOpenWizard}
          className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-6 py-6 rounded-xl flex items-center gap-2 shadow-md transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Launch Instant Offer
        </Button>
      </div>

      {/* Summary Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#a14000] text-white p-6 rounded-3xl relative overflow-hidden border-none shadow-md">
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Occupancy Goal</span>
            <h3 className="text-3xl font-black font-mono">74% Avg Fill Rate</h3>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-300 h-full rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-3 translate-x-3">
            <Calendar size={110} />
          </div>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">Active Slot Offers</span>
          <h3 className="text-3xl font-black font-mono text-[#a14000] mt-2">{offers.length} Offers</h3>
          <p className="text-xs text-gray-400 mt-2">Attracting nearby diners and walkers.</p>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">Instant Walk-Ins</span>
          <div className="flex justify-between items-center mt-2">
            <span className="text-3xl font-black font-mono text-emerald-600">Enabled</span>
            <button 
              onClick={() => {
                setInstantBooking(!instantBooking);
                toast.success(instantBooking ? 'Instant bookings disabled.' : 'Instant bookings enabled.');
              }}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${instantBooking ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute ${instantBooking ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Automated storefront table matching.</p>
        </Card>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Active Slots Offer list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ff6900]" />
                Live Availability Offers
              </h3>
              <span className="bg-orange-50 text-[#a14000] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Neighborhood Target</span>
            </div>

            {offers.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center mx-auto">
                  <Calendar size={30} />
                </div>
                <div>
                  <p className="font-bold text-lg text-[#a14000]">No Active Capacity Offers</p>
                  <p className="text-xs text-[#5a4136]">Your schedule is full or offline. Launch a promo slot to attract customers now.</p>
                </div>
                <Button onClick={handleOpenWizard} className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold">
                  Create Time-Slot Offer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((item) => (
                  <div 
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-transparent hover:border-[#ff6900]/30 hover:bg-white transition-all gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 bg-orange-50 text-[#ff6900] rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-[#0b1c30] text-sm">{item.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                            item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-[#a14000]'
                          }`}>{item.status.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-[#5a4136] mt-0.5">{item.dateTime} • {item.slots} slots open</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                          {item.discount}% Off + {item.bonusPoints} Points
                        </span>
                      </div>
                      <Button 
                        variant="ghost"
                        onClick={() => handleCancelOffer(item.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Capacity Adjuster Panel */}
          <div className="bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-md font-bold text-[#0b1c30]">Manual Occupancy Adjuster</h4>
            <p className="text-xs text-[#5a4136]">Adjust your current live table/slot counter displayed on the neighborhood feed.</p>
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  if (availableSeats > 0) setAvailableSeats(prev => prev - 1);
                }}
                className="w-12 h-12 bg-gray-100 hover:bg-[#ff6900]/10 text-gray-700 hover:text-[#ff6900] font-black text-xl rounded-xl transition-colors"
              >
                -
              </button>
              <div className="flex flex-col items-center justify-center bg-[#f8f9ff] border border-gray-150 px-6 py-2.5 rounded-xl min-w-28">
                <span className="text-2xl font-black font-mono text-[#a14000]">{availableSeats}</span>
                <span className="text-[9px] uppercase font-bold text-gray-400">Available Slots</span>
              </div>
              <button 
                onClick={() => setAvailableSeats(prev => prev + 1)}
                className="w-12 h-12 bg-gray-100 hover:bg-[#ff6900]/10 text-gray-700 hover:text-[#ff6900] font-black text-xl rounded-xl transition-colors"
              >
                +
              </button>
              <Button 
                onClick={() => {
                  toast.success(`Live availability count updated to ${availableSeats}.`);
                }}
                className="bg-[#a14000] text-white hover:bg-[#ff6900] font-bold px-5 rounded-xl ml-auto"
              >
                Update Count
              </Button>
            </div>
          </div>
        </div>

        {/* Right Hand: Waitlist log & pro-tip */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="text-sm font-bold text-[#0b1c30]">Live Waitlist Log</h4>
              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold">2 Waiting</span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-red-50/40 rounded-2xl border border-red-100/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">Toby Henderson</p>
                  <p className="text-[10px] text-gray-400">Party of 4 • Waiting 12m ago</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => toast.success('Toby notified of open slots!')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg h-7"
                >
                  OFFER SLOT
                </Button>
              </div>

              <div className="p-3 bg-red-50/40 rounded-2xl border border-red-100/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">Samantha K.</p>
                  <p className="text-[10px] text-gray-400">Party of 2 • Waiting 18m ago</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => toast.success('Samantha notified of open slots!')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg h-7"
                >
                  OFFER SLOT
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">7-Day Occupancy Index</h4>
            {/* Simple Dynamic bar chart */}
            <div className="h-28 flex items-end gap-2 pt-2">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="bg-[#ff6900]/30 hover:bg-[#ff6900] transition-colors rounded-t w-full h-[45%]" title="Mon"></div>
                <span className="text-[9px] font-bold text-gray-400">M</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="bg-[#ff6900]/30 hover:bg-[#ff6900] transition-colors rounded-t w-full h-[60%]" title="Tue"></div>
                <span className="text-[9px] font-bold text-gray-400">T</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="bg-[#ff6900]/30 hover:bg-[#ff6900] transition-colors rounded-t w-full h-[50%]" title="Wed"></div>
                <span className="text-[9px] font-bold text-gray-400">W</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="bg-[#ff6900]/30 hover:bg-[#ff6900] transition-colors rounded-t w-full h-[80%]" title="Thu"></div>
                <span className="text-[9px] font-bold text-gray-400">T</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="bg-[#ff6900] rounded-t w-full h-[95%]" title="Fri"></div>
                <span className="text-[9px] font-bold text-gray-400">F</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="bg-[#ff6900] rounded-t w-full h-[90%]" title="Sat"></div>
                <span className="text-[9px] font-bold text-gray-400">S</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="bg-[#ff6900]/30 hover:bg-[#ff6900] transition-colors rounded-t w-full h-[70%]" title="Sun"></div>
                <span className="text-[9px] font-bold text-gray-400">S</span>
              </div>
            </div>
            <p className="text-xs text-[#5a4136] text-center pt-1 font-medium">Fridays are your highest demand periods.</p>
          </Card>
        </div>

      </div>

      {/* ----------------- 5-STEP CAPACITY BUILDER WIZARD ----------------- */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#f8f9ff]">
              <div>
                <span className="text-[9px] font-black uppercase text-[#ff6900] tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">Step {wizardStep} of 5</span>
                <h3 className="text-lg font-black text-[#0b1c30] mt-1">Create Instant Booking Offer</h3>
              </div>
              <button 
                onClick={() => setIsWizardOpen(false)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Steps Content */}
            <div className="p-6 flex-grow overflow-y-auto max-h-[400px] space-y-4">
              
              {/* Step 1: Select Capacity Type */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">1. Select Capacity Type</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Empty Seats', desc: 'For restaurants, cafes & bars' },
                      { id: 'Appointment Slots', desc: 'For salons, spas & clinics' },
                      { id: 'Class Availability', desc: 'For gyms, tutors & studios' },
                      { id: 'Service Downtime', desc: 'For custom service slots' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 border rounded-2xl flex flex-col text-left justify-between h-24 transition-all hover:border-[#ff6900]/50 ${
                          selectedType === type.id 
                            ? 'border-[#ff6900] bg-orange-50 text-[#a14000]' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="text-xs font-black block">{type.id}</span>
                        <span className="text-[10px] text-gray-400 mt-1">{type.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-[#5a4136]">Offer Title</label>
                    <input 
                      type="text" 
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full"
                      placeholder="e.g. Midweek Dinner Discount"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Date, Time & Quantity */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">2. Set Date & Slots</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Date</label>
                      <input 
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Start Time</label>
                      <input 
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Duration</label>
                      <select
                        value={bookingDuration}
                        onChange={(e) => setBookingDuration(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                      >
                        <option value="1 hour">1 hour</option>
                        <option value="1.5 hours">1.5 hours</option>
                        <option value="2 hours">2 hours</option>
                        <option value="3 hours">3 hours</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Available Slots</label>
                      <input 
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Set Discount & Rewards */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">3. Quick Discount & Points</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Promo Discount Rate (%)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={discountRate}
                        onChange={(e) => setDiscountRate(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff6900]"
                      />
                      <span className="w-12 text-center font-bold text-sm text-[#0b1c30] font-mono">{discountRate}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Bonus Loyalty Points</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 100, 200].map((points) => (
                        <button
                          key={points}
                          onClick={() => setRewardPoints(points)}
                          className={`p-2.5 border rounded-xl text-xs font-bold text-center transition-all ${
                            rewardPoints === points 
                              ? 'border-[#ff6900] bg-orange-50 text-[#a14000]' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          +{points} Pts
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Audience Target segments */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">4. Select Target Audience</h4>
                  <p className="text-xs text-[#5a4136]">Choose which local cohorts should receive direct push-notices of these open slots:</p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'nearby', title: 'Nearby Customers feed', desc: 'Send push within a 2-mile live radius' },
                      { id: 'loyalty', title: 'Loyalty Club VIPs', desc: 'Promote to your top 100 repeat customers' },
                      { id: 'inactive', title: 'Win-Back Audience', desc: 'Notify customers who haven\'t booked in 30 days' },
                      { id: 'borough', title: 'Borough Spotlight Rotator', desc: 'Premium slot inclusion on district home banners' }
                    ].map((segment) => {
                      const isChecked = targetAudience.includes(segment.id);
                      return (
                        <div 
                          key={segment.id}
                          onClick={() => toggleAudience(segment.id)}
                          className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isChecked ? 'border-[#ff6900] bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#0b1c30] block">{segment.title}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">{segment.desc}</span>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#ff6900] border-transparent text-white' : 'border-gray-300'
                          }`}>
                            {isChecked && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Live Activation */}
              {wizardStep === 5 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-[#ff6900] flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-[#a14000]">Launch Live Offer!</h4>
                    <p className="text-xs text-[#5a4136] max-w-sm mx-auto">
                      All criteria checked. The slot offer will post immediately to storefronts and alert targeted local users.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border rounded-2xl text-left space-y-1.5 text-xs text-[#5a4136]">
                    <div>• <strong>Type</strong>: {selectedType}</div>
                    <div>• <strong>Offer Name</strong>: {offerTitle}</div>
                    <div>• <strong>Slots Available</strong>: {quantity}</div>
                    <div>• <strong>Bonus Points</strong>: +{rewardPoints} pts</div>
                    <div>• <strong>Discount</strong>: {discountRate}% off</div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-gray-100 flex justify-between bg-[#f8f9ff]">
              <Button 
                variant="ghost" 
                onClick={handlePrevStep} 
                disabled={wizardStep === 1}
                className="text-[#5a4136] font-bold"
              >
                Back
              </Button>
              {wizardStep < 5 ? (
                <Button 
                  onClick={handleNextStep}
                  className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-6 py-2.5 rounded-xl"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleActivate}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6 py-2.5 rounded-xl"
                >
                  Activate Live Slots
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
