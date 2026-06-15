'use client';

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    User, 
    Building2, 
    Mail, 
    Phone, 
    MapPin, 
    Tag, 
    ShieldCheck, 
    ChevronRight, 
    ChevronLeft,
    CheckCircle2,
    Store,
    Rocket,
    Crown,
    Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MerchantOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: any) => void;
}

const steps = [
    { id: 'account', title: 'Merchant Account', icon: User },
    { id: 'business', title: 'Business Profile', icon: Building2 },
    { id: 'plan', title: 'Tier Selection', icon: Rocket },
];

const tiers = [
    { 
        id: 'Bronze', 
        name: 'Starter', 
        price: '£0', 
        icon: Star, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50',
        features: ['Basic Listing', 'Standard Support', 'Standard Discovery']
    },
    { 
        id: 'Silver', 
        name: 'Professional', 
        price: '£29', 
        icon: ShieldCheck, 
        color: 'text-slate-600', 
        bg: 'bg-slate-100',
        features: ['Priority Listing', 'Analytics Access', 'Verified Badge']
    },
    { 
        id: 'Gold', 
        name: 'Enterprise', 
        price: '£99', 
        icon: Crown, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        features: ['Premium Placement', 'Featured Slots', 'Dedicated Account Manager']
    }
];

export const MerchantOnboardingModal: React.FC<MerchantOnboardingModalProps> = ({
    isOpen,
    onClose,
    onComplete
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        merchantName: '',
        email: '',
        phone: '',
        businessName: '',
        category: '',
        borough: '',
        tier: 'Bronze'
    });

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(formData);
            onClose();
            // Reset for next time
            setTimeout(() => {
                setCurrentStep(0);
                setFormData({
                    merchantName: '',
                    email: '',
                    phone: '',
                    businessName: '',
                    category: '',
                    borough: '',
                    tier: 'Bronze'
                });
            }, 300);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = () => {
        if (currentStep === 0) return formData.merchantName && formData.email && formData.phone;
        if (currentStep === 1) return formData.businessName && formData.category && formData.borough;
        return true;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                {/* Header with Progress */}
                <div className="bg-slate-900 px-8 py-10 relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Rocket className="w-24 h-24 text-white" />
                    </div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-white tracking-tight">Onboard New Merchant</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold text-sm">
                            Configure a new business entity for the MCOM ecosystem.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mt-8 relative z-10">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx === currentStep;
                            const isCompleted = idx < currentStep;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center gap-2 group cursor-default">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                            isActive ? "bg-orange-600 text-white shadow-lg shadow-orange-900/40" : 
                                            isCompleted ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest transition-colors",
                                            isActive ? "text-orange-500" : "text-slate-600"
                                        )}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 mt-[-18px] transition-colors",
                                            idx < currentStep ? "bg-emerald-500" : "bg-slate-800"
                                        )} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 bg-white min-h-[400px]">
                    {/* Step 1: Account */}
                    {currentStep === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant Owner Name</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        placeholder="Full legal name"
                                        className="h-12 pl-11 bg-slate-50 border-slate-100 font-bold rounded-xl focus:bg-white transition-all"
                                        value={formData.merchantName}
                                        onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        type="email"
                                        placeholder="merchant@example.com"
                                        className="h-12 pl-11 bg-slate-50 border-slate-100 font-bold rounded-xl focus:bg-white transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        placeholder="+44 20 7946 0000"
                                        className="h-12 pl-11 bg-slate-50 border-slate-100 font-bold rounded-xl focus:bg-white transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Business */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Business Name</Label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        placeholder="e.g. Camden Coffee Roasters"
                                        className="h-12 pl-11 bg-slate-50 border-slate-100 font-bold rounded-xl focus:bg-white transition-all"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marketplace Category</Label>
                                    <Select 
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({...formData, category: val})}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-50 border-slate-100 font-bold rounded-xl focus:bg-white transition-all">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 font-bold">
                                            <SelectItem value="Retail">Retail</SelectItem>
                                            <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                                            <SelectItem value="Services">Services</SelectItem>
                                            <SelectItem value="Hospitality">Hospitality</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Borough</Label>
                                    <Select 
                                        value={formData.borough}
                                        onValueChange={(val) => setFormData({...formData, borough: val})}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-50 border-slate-100 font-bold rounded-xl focus:bg-white transition-all">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 font-bold">
                                            <SelectItem value="Camden">Camden</SelectItem>
                                            <SelectItem value="Westminster">Westminster</SelectItem>
                                            <SelectItem value="Hackney">Hackney</SelectItem>
                                            <SelectItem value="Greenwich">Greenwich</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Plan */}
                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            {tiers.map((tier) => (
                                <div 
                                    key={tier.id}
                                    onClick={() => setFormData({...formData, tier: tier.id})}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                                        formData.tier === tier.id 
                                            ? "bg-slate-50 border-slate-900 shadow-lg" 
                                            : "bg-white border-slate-100 hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", tier.bg, tier.color)}>
                                                <tier.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{tier.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{tier.price} / Month</p>
                                            </div>
                                        </div>
                                        {formData.tier === tier.id && (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {tier.features.map(f => (
                                            <Badge key={f} variant="secondary" className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0">
                                                {f}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex-row items-center justify-between sm:justify-between">
                    <Button 
                        variant="ghost" 
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl px-6 h-11 disabled:opacity-30"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-8 h-11 shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {currentStep === steps.length - 1 ? 'Complete Onboarding' : 'Next Step'} <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
