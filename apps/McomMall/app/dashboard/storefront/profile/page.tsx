'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserListings, useEditListing } from '@/service/listings/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building2, Save, ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';
import { DESCRIPTION_PRESETS, getDefaultPresets } from './components/DescriptionPresets';
import { uploadFile } from '@/lib/upload';

const PlatformIcons: Record<string, string> = {
  instagram: '📸',
  facebook: '👥',
  twitter: '🐦',
  youtube: '📺',
  linkedin: '👔',
};

const BusinessProfilePage: React.FC = () => {
  const router = useRouter();
  const { data: listingsData, isLoading } = useGetUserListings(1, 1);
  const listing = listingsData?.data?.[0];
  const { mutateAsync: editListing, isPending: isSaving } = useEditListing();

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [about, setAbout] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [website, setWebsite] = useState('');
  
  // Hours State
  const [hours, setHours] = useState<any[]>([]);

  // Social Links State
  const [socials, setSocials] = useState<{ platform: string; url: string }[]>([]);

  // Images
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Load listing data
  useEffect(() => {
    if (listing) {
      setBusinessName(listing.businessName || '');
      setLegalName(listing.legalName || '');
      setShortDescription(listing.shortDescription || '');
      setAbout(listing.about || '');
      setBusinessPhone(listing.businessPhone || '');
      setBusinessEmail(listing.businessEmail || '');
      setWebsite(listing.website || '');
      setLogoPreview(listing.logoUrl || null);
      setBannerPreview(listing.bannerUrl || null);
      
      // Load hours
      if (listing.businessHours) {
        setHours(listing.businessHours);
      } else {
        setHours([
          { dayOfWeek: 'MONDAY', openTime: '09:00', closeTime: '17:00' },
          { dayOfWeek: 'TUESDAY', openTime: '09:00', closeTime: '17:00' },
          { dayOfWeek: 'WEDNESDAY', openTime: '09:00', closeTime: '17:00' },
          { dayOfWeek: 'THURSDAY', openTime: '09:00', closeTime: '17:00' },
          { dayOfWeek: 'FRIDAY', openTime: '09:00', closeTime: '17:00' },
        ]);
      }

      // Load socials
      if (listing.socialLinks) {
        setSocials(listing.socialLinks.map((s: any) => ({ platform: s.platform, url: s.url })));
      } else {
        setSocials([]);
      }
    }
  }, [listing]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold">No profile found</h2>
        <Button className="mt-4" onClick={() => router.push('/dashboard/storefront')}>Go Back</Button>
      </div>
    );
  }

  // Get description presets
  const sectorId = listing.sector?.id || listing.sectorId || '';
  const categoryId = listing.category?.id || listing.categoryId || '';
  const matchedPresetGroup = DESCRIPTION_PRESETS.find(
    (p) => p.sectorId === sectorId && p.categoryId === categoryId
  );
  const presets = matchedPresetGroup ? matchedPresetGroup.presets : getDefaultPresets();

  const handleApplyPreset = (presetText: string) => {
    setShortDescription(presetText);
    toast.success('Preset applied! You can customize it now.');
  };

  const handleHourChange = (index: number, field: string, value: string) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  const handleAddSocial = () => {
    setSocials([...socials, { platform: 'instagram', url: '' }]);
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const handleSocialChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      let logoUrl = listing.logoUrl;
      let bannerUrl = listing.bannerUrl;

      if (logoFile) {
        const uploadRes = await uploadFile(logoFile);
        logoUrl = uploadRes.secure_url;
      }
      if (bannerFile) {
        const uploadRes = await uploadFile(bannerFile);
        bannerUrl = uploadRes.secure_url;
      }

      const payload: any = {
        businessName,
        legalName,
        shortDescription,
        about,
        businessPhone,
        businessEmail,
        website,
        logoUrl,
        bannerUrl,
        socialLinks: socials.filter(s => s.url.trim() !== ''),
        businessHours: hours,
      };

      await editListing({ listingId: listing.id, payload });
      toast.success('Business Profile updated successfully!');
      router.push('/dashboard/storefront');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/storefront')}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Business Profile</h1>
            <p className="text-xs text-gray-500">Update your public storefront information.</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center gap-2"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </header>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identity */}
          <Card className="bg-white border-gray-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Business Identity</CardTitle>
              <CardDescription>Tell customers who you are and what you do.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Trading Name</Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal / Registered Name</Label>
                  <Input id="legalName" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shortDesc">Short Description</Label>
                  <span className="text-xs text-gray-400">{shortDescription.length}/180</span>
                </div>
                <Textarea
                  id="shortDesc"
                  maxLength={180}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A quick 1-2 sentence pitch of your business."
                />

                {/* Preset Suggestions */}
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Description Presets (Minimal Typing)</span>
                  <div className="flex flex-col gap-2">
                    {presets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="text-left text-xs bg-gray-50 border hover:border-orange-200 rounded p-2.5 text-gray-600 hover:bg-orange-50/20 transition-all"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Us / Long Description</Label>
                <Textarea
                  id="about"
                  rows={5}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell your business story in detail, specify what makes your shop unique."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="bg-white border-gray-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Website Address</Label>
                <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          {/* Hours */}
          <Card className="bg-white border-gray-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Weekly Opening Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hours.map((h, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded transition-colors">
                  <span className="text-sm font-semibold text-gray-700 w-28 capitalize">{h.dayOfWeek.toLowerCase()}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={h.openTime}
                      onChange={(e) => handleHourChange(index, 'openTime', e.target.value)}
                      className="w-32 h-9"
                    />
                    <span className="text-gray-400">to</span>
                    <Input
                      type="time"
                      value={h.closeTime}
                      onChange={(e) => handleHourChange(index, 'closeTime', e.target.value)}
                      className="w-32 h-9"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Assets & Socials */}
        <div className="space-y-8">
          
          {/* Logo & Banner */}
          <Card className="bg-white border-gray-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Brand Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border flex-shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-gray-300" />
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs flex-1 cursor-pointer" />
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <Label>Cover Banner</Label>
                <div className="space-y-3">
                  <div className="w-full h-32 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No Banner Image</span>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleBannerUpload} className="text-xs cursor-pointer" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Socials */}
          <Card className="bg-white border-gray-200/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-bold">Social Links</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddSocial} className="text-xs border-orange-200 hover:bg-orange-50 hover:text-orange-700 text-orange-600">
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {socials.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No social links added yet.</p>
              ) : (
                socials.map((social, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={social.platform}
                      onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                      className="border rounded px-2 py-1.5 text-sm bg-white border-gray-200"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="youtube">YouTube</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                    <Input
                      value={social.url}
                      onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 h-9"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSocial(index)} className="text-red-500 hover:bg-red-50 h-9 w-9">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
