'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ChevronRight,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Eye,
  Gift,
  Loader2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetPromotionById, useUpdatePromotion } from '@/service/promotions/hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';

type PromotionTypeKey = 'flash_deal' | 'daily_deal' | 'weekend_offer' | 'loyalty_offer' | 'borough_campaign' | 'new_customer_offer';

export default function PromotionEditForm() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.id as string;

  const { data: promotion, isLoading: isLoadingPromotion, error: loadError } = useGetPromotionById(promotionId);
  const updatePromotion = useUpdatePromotion();

  // Wizard state (starts at 3 for editing since type is already set)
  const [step, setStep] = useState<number>(3);
  const [selectedType, setSelectedType] = useState<PromotionTypeKey | null>('flash_deal');

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
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Custom PRD Marketing parameters
  const [boroughVisibility, setBoroughVisibility] = useState(false);
  const [highStreetVisibility, setHighStreetVisibility] = useState(false);
  const [featuredPlacement, setFeaturedPlacement] = useState(false);
  const [targetSegment, setTargetSegment] = useState<'all' | 'nearby' | 'loyalty' | 'borough' | 'returning'>('all');
  const [addExtraGift, setAddExtraGift] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; value?: string; minimumSpend?: string }>({});

  // Populate data when loaded
  useEffect(() => {
    if (promotion) {
      setName(promotion.name || '');
      setTermsAndConditions(promotion.termsAndConditions || '');
      setPromotionType(promotion.promotionType);
      if (promotion.promotionType === 'MULTIPLIER') {
        setMultiplier(promotion.multiplier?.toString() || '2');
      } else {
        setBonusPoints(promotion.bonusPoints?.toString() || '100');
      }
      setMinimumSpend(promotion.minimumSpend.toString());
      setLimitPerCustomer(promotion.limitPerCustomer?.toString() || '1');
      setBeginDate(promotion.beginDate ? new Date(promotion.beginDate) : undefined);
      setEndDate(promotion.endDate ? new Date(promotion.endDate) : undefined);

      // Parse metadata if present in description
      if (promotion.description) {
        try {
          if (promotion.description.startsWith('{')) {
            const meta = JSON.parse(promotion.description);
            setDescription(meta.uiDescription || '');
            setSelectedType(meta.promoType || 'flash_deal');
            setTargetSegment(meta.targetSegment || 'all');
            setBoroughVisibility(meta.boroughVisibility || false);
            setHighStreetVisibility(meta.highStreetVisibility || false);
            setFeaturedPlacement(meta.featuredPlacement || false);
            setAddExtraGift(meta.addExtraGift || false);
          } else {
            setDescription(promotion.description);
          }
        } catch (e) {
          setDescription(promotion.description);
        }
      }
    }
  }, [promotion]);

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
    // Pack advanced metadata into description JSON string
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
      await updatePromotion.mutateAsync({
        id: promotionId,
        name,
        description: packedDescription,
        termsAndConditions,
        isActive: promotion?.isActive ?? true,
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
      console.error('Failed to update promotion:', error);
      toast.error('Failed to update campaign. Please try again.');
    }
  };

  if (isLoadingPromotion) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading Campaign Data...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-500 bg-red-50/25 rounded-2xl p-8 border border-red-100">
        <p className="font-bold text-lg">Failed to load campaign details</p>
        <p className="text-sm mt-1">{loadError.message}</p>
        <Button onClick={() => router.push('/dashboard/promotions')} className="mt-4 bg-primary text-white">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="promotions-dashboard w-full min-w-0 max-w-full bg-background text-on-surface font-body-md min-h-screen p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background ambient decorative orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="w-full max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Breadcrumbs & Back arrow */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-on-surface-variant mb-2 text-xs font-semibold">
              <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/dashboard/promotions')}>Promotions</span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-primary font-bold">Edit Campaign</span>
              {step > 3 && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-500 font-normal">Step {step - 2} of 4</span>
                </>
              )}
            </nav>
            <h2 className="text-3xl font-bold text-on-surface tracking-tight">Edit Promotion</h2>
          </div>
          {step > 3 && (
            <Button variant="ghost" onClick={handlePrevStep} className="self-start md:self-auto rounded-full px-4 border border-outline-variant/30 hover:bg-slate-100 flex items-center gap-2 text-xs font-bold">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
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

                  {/* Placements block */}
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

            {/* STEP 6: Lockscreen Push Preview */}
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

                <Button onClick={handleSubmit} disabled={updatePromotion.isPending} className="w-full bg-primary hover:bg-primary/95 text-white rounded-full py-3 font-bold mt-4 flex justify-center items-center gap-2">
                  {updatePromotion.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      Save Changes &amp; Update <CheckCircle className="h-4 w-4" />
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
              Campaign Updated!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-on-surface-variant leading-relaxed">
              Your promotion campaign changes have been saved and updated successfully.
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
