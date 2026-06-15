'use client';

import React, { useState } from 'react';
import { 
    ArrowLeft, 
    Save, 
    X, 
    ShieldCheck, 
    Zap, 
    Globe, 
    Image as ImageIcon, 
    Search, 
    Layout, 
    MapPin, 
    Tag, 
    ExternalLink,
    TrendingUp,
    Info,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StorefrontEditManagementProps {
    store: any;
    onBack: () => void;
    onSave: (updatedStore: any) => void;
}

export const StorefrontEditManagement: React.FC<StorefrontEditManagementProps> = ({ 
    store, 
    onBack, 
    onSave 
}) => {
    const [formData, setFormData] = useState({
        name: store.name || '',
        address: store.address || '42 High Street, North Borough',
        description: store.description || 'Specialty coffee roastery and café specializing in ethically sourced beans and communal workspace environments.',
        categories: store.categories || ['Coffee Shop', 'Specialty Roastery', 'Coworking Space'],
        featured: store.visibility === 'Featured',
        searchBoost: true,
        publicVisibility: true,
        metaTitle: store.metaTitle || `${store.name} | Specialty Roastery North Borough`,
        keywords: store.keywords || 'coffee, roastery, espresso, morning, north borough, artisan...',
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSave({ ...store, ...formData, visibility: formData.featured ? 'Featured' : 'High' });
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onBack}
                            className="rounded-xl hover:bg-slate-100 text-slate-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Storefront Edit Management</h1>
                            <p className="text-xs font-bold text-slate-500">Update your business presence across the MCOM digital ecosystem.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={onBack}
                            className="h-11 px-6 font-black text-slate-600 border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Discard Changes
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-11 px-8 font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Content Forms */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Core Identity */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-3xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Core Identity</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                                        <Input 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="h-12 bg-slate-50/50 border-slate-100 font-bold text-slate-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input 
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                className="h-12 pl-11 bg-slate-50/50 border-slate-100 font-bold text-slate-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                                        <Textarea 
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="min-h-[120px] bg-slate-50/50 border-slate-100 font-bold text-slate-900 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all resize-none p-4"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Categories</label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.categories.map((cat: string) => (
                                                <Badge 
                                                    key={cat} 
                                                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-4 py-1.5 rounded-full font-bold text-xs gap-2 group"
                                                >
                                                    {cat}
                                                    <X className="w-3 h-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Badge>
                                            ))}
                                            <Button variant="outline" size="sm" className="rounded-full border-dashed border-slate-300 text-slate-500 font-bold text-xs px-4 h-8 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                                                + Add Category
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Branding & Media */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-3xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <ImageIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Branding & Media</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Logo</label>
                                        <div className="group relative w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400 hover:bg-blue-50/30">
                                            <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center p-4">
                                                <div className="w-full h-full rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xl">
                                                    {formData.name.substring(0,1)}
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Change</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">Recommended: 512x512px (PNG or WebP)</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Banner</label>
                                        <div className="group relative w-full h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400 hover:bg-blue-50/30">
                                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <ImageIcon className="w-6 h-6" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Upload Banner</p>
                                            </div>
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Upload Image</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">Recommended: 1920x600px High-resolution JPG</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SEO Optimization */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-3xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                        <Search className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">SEO Optimization</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Title</label>
                                        <Input 
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                                            className="h-12 bg-slate-50/50 border-slate-100 font-bold text-slate-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keywords (Search Tags)</label>
                                        <Textarea 
                                            value={formData.keywords}
                                            onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                                            className="min-h-[80px] bg-slate-50/50 border-slate-100 font-bold text-slate-900 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all resize-none p-4"
                                        />
                                    </div>
                                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm h-fit">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Search Insight</p>
                                            <p className="text-xs font-bold text-blue-700 leading-relaxed">
                                                Businesses with more than 8 keywords see a <span className="text-blue-900 underline underline-offset-2 decoration-2">24% increase</span> in discovery during morning peak hours.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Controls & Score */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Visibility Controls */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-3xl">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Visibility Controls</h2>
                                    <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Live</Badge>
                                </div>
                                <p className="text-xs font-bold text-slate-500 mb-8">Configure how your business appears in search results and maps.</p>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-900">Featured Placement</p>
                                            <p className="text-[10px] font-bold text-slate-400">Prioritize showcase results and homepage slots.</p>
                                        </div>
                                        <Switch 
                                            checked={formData.featured}
                                            onCheckedChange={(val) => setFormData({...formData, featured: val})}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-900">Search Algorithm Boost</p>
                                            <p className="text-[10px] font-bold text-slate-400">Apply performance multiplier to search rankings.</p>
                                        </div>
                                        <Switch 
                                            checked={formData.searchBoost}
                                            onCheckedChange={(val) => setFormData({...formData, searchBoost: val})}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-900">Public Map Visibility</p>
                                            <p className="text-[10px] font-bold text-slate-400">Hide from public view during maintenance.</p>
                                        </div>
                                        <Switch 
                                            checked={formData.publicVisibility}
                                            onCheckedChange={(val) => setFormData({...formData, publicVisibility: val})}
                                        />
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-100">
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discovery Score</p>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-4xl font-black text-slate-900">84</span>
                                                <span className="text-lg font-bold text-slate-300">/100</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-emerald-50 rounded-xl">
                                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]" style={{ width: '84%' }} />
                                    </div>
                                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                                            Your score is <span className="text-emerald-600 font-black">Excellent</span>. Complete your branding to reach 95+.
                                        </p>
                                    </div>
                                </div>

                                <Button className="w-full mt-8 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-xl transition-all active:scale-95">
                                    Preview Live Storefront <ExternalLink className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Helper Box */}
                        <div className="p-8 bg-orange-600 rounded-3xl shadow-xl shadow-orange-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <Zap className="w-24 h-24 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-white leading-tight mb-3">Optimize for <br />Local Search</h3>
                                <p className="text-xs font-bold text-orange-100 leading-relaxed mb-6 opacity-90">
                                    Ensure your address and category match your physical storefront to improve map ranking accuracy.
                                </p>
                                <Button className="bg-white text-orange-600 hover:bg-orange-50 font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl shadow-lg border-none">
                                    Read SEO Guide
                                </Button>
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div className="flex items-center justify-center gap-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Changes Auto-saved</p>
                            </div>
                            <div className="h-4 w-px bg-slate-200" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update: 2m ago</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
