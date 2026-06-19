'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserProfile, useUpdateUserProfile } from '@/service/user/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, User, Mail, Phone, Globe, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { uploadFile } from '@/lib/upload';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetUserProfile();
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateUserProfile();

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Social Links
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedIn] = useState('');
  const [youtube, setYouTube] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
      setPhoneNumber(profile.phoneNumber || '');
      setProfilePictureUrl(profile.profilePictureUrl || '');
      setLogoPreview(profile.profilePictureUrl || null);

      if (profile.socials) {
        setTwitter(profile.socials.twitter || '');
        setFacebook(profile.socials.facebook || '');
        setInstagram(profile.socials.instagram || '');
        setLinkedIn(profile.socials.linkedin || '');
        setYouTube(profile.socials.youtube || '');
      }
    }
  }, [profile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      let finalPicUrl = profilePictureUrl;
      if (logoFile) {
        toast.info('Uploading profile picture...');
        const uploadRes = await uploadFile(logoFile);
        finalPicUrl = uploadRes.secure_url;
      }

      await updateProfile({
        id: profile.id,
        firstName,
        lastName,
        phoneNumber,
        profilePictureUrl: finalPicUrl,
        socials: {
          twitter,
          facebook,
          instagram,
          linkedin,
          youtube,
        },
      });

      toast.success('Account profile updated successfully!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#ff6900] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/settings')}
            className="rounded-full hover:bg-orange-50 text-[#ff6900]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Account Details</h1>
            <p className="text-xs text-gray-500">Update your name, contacts, and public social links.</p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#ff6900] hover:bg-[#a14000] text-white font-semibold flex items-center gap-2 rounded-xl"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity details */}
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Personal Identity</CardTitle>
              <CardDescription>How you appear across the organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="John"
                    className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Doe"
                    className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled 
                    className="bg-gray-50/85 text-gray-500 rounded-xl pl-10 border-gray-200"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
                <span className="text-[10px] text-gray-400 block font-semibold pl-1">
                  Email addresses cannot be modified. Contact support if changes are required.
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="+44 7911 123456"
                    className="rounded-xl pl-10 border-gray-200/80 focus-visible:ring-[#ff6900]"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Profiles */}
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Social Profiles</CardTitle>
              <CardDescription>Link your profiles for store collaborations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Username</Label>
                <Input 
                  id="instagram" 
                  value={instagram} 
                  onChange={(e) => setInstagram(e.target.value)} 
                  placeholder="@username"
                  className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook Link</Label>
                <Input 
                  id="facebook" 
                  value={facebook} 
                  onChange={(e) => setFacebook(e.target.value)} 
                  placeholder="https://facebook.com/profile"
                  className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter Link</Label>
                <Input 
                  id="twitter" 
                  value={twitter} 
                  onChange={(e) => setTwitter(e.target.value)} 
                  placeholder="https://twitter.com/profile"
                  className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Link</Label>
                <Input 
                  id="linkedin" 
                  value={linkedin} 
                  onChange={(e) => setLinkedIn(e.target.value)} 
                  placeholder="https://linkedin.com/in/username"
                  className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube Channel</Label>
                <Input 
                  id="youtube" 
                  value={youtube} 
                  onChange={(e) => setYouTube(e.target.value)} 
                  placeholder="https://youtube.com/c/channel"
                  className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Picture */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shadow-inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="Profile photo preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-gray-300" />
                )}
              </div>
              
              <div className="w-full space-y-2">
                <Label htmlFor="profilePic" className="text-center block text-xs text-gray-400">
                  Select a JPG, PNG or WEBP image.
                </Label>
                <Input 
                  id="profilePic"
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="text-xs cursor-pointer rounded-xl border-gray-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick links to security & notifications */}
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-2">Related Settings</h4>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/settings/password')}
              className="w-full justify-start rounded-xl text-xs font-bold border-orange-100 text-[#ff6900] hover:bg-orange-50/50"
            >
              Change Password
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/settings/notifications')}
              className="w-full justify-start rounded-xl text-xs font-bold border-orange-100 text-[#ff6900] hover:bg-orange-50/50"
            >
              Notification Preferences
            </Button>
          </Card>
        </div>
      </div>
    </form>
  );
}
