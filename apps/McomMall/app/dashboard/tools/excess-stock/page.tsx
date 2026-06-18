'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  PlusCircle,
  TrendingUp,
  Layers,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Trash2,
  Percent,
  Compass,
  Gift,
  X,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

interface ClearanceItem {
  id: string;
  name: string;
  quantity: number;
  urgency: string;
  expiresIn: string;
  progress: number;
  image: string;
}

export default function ExcessStockDashboard() {
  const router = useRouter();

  // Active Clearance items list
  const [clearances, setClearances] = useState<ClearanceItem[]>([
    {
      id: '1',
      name: 'Organic Sourdough',
      quantity: 8,
      urgency: 'Expiring Soon',
      expiresIn: '4h 12m',
      progress: 60,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV54kuWXbmnPvHivj3ejY_Qvt8mYbhnyQLgScnUmC32rVLiqAgGZb95ypeo5Luxo3qcIRPU0XO84S7O4VcbzCVLG8CrN94hB4neWn3bYmxyPRpn4FFY1_EcVHm00ubl4ZuuaBIvfFIPq5Mw9pw0qe0ssBcmUZPjlkbliaGfLVUfAtdbyZNEdtN1AmLbUCONYDPncfZjbEl_-jFiMrPurMKVUpTksMrZmaO2YlM1YbOiP17VRecfZGcPn2L_BiJWk-3t_U6LEY1Vdus',
    },
    {
      id: '2',
      name: 'Craft IPA',
      quantity: 15,
      urgency: 'Overstocked',
      expiresIn: '2 days',
      progress: 25,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApYZ6Vn_RSfQamkVNVtUAMDPGHyNpk7dHF1yDp5NKrEj73cg0cqIAVhMTHM_kCf2ZWh5w4P5IPt_QwmuJSSfQ9iPGZRYt-ygTMnU7jwWpnrvcPQpaMYXdXaiRxgVsOD4cWdSEJGGX8l5oi5ylUiBLJZjcD3Wxlu0C9z_vKBcf1vVtw9AKlEBe82nyn2Yc9BNaJwnRSlZwlAGkfaU8Vub5ELRU1nvv5igVGKU6ZKEfeHnj-0dHv5-tvZzTyw7ZbgGWHNPJuPCrHYQkO',
    },
  ]);

  // Modal / Wizard state machine (1 to 6 steps)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard form inputs
  const [selectedProduct, setSelectedProduct] = useState('Organic Sourdough');
  const [quantity, setQuantity] = useState(10);
  const [urgency, setUrgency] = useState('Expiring Soon');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed' | 'bogo'>('percent');
  const [discountValue, setDiscountValue] = useState(20);
  const [channels, setChannels] = useState<string[]>(['storefront', 'nearby']);
  const [rewards, setRewards] = useState<string[]>(['points']);

  // Add clearance item handlers
  const handleOpenWizard = () => {
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    if (wizardStep < 6) {
      setWizardStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(prev => prev - 1);
    }
  };

  const toggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter(c => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const toggleReward = (reward: string) => {
    if (rewards.includes(reward)) {
      setRewards(rewards.filter(r => r !== reward));
    } else {
      setRewards([...rewards, reward]);
    }
  };

  const handleActivate = () => {
    const newItem: ClearanceItem = {
      id: Math.random().toString(),
      name: selectedProduct,
      quantity: quantity,
      urgency: urgency,
      expiresIn: urgency === 'Expiring Soon' ? '4 hours' : '3 days',
      progress: 0,
      image: selectedProduct.includes('Sourdough') 
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV54kuWXbmnPvHivj3ejY_Qvt8mYbhnyQLgScnUmC32rVLiqAgGZb95ypeo5Luxo3qcIRPU0XO84S7O4VcbzCVLG8CrN94hB4neWn3bYmxyPRpn4FFY1_EcVHm00ubl4ZuuaBIvfFIPq5Mw9pw0qe0ssBcmUZPjlkbliaGfLVUfAtdbyZNEdtN1AmLbUCONYDPncfZjbEl_-jFiMrPurMKVUpTksMrZmaO2YlM1YbOiP17VRecfZGcPn2L_BiJWk-3t_U6LEY1Vdus'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuApYZ6Vn_RSfQamkVNVtUAMDPGHyNpk7dHF1yDp5NKrEj73cg0cqIAVhMTHM_kCf2ZWh5w4P5IPt_QwmuJSSfQ9iPGZRYt-ygTMnU7jwWpnrvcPQpaMYXdXaiRxgVsOD4cWdSEJGGX8l5oi5ylUiBLJZjcD3Wxlu0C9z_vKBcf1vVtw9AKlEBe82nyn2Yc9BNaJwnRSlZwlAGkfaU8Vub5ELRU1nvv5igVGKU6ZKEfeHnj-0dHv5-tvZzTyw7ZbgGWHNPJuPCrHYQkO',
    };
    setClearances([newItem, ...clearances]);
    setIsWizardOpen(false);
    toast.success('Clearance campaign active! Shared across selected local zones.');
  };

  const handleRemoveClearance = (id: string) => {
    setClearances(clearances.filter(c => c.id !== id));
    toast.success('Clearance campaign stopped.');
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
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Excess Stock Dashboard</h1>
          <p className="text-sm text-[#5a4136]">Turn unsold inventory into active customers and immediate revenue.</p>
        </div>
        <Button 
          onClick={handleOpenWizard}
          className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-6 py-6 rounded-xl flex items-center gap-2 shadow-md transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Add Excess Stock
        </Button>
      </div>

      {/* Summary Bento metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#a14000] text-white p-6 rounded-3xl relative overflow-hidden border-none shadow-md">
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Inventory Health</span>
            <h3 className="text-3xl font-black font-mono">85% Stock Cleared</h3>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-300 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-3 translate-x-3">
            <Layers size={110} />
          </div>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">EXCESS ITEMS DETECTED</span>
          <h3 className="text-3xl font-black font-mono text-[#a14000] mt-2">12 Items</h3>
          <p className="text-xs text-gray-400 mt-2">Update inventory tracking to sync levels.</p>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">ACTIVE CAMPAIGNS</span>
          <h3 className="text-3xl font-black font-mono text-emerald-600 mt-2">{clearances.length} Clearances</h3>
          <p className="text-xs text-gray-400 mt-2">Reaching local high street zones.</p>
        </Card>
      </section>

      {/* Clearances Table & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active clearances list */}
        <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#ff6900]" />
              Active Clearances
            </h3>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{clearances.length} campaigns active</span>
          </div>

          {clearances.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center mx-auto">
                <ShoppingBag size={30} />
              </div>
              <div>
                <p className="font-bold text-lg text-[#a14000]">No Active Clearances</p>
                <p className="text-xs text-[#5a4136]">Your shelves are clear! Click Add Excess Stock if you have unsold items.</p>
              </div>
              <Button onClick={handleOpenWizard} className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold">
                Create Clearance Offer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {clearances.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-transparent hover:border-[#ff6900]/30 hover:bg-white transition-all gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#0b1c30] truncate">{item.name}</h4>
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0">{item.urgency}</span>
                      </div>
                      <p className="text-xs text-[#5a4136] mt-0.5">Expires in: {item.expiresIn} • {item.quantity} units left</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#5a4136]">Cleared Progress</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-bold text-sm text-[#0b1c30]">{item.progress}%</span>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ff6900]" style={{ width: `${item.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      onClick={() => handleRemoveClearance(item.id)}
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

        {/* Side Widget: Velocity Analytics & Quick Tip */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HIGHEST VELOCITY</p>
              <h4 className="text-lg font-bold text-[#a14000] mt-0.5">Daily Pastries</h4>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 text-xs font-extrabold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +24% Today
              </span>
              <span className="text-[10px] font-bold text-gray-400 font-mono">120 cleared</span>
            </div>
            {/* Sparkline */}
            <div className="h-16 flex items-end gap-1 pt-2">
              <div className="flex-1 bg-orange-100 rounded-t-sm h-[40%]"></div>
              <div className="flex-1 bg-orange-100 rounded-t-sm h-[55%]"></div>
              <div className="flex-1 bg-orange-100 rounded-t-sm h-[45%]"></div>
              <div className="flex-1 bg-orange-100 rounded-t-sm h-[70%]"></div>
              <div className="flex-1 bg-orange-100 rounded-t-sm h-[60%]"></div>
              <div className="flex-1 bg-orange-200 rounded-t-sm h-[85%]"></div>
              <div className="flex-1 bg-[#ff6900] rounded-t-sm h-[100%]"></div>
            </div>
          </Card>

          <Card className="bg-orange-50/50 border border-[#e2bfb0]/20 p-5 rounded-3xl space-y-3">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-lg bg-orange-100 text-[#a14000] shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h5 className="font-bold text-sm text-[#a14000]">Pro-Tip: Evening Rush</h5>
                <p className="text-xs text-[#5a4136] mt-1 leading-relaxed">
                  Items discounted after 5 PM have a 40% higher clearance rate. Schedule your next batch now.
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* ----------------- 6-STEP INTERACTIVE WIZARD MODAL ----------------- */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#f8f9ff]">
              <div>
                <span className="text-[9px] font-black uppercase text-[#ff6900] tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">Step {wizardStep} of 6</span>
                <h3 className="text-lg font-black text-[#0b1c30] mt-1">Add Excess Stock Campaign</h3>
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
              
              {/* Step 1: Mark Excess Stock */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">1. Describe the Excess Stock</h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Product Name</label>
                    <select 
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full"
                    >
                      <option value="Organic Sourdough">Organic Sourdough Bread</option>
                      <option value="Daily Fruit Pastries">Daily Fruit Pastries</option>
                      <option value="Craft IPA Bottles">Craft IPA Bottles</option>
                      <option value="Artisanal Cheddar">Artisanal Cheddar Cheese</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Quantity (Units Available)</label>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Urgency Classification</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['High Priority', 'Expiring Soon', 'Overstocked', 'Seasonal Clearance'].map((u) => (
                        <button
                          key={u}
                          onClick={() => setUrgency(u)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                            urgency === u 
                              ? 'border-[#ff6900] bg-orange-50 text-[#a14000]' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Set Discount */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">2. Set Pricing & Discount</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'percent', label: 'Percent Off', icon: <Percent className="w-4 h-4" /> },
                      { type: 'fixed', label: 'Fixed Price', icon: <Percent className="w-4 h-4" /> },
                      { type: 'bogo', label: 'Buy One Get One (BOGO)', icon: <Percent className="w-4 h-4" /> }
                    ].map((d) => (
                      <button
                        key={d.type}
                        onClick={() => setDiscountType(d.type as any)}
                        className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold text-center transition-all ${
                          discountType === d.type 
                            ? 'border-[#ff6900] bg-orange-50 text-[#a14000]' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {d.icon}
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {discountType === 'percent' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Percentage Discount (%)</label>
                      <input 
                        type="number" 
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full"
                      />
                    </div>
                  )}

                  {discountType === 'fixed' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Fixed Clearance Price (£)</label>
                      <input 
                        type="number" 
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full"
                      />
                    </div>
                  )}

                  {discountType === 'bogo' && (
                    <div className="p-4 bg-orange-50/50 border border-[#e2bfb0]/20 rounded-2xl text-xs text-[#5a4136] leading-relaxed">
                      <strong>BOGO Promotion Active</strong>: Customers who buy one {selectedProduct} will receive a second free. Ideal for bakeries and highly overstocked catalog lots.
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Select Visibility */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">3. Distribution Visibility</h4>
                  <p className="text-xs text-[#5a4136]">Where should this clearance offer be posted? Select all channels:</p>
                  <div className="space-y-3">
                    {[
                      { id: 'storefront', label: 'Direct Storefront Listing', desc: 'Render on your profile page' },
                      { id: 'nearby', label: 'Nearby Customers feed', desc: 'Radius check-in alert notifications' },
                      { id: 'borough', label: 'Borough-wide campaign', desc: 'Display on the district-wide catalog board' },
                      { id: 'rotator', label: 'High Street feed rotator', desc: 'Premium pinned slots on the homepage' }
                    ].map((ch) => {
                      const isChecked = channels.includes(ch.id);
                      return (
                        <div 
                          key={ch.id}
                          onClick={() => toggleChannel(ch.id)}
                          className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isChecked ? 'border-[#ff6900] bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#0b1c30] block">{ch.label}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">{ch.desc}</span>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#ff6900] border-transparent text-white' : 'border-gray-300'
                          }`}>
                            {isChecked && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Add Engagement Options */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">4. Engagement & Rewards</h4>
                  <p className="text-xs text-[#5a4136]">Drive repeat behavior by adding interactive benefits to redemptions:</p>
                  <div className="space-y-3">
                    {[
                      { id: 'points', label: 'Double Loyalty Points bonus', desc: 'Reward customers with multiplier points' },
                      { id: 'gamification', label: 'Gamification Challenge Entry', desc: 'Enter customer into high street spin-wheels' },
                      { id: 'qr', label: 'Generate Counter poster scan QR', desc: 'Print-ready vector codes for counters' }
                    ].map((rw) => {
                      const isChecked = rewards.includes(rw.id);
                      return (
                        <div 
                          key={rw.id}
                          onClick={() => toggleReward(rw.id)}
                          className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isChecked ? 'border-[#ff6900] bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#0b1c30] block">{rw.label}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">{rw.desc}</span>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#ff6900] border-transparent text-white' : 'border-gray-300'
                          }`}>
                            {isChecked && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Preview Offer */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">5. Campaign Live Preview</h4>
                  
                  {/* Smartphone preview mockup */}
                  <div className="bg-slate-900 rounded-3xl p-4 text-white max-w-xs mx-auto border-8 border-slate-800 shadow-lg space-y-4">
                    <div className="flex justify-between items-center text-[10px] opacity-65">
                      <span>12:30 PM</span>
                      <span>McomMall notification</span>
                    </div>
                    {/* Mock push card */}
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-300">
                        <ShoppingBag className="w-3 h-3" />
                        <span>EXCESS CLEARANCE</span>
                      </div>
                      <h5 className="font-bold text-xs">Clearance: {selectedProduct}</h5>
                      <p className="text-[10px] opacity-75 leading-relaxed">
                        {discountType === 'percent' ? `${discountValue}% OFF` : discountType === 'fixed' ? `Only £${discountValue}` : 'Buy 1 Get 1 Free'} today! Expires in 4 hours.
                      </p>
                    </div>
                    <div className="text-center text-[9px] text-white/50">Swipe to claim slot & activate directions</div>
                  </div>
                </div>
              )}

              {/* Step 6: Activate Campaign */}
              {wizardStep === 6 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-[#ff6900] flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-[#a14000]">Flow Chart Validated</h4>
                    <p className="text-xs text-[#5a4136] max-w-sm mx-auto">
                      All criteria checked. Once launched, this campaign automatically targets nearby zones.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border rounded-2xl text-left space-y-1.5 text-xs text-[#5a4136]">
                    <div>• <strong>Product</strong>: {selectedProduct} ({quantity} units)</div>
                    <div>• <strong>Discount</strong>: {discountType === 'percent' ? `${discountValue}% Off` : discountType === 'fixed' ? `£${discountValue} Fixed` : 'BOGO'}</div>
                    <div>• <strong>Channels</strong>: {channels.join(', ')}</div>
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
              {wizardStep < 6 ? (
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
                  Activate Campaign
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
