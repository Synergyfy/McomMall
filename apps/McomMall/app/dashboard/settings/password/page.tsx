'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChangePassword } from '@/service/user/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, ArrowLeft, Key, Lock, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { mutateAsync: changePassword, isPending } = useChangePassword();

  // Form fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility flags
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Strength checks
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'No password', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, text: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 50, text: 'Medium', color: 'bg-amber-500' };
      case 3:
        return { score: 75, text: 'Strong', color: 'bg-green-500' };
      case 4:
        return { score: 100, text: 'Excellent', color: 'bg-green-600' };
      default:
        return { score: 10, text: 'Very Weak', color: 'bg-red-600' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.push('/dashboard/settings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update password');
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Security Credentials</h1>
            <p className="text-xs text-gray-500">Update password with complex strength validations.</p>
          </div>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Change Password</CardTitle>
          <CardDescription>We recommend using a unique password that you do not use on other sites.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input 
                  id="currentPassword" 
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="rounded-xl border-gray-200/80 pl-10 pr-10 focus-visible:ring-[#ff6900]"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input 
                  id="newPassword" 
                  type={showNew ? 'text' : 'password'}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="rounded-xl border-gray-200/80 pl-10 pr-10 focus-visible:ring-[#ff6900]"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Password strength visualizer */}
              {newPassword && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                    <span>Password Strength: {strength.text}</span>
                    <span>{strength.score}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${strength.score}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-400 space-y-0.5">
                    <p className={newPassword.length >= 8 ? 'text-green-600' : ''}>• At least 8 characters</p>
                    <p className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>• At least one uppercase letter</p>
                    <p className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>• At least one digit</p>
                    <p className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''}>• At least one special symbol</p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="rounded-xl border-gray-200/80 pl-10 pr-10 focus-visible:ring-[#ff6900]"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#ff6900] hover:bg-[#a14000] text-white font-semibold flex items-center justify-center gap-2 rounded-xl h-11"
            >
              <Key size={16} />
              {isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
