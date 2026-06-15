'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  ChevronRight,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Bolt,
  CalendarDays,
  Sparkles,
  UserCheck,
  MapPin,
  Users,
  Eye,
  Gift,
  ChevronsUpDown,
  Check,
  Clock,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAddPromotion } from '@/service/promotions/hook';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type PromotionTypeKey = 'flash_deal' | 'daily_deal' | 'weekend_offer' | 'loyalty_offer' | 'borough_campaign' | 'new_customer_offer';

interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  promotionType: 'MULTIPLIER' | 'BONUS_POINTS';
  value: number;
  minimumSpend: number;
  limitPerCustomer: number;
}

const templatesByType: Record<PromotionTypeKey, PresetTemplate[]> = {
  flash_deal: [
    { id: 'f1', name: 'Lightning inventory clearout', description: 'High multiplier point rate for a brief duration.', promotionType: 'MULTIPLIER', value: 3.5, minimumSpend: 15, limitPerCustomer: 1 },
    { id: 'f2', name: 'Quick 2-hour shopping boost', description: 'Bonus points reward to generate immediate foot traffic.', promotionType: 'BONUS_POINTS', value: 250, minimumSpend: 10, limitPerCustomer: 1 }
  ],
  daily_deal: [
    { id: 'd1', name: 'Midweek Trim Deal', description: 'Daily point reward to attract regular routine visitors.', promotionType: 'BONUS_POINTS', value: 100, minimumSpend: 20, limitPerCustomer: 2 },
    { id: 'd2', name: 'Early Bird Special multiplier', description: 'Double reward rate during low-traffic morning slots.', promotionType: 'MULTIPLIER', value: 2.0, minimumSpend: 15, limitPerCustomer: 1 }
  ],
  weekend_offer: [
    { id: 'w1', name: 'Weekend VIP Cuts', description: 'Triple points multiplier during peak Saturday hours.', promotionType: 'MULTIPLIER', value: 3.0, minimumSpend: 40, limitPerCustomer: 1 },
    { id: 'w2', name: 'Saturday Storefront Boost', description: 'Premium bonus reward for weekend shoppers.', promotionType: 'BONUS_POINTS', value: 300, minimumSpend: 25, limitPerCustomer: 2 }
  ],
  loyalty_offer: [
    { id: 'l1', name: 'Bring a Friend Offer', description: 'Reward regular loyalty members when they bring visitors.', promotionType: 'BONUS_POINTS', value: 200, minimumSpend: 30, limitPerCustomer: 3 },
    { id: 'l2', name: 'Regulars Appreciation booster', description: 'Double point multiplier for verified loyal members.', promotionType: 'MULTIPLIER', value: 2.0, minimumSpend: 10, limitPerCustomer: 5 }
  ],
  borough_campaign: [
    { id: 'b1', name: 'West End Collective Deal', description: 'Participate in borough-wide promotions with high visibility.', promotionType: 'MULTIPLIER', value: 2.5, minimumSpend: 20, limitPerCustomer: 2 },
    { id: 'b2', name: 'District Local Day reward', description: 'Flat bonus points reward for neighborhood residents.', promotionType: 'BONUS_POINTS', value: 150, minimumSpend: 15, limitPerCustomer: 1 }
  ],
  new_customer_offer: [
    { id: 'n1', name: 'First-Time Welcome bonus', description: 'Aggressive point incentives to convert first-time visitors.', promotionType: 'BONUS_POINTS', value: 500, minimumSpend: 10, limitPerCustomer: 1 },
    { id: 'n2', name: 'New Client special multiplier', description: 'Double points to secure second and third visits.', promotionType: 'MULTIPLIER', value: 2.0, minimumSpend: 20, limitPerCustomer: 2 }
  ]
};

export default function PromotionForm() {
  const router = useRouter();
  const createPromotion = useAddPromotion();

  const [step, setStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<PromotionTypeKey | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [promotionType, setPromotionType] = useState<'MULTIPLIER' | 'BONUS_POINTS'>('MULTIPLIER');
  const [multiplier, setMultiplier] = useState('2');
  const [bonusPoints, setBonusPoints] = useState('100');
  const [minimumSpend, setMinimumSpend] = useState('10');
  const [limitPerCustomer, setLimitPerCustomer] = useState('1');
  const [beginDate, setBeginDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)); // 30 days ahead

  // Custom PRD Marketing parameters
  const [boroughVisibility, setBoroughVisibility] = useState(false);
  const [highStreetVisibility, setHighStreetVisibility] = useState(false);
  const [featuredPlacement, setFeaturedPlacement] = useState(false);
  const [targetSegment, setTargetSegment] = useState<'all' | 'nearby' | 'loyalty' | 'borough' | 'returning'>('all');
  const [addExtraGift, setAddExtraGift] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; value?: string; minimumSpend?: string }>({});

  const handleTypeSelect = (type: PromotionTypeKey) => {
    setSelectedType(type);
    setSelectedTemplateId(null);
    setStep(2);
  };

  const handleTemplateSelect = (template: PresetTemplate) => {
    setSelectedTemplateId(template.id);
    setName(template.name);
    setPromotionType(template.promotionType);
    if (template.promotionType === 'MULTIPLIER') {
      setMultiplier(template.value.toString());
    } else {
      setBonusPoints(template.value.toString());
    }
    setMinimumSpend(template.minimumSpend.toString());
    setLimitPerCustomer(template.limitPerCustomer.toString());
    
    // Automatically apply borough target if Borough Campaign is chosen
    if (selectedType === 'borough_campaign') {
      setBoroughVisibility(true);
      setTargetSegment('borough');
    } else {
      setBoroughVisibility(false);
      setTargetSegment('all');
    }

    setStep(3);
  };

  const handleNextStep = () => {
    if (step === 3) {
      if (!name.trim()) {
        setErrors({ name: 'Promotion Title is required.' });
        return;
      }
      setErrors({});
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    // Pack advanced metadata into description JSON string to fit API schema
    const packedDescription = JSON.stringify({
      uiDescription: description,
      promoType: selectedType,
      targetSegment,
      boroughVisibility,
      highStreetVisibility,
      featuredPlacement,
      addExtraGift
    });

    try {
      await createPromotion.mutateAsync({
        name,
        description: packedDescription,
        termsAndConditions,
        isActive: true,
        beginDate,
        endDate,
        promotionType,
        promotionScope: 'ALL_LISTINGS',
        multiplier: promotionType === 'MULTIPLIER' ? parseFloat(multiplier) : undefined,
        bonusPoints: promotionType === 'BONUS_POINTS' ? parseInt(bonusPoints, 10) : undefined,
        limitPerCustomer: limitPerCustomer ? parseInt(limitPerCustomer, 10) : undefined,
        minimumSpend: parseFloat(minimumSpend) || 0,
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to create promotion:', error);
      toast.error('Failed to create campaign. Please try again.');
    }
  };

  return (
    <div className="promotions-dashboard w-full min-w-0 max-w-full bg-background text-on-surface font-body-md min-h-screen p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background ambient decorative orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="w-full max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Compact Progress Slider Card */}
        <div className="w-full bg-white dark:bg-[#291e15] rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200/60 dark:border-[#4a3b2f]">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => {
                    if (step > 1) handlePrevStep();
                    else router.push('/dashboard/promotions');
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="text-gray-900 dark:text-white text-sm font-black truncate">
                  {
                    {
                      1: 'Select Campaign Type',
                      2: 'Choose Preset Template',
                      3: 'Customize Details',
                      4: 'Select Target Segment',
                      5: 'Rewards & Perks',
                      6: 'Preview & Launch'
                    }[step as 1|2|3|4|5|6] || 'Create Promotion'
                  }
                </span>
              </div>
              <span className="text-orange-600 text-[10px] sm:text-xs font-black uppercase tracking-wider self-start sm:self-center pl-9 sm:pl-0">
                Step {step} of 6
              </span>
            </div>

            {/* Slider / Progress Bar */}
            <div className="relative w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-300" 
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>

            {/* Step name labels for desktop */}
            <div className="hidden md:flex justify-between text-[11px] font-bold text-gray-400 mt-1">
              <div className={step === 1 ? 'text-orange-500' : ''}>1. Type</div>
              <div className={step === 2 ? 'text-orange-500' : ''}>2. Preset</div>
              <div className={step === 3 ? 'text-orange-500' : ''}>3. Details</div>
              <div className={step === 4 ? 'text-orange-500' : ''}>4. Target</div>
              <div className={step === 5 ? 'text-orange-500' : ''}>5. Rewards</div>
              <div className={step === 6 ? 'text-orange-500' : ''}>6. Preview</div>
            </div>
          </div>
        </div>

        {/* Dynamic Wizard Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 1: Select Type */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="p-4 bg-orange-50 dark:bg-[#3d2414] rounded-2xl border border-orange-100 dark:border-orange-950/20 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">
                    Select one of our campaign preset templates below to launch a structured promotion in minutes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Flash Deal */}
                  <button onClick={() => handleTypeSelect('flash_deal')} className="group flex flex-col text-left p-8 bg-white border border-outline-variant rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-105">
                      <Bolt className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Flash Deal</h3>
                    <p className="text-xs text-on-surface-variant mb-6 flex-grow leading-relaxed">
                      High-urgency, short-term multiplier campaigns designed to clear inventory or fill quiet slots.
                    </p>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">High Urgency</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* Daily Deal */}
                  <button onClick={() => handleTypeSelect('daily_deal')} className="group flex flex-col text-left p-8 bg-white border border-outline-variant rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-105">
                      <CalendarDays className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Daily Deal</h3>
                    <p className="text-xs text-on-surface-variant mb-6 flex-grow leading-relaxed">
                      A recurring daily campaign template designed to build routine shopping habits and consistent storefront checkins.
                    </p>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Consistency</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* Weekend Offer */}
                  <button onClick={() => handleTypeSelect('weekend_offer')} className="group flex flex-col text-left p-8 bg-white border border-outline-variant rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-105">
                      <Clock className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Weekend Offer</h3>
                    <p className="text-xs text-on-surface-variant mb-6 flex-grow leading-relaxed">
                      Optimized settings to capture high weekend traffic and maximize checkout value from Friday to Sunday.
                    </p>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Peak Traffic</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* Loyalty Offer */}
                  <button onClick={() => handleTypeSelect('loyalty_offer')} className="group flex flex-col text-left p-8 bg-white border border-outline-variant rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-105">
                      <UserCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Loyalty Offer</h3>
                    <p className="text-xs text-on-surface-variant mb-6 flex-grow leading-relaxed">
                      Exclusive rewards and multiplied benefits locked specifically for return customers.
                    </p>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Retention</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* Borough Campaign */}
                  <button onClick={() => handleTypeSelect('borough_campaign')} className="group flex flex-col text-left p-8 bg-white border border-primary/20 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-350 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">Popular</div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-105">
                      <MapPin className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Borough Campaign</h3>
                    <p className="text-xs text-on-surface-variant mb-6 flex-grow leading-relaxed">
                      Participate in shared, collective neighborhood sales that target residents in specific districts.
                    </p>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Hyper-Local</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* New Customer Offer */}
                  <button onClick={() => handleTypeSelect('new_customer_offer')} className="group flex flex-col text-left p-8 bg-white border border-outline-variant rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-105">
                      <Users className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">New Customer Offer</h3>
                    <p className="text-xs text-on-surface-variant mb-6 flex-grow leading-relaxed">
                      Higher welcome bonuses to encourage neighboring shoppers to try your storefront.
                    </p>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Growth</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </div>

                <div className="mt-12 p-8 bg-slate-50 border border-outline-variant/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="hidden sm:flex w-16 h-16 rounded-full bg-white items-center justify-center shadow-sm text-primary flex-shrink-0">
                      <HelpCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-base">Can&apos;t find what you need?</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Our campaign support specialists can help you design a customized set-and-forget promotion.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full px-6 py-2 border-primary text-primary hover:bg-primary/5 font-bold whitespace-nowrap text-xs">
                    Contact Support
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Choose Preset Template */}
            {step === 2 && selectedType && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Select a Campaign Preset Template</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Select a pre-designed configuration below to save time. You can edit any details on the next step.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templatesByType[selectedType]?.map((tmpl) => (
                    <Card key={tmpl.id} className="border border-outline-variant rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-on-surface text-base">{tmpl.name}</h4>
                            <Badge variant="outline" className="bg-orange-50 text-primary text-[10px] font-extrabold uppercase border-none py-0.5 px-2">
                              {tmpl.promotionType === 'MULTIPLIER' ? 'Multiplier' : 'Points Bonus'}
                            </Badge>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                            {tmpl.description}
                          </p>
                          <div className="bg-slate-50 p-4 rounded-xl space-y-2 mt-4 border border-outline-variant/10 text-xs text-on-surface-variant">
                            <div className="flex justify-between">
                              <span>Value:</span>
                              <span className="font-bold text-on-surface">
                                {tmpl.promotionType === 'MULTIPLIER' ? `${tmpl.value}x Points` : `+${tmpl.value} Bonus Points`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Min Spend:</span>
                              <span className="font-bold text-on-surface">${tmpl.minimumSpend}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Limit:</span>
                              <span className="font-bold text-on-surface">{tmpl.limitPerCustomer} use(s) per shopper</span>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => handleTemplateSelect(tmpl)} className="mt-6 w-full bg-primary hover:bg-primary/95 text-white rounded-full py-2 font-bold text-xs">
                          Apply Template Preset
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Customize Campaign */}
            {step === 3 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Customize Promotion Details</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Configure baseline values, dates, and local placements.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-xs font-bold">Promotion Title</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Midweek Trim Deal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border-outline-variant"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-xs font-bold">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Short summary displayed to shoppers..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-outline-variant min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold">Campaign Reward Structure</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setPromotionType('MULTIPLIER')}
                          variant={promotionType === 'MULTIPLIER' ? 'default' : 'outline'}
                          className="flex-1 rounded-xl py-2"
                        >
                          Multiplier
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setPromotionType('BONUS_POINTS')}
                          variant={promotionType === 'BONUS_POINTS' ? 'default' : 'outline'}
                          className="flex-1 rounded-xl py-2"
                        >
                          Bonus Points
                        </Button>
                      </div>
                    </div>

                    {promotionType === 'MULTIPLIER' ? (
                      <div className="grid gap-2">
                        <Label htmlFor="multiplier" className="text-xs font-bold">Multiplier (e.g. 2 for 2x points)</Label>
                        <Input
                          id="multiplier"
                          type="number"
                          step="0.1"
                          value={multiplier}
                          onChange={(e) => setMultiplier(e.target.value)}
                          className="rounded-xl border-outline-variant"
                        />
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label htmlFor="bonusPoints" className="text-xs font-bold">Bonus Points (e.g. 150)</Label>
                        <Input
                          id="bonusPoints"
                          type="number"
                          value={bonusPoints}
                          onChange={(e) => setBonusPoints(e.target.value)}
                          className="rounded-xl border-outline-variant"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="grid gap-2">
                      <Label htmlFor="minimumSpend" className="text-xs font-bold">Minimum Spend ($)</Label>
                      <Input
                        id="minimumSpend"
                        type="number"
                        value={minimumSpend}
                        onChange={(e) => setMinimumSpend(e.target.value)}
                        className="rounded-xl border-outline-variant"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="limitPerCustomer" className="text-xs font-bold">Usage Limit per Customer</Label>
                      <Input
                        id="limitPerCustomer"
                        type="number"
                        value={limitPerCustomer}
                        onChange={(e) => setLimitPerCustomer(e.target.value)}
                        className="rounded-xl border-outline-variant"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold">Begin Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl border-outline-variant">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {beginDate ? format(beginDate, 'PPP') : <span>Pick start date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={beginDate} onSelect={setBeginDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl border-outline-variant">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'PPP') : <span>Pick end date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* PRD Visibility Placements block */}
                  <div className="pt-4 border-t border-outline-variant/20 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">Borough &amp; High Street Placement Settings</h4>
                    
                    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-outline-variant/10">
                      <div>
                        <Label htmlFor="boroughVisibility" className="font-bold text-xs cursor-pointer">Local Borough Visibility</Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Broadcast this promotion on your main borough feed to nearby shoppers.</p>
                      </div>
                      <Switch id="boroughVisibility" checked={boroughVisibility} onCheckedChange={setBoroughVisibility} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-outline-variant/10">
                      <div>
                        <Label htmlFor="highStreetVisibility" className="font-bold text-xs cursor-pointer">High Street Rotator placement</Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Feature this promotion in the high street rotator display carousel.</p>
                      </div>
                      <Switch id="highStreetVisibility" checked={highStreetVisibility} onCheckedChange={setHighStreetVisibility} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-outline-variant/10">
                      <div>
                        <Label htmlFor="featuredPlacement" className="font-bold text-xs cursor-pointer">Admin Featured Spot</Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Submit to admin for priority promotion carousel placement.</p>
                      </div>
                      <Switch id="featuredPlacement" checked={featuredPlacement} onCheckedChange={setFeaturedPlacement} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleNextStep} className="w-full bg-primary hover:bg-primary/95 text-white rounded-full py-3 font-bold mt-4">
                  Proceed to Targeting
                </Button>
              </div>
            )}

            {/* STEP 4: Target Segment */}
            {step === 4 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Select Target Customer Segment</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Determine which shoppers will receive push notifications and see this deal.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'all', title: 'All customers', desc: 'Broadcast to all active shoppers in the platform directory.' },
                    { id: 'nearby', title: 'Nearby customers', desc: 'Target shoppers within 1 mile of your storefront location.' },
                    { id: 'loyalty', title: 'Loyalty members', desc: 'Restrict this promotion specifically to your enrolled loyalty program members.' },
                    { id: 'borough', title: 'Borough users', desc: 'Broadcast exclusively to registered residents of your local district.' },
                    { id: 'returning', title: 'Returning customers', desc: 'Target shoppers who have made at least 1 purchase at your shop in the last 60 days.' }
                  ].map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setTargetSegment(target.id as any)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-start ${
                        targetSegment === target.id
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant/30 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">{target.title}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{target.desc}</p>
                      </div>
                      {targetSegment === target.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <Button onClick={handleNextStep} className="w-full bg-primary hover:bg-primary/95 text-white rounded-full py-3 font-bold mt-4">
                  Add Rewards &amp; Perks
                </Button>
              </div>
            )}

            {/* STEP 5: Add Rewards */}
            {step === 5 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Additional Rewards &amp; Perks</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Inject dynamic rewards to drive high-street engagement (optional).</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-outline-variant/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <Label htmlFor="addExtraGift" className="font-bold text-sm cursor-pointer">Add Loyalty Voucher bonus</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Unlock a discount coupon voucher automatically upon redeeming this point campaign.</p>
                      </div>
                    </div>
                    <Switch id="addExtraGift" checked={addExtraGift} onCheckedChange={setAddExtraGift} />
                  </div>
                </div>

                <Button onClick={handleNextStep} className="w-full bg-primary hover:bg-primary/95 text-white rounded-full py-3 font-bold mt-4">
                  Proceed to Lockscreen Preview
                </Button>
              </div>
            )}

            {/* STEP 6: Lockscreen Push Notification Preview */}
            {step === 6 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Interactive Mobile Preview</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Review how this campaign renders on your customer&apos;s push feed.</p>
                </div>

                {/* Simulated Phone UI */}
                <div className="flex justify-center py-4 bg-slate-50 rounded-2xl border border-outline-variant/10">
                  <div className="w-[300px] h-[520px] rounded-[40px] bg-slate-900 border-8 border-slate-800 shadow-2xl overflow-hidden relative flex flex-col justify-between p-4 text-white font-sans">
                    
                    {/* Status bar */}
                    <div className="flex justify-between items-center text-[10px] opacity-80 px-2 pt-1">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span>5G</span>
                        <div className="w-5 h-2.5 border border-white rounded-sm" />
                      </div>
                    </div>

                    {/* Notification lockscreen popup */}
                    <div className="flex-1 flex flex-col justify-start pt-16">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 space-y-2 border border-white/10 premium-shadow">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center text-white text-[8px] font-bold">M</div>
                            <span className="text-[11px] font-extrabold tracking-tight">MCOM MALL</span>
                          </div>
                          <span className="text-[9px] opacity-60">now</span>
                        </div>
                        <h4 className="font-bold text-[13px] tracking-tight text-white">{name || 'Summer Boost Special'}</h4>
                        <p className="text-[11px] opacity-80 leading-relaxed text-slate-100">
                          {description || 'Redeem points and get exclusive perks near High Street boutique locations.'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom slider */}
                    <div className="pb-4 text-center">
                      <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mb-2" />
                      <p className="text-[9px] opacity-60">Swipe up to view store offer</p>
                    </div>

                  </div>
                </div>

                <Button onClick={handleSubmit} disabled={createPromotion.isPending} className="w-full bg-primary hover:bg-primary/95 text-white rounded-full py-3 font-bold mt-4 flex justify-center items-center gap-2">
                  {createPromotion.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Launching Campaign...
                    </>
                  ) : (
                    <>
                      Launch Campaign <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* Success Dialog Modal */}
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader className="space-y-4 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              <CheckCircle className="h-8 w-8" />
            </motion.div>
            <DialogTitle className="text-center font-bold text-xl">
              Campaign Launched!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-on-surface-variant leading-relaxed">
              Your new promotion has been broadcasted successfully to your target segment. It will appear on local high street rotators.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => router.push('/dashboard/promotions')}
              className="w-full bg-primary hover:bg-primary/95 text-white rounded-full py-2 font-bold text-xs"
            >
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
