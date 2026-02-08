'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/service/store/store';
import {
  useLogin,
  useSendOtp,
  useResetPassword,
  ErrorResponse,
} from '@/service/auth/hook';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

type Mode = 'login' | 'forgot-password';
type Step = 'enter-email' | 'enter-otp';

export default function AdminSignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('enter-email');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const { isPending: loginPending, mutateAsync: loginAsync } = useLogin();
  const { isPending: sendOtpPending, mutateAsync: sendOtpAsync } = useSendOtp();
  const { isPending: resetPasswordPending, mutateAsync: resetPasswordAsync } =
    useResetPassword();

  const { accessToken } = useSelector((state: any) => state.auth);

  const handleToggleMode = (newMode: Mode) => {
    setMode(newMode);
    setStep('enter-email');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
    });
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required.';
      isValid = false;
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        newErrors.email = emailError;
        isValid = false;
      }
    }

    if (mode === 'login') {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
        isValid = false;
      }
    } else if (mode === 'forgot-password') {
      if (step === 'enter-otp') {
        if (!formData.otp) {
          newErrors.otp = 'OTP is required.';
          isValid = false;
        }
        if (!formData.password) {
          newErrors.password = 'Password is required.';
          isValid = false;
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match.';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error('Email is required.');
      return;
    }
    try {
      await sendOtpAsync({
        email: formData.email,
        type: 'PASSWORD_RESET',
      });
      toast.success('OTP sent successfully');
      setStep('enter-otp');
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      toast.error(err.message || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    try {
      await resetPasswordAsync({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      toast.success('Password reset successfully');
      handleToggleMode('login');
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      toast.error(err.message || 'Failed to reset password');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (mode === 'login') {
      try {
        const response = await loginAsync({
          email: formData.email,
          password: formData.password,
        });

        toast.success('Login successful', {
          description: `Welcome back, ${response.name}!`,
        });

        // Success redirect
        router.push('/admin');
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        toast.error('Failed to login', {
          description: err?.message || 'An unexpected error occurred.',
        });
      }
    } else {
      if (step === 'enter-email') {
        handleSendOtp();
      } else {
        handleResetPassword();
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fafafa] overflow-hidden">
      {/* Left Side: Stunning Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"
            alt="Admin Dashboard"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/40 via-transparent to-slate-900/60" />
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white h-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">McomMall Admin</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl font-extrabold leading-tight"
            >
              The Next Generation <br />
              <span className="text-orange-500">Retail Ecosystem</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-slate-300 max-w-lg"
            >
              Empower your business with advanced analytics, seamless management, and powerful growth tools.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex gap-4 items-center"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Admin" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Trusted by <span className="text-white font-semibold">2,000+</span> businesses worldwide
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side: Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome Back' : 'Secure Reset'}
            </h2>
            <p className="mt-2 text-slate-500">
              {mode === 'login'
                ? 'Please enter your administrative credentials'
                : step === 'enter-email'
                  ? 'Enter your email to receive a recovery code'
                  : 'Enter the code and your new password'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode + step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {step === 'enter-email' && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@mcommall.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 h-12 bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 ${errors.email ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" title="password" className="text-slate-700 font-medium">Password</Label>
                      <button
                        type="button"
                        onClick={() => handleToggleMode('forgot-password')}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 h-12 bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 ${errors.password ? 'border-red-500' : ''}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                )}

                {mode === 'forgot-password' && step === 'enter-otp' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-slate-700 font-medium">Verification Code</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          id="otp"
                          name="otp"
                          placeholder="6-digit code"
                          value={formData.otp}
                          onChange={handleInputChange}
                          className="pl-10 h-12 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" title="password" className="text-slate-700 font-medium">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          id="new-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 h-12 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" title="confirmPassword" className="text-slate-700 font-medium">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="h-12 bg-white"
                        required
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loginPending || sendOtpPending || resetPasswordPending}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loginPending || sendOtpPending || resetPasswordPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === 'login' ? 'Sign In to Portal' : step === 'enter-email' ? 'Send Recovery Code' : 'Reset Password'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>

            {mode === 'forgot-password' && (
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            )}
          </form>

          <div className="pt-8 border-t border-slate-100">
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">
                Administrative Access Only
              </p>
              <div className="flex gap-6 opacity-40">
                <div className="w-8 h-8 rounded-lg bg-slate-200" />
                <div className="w-8 h-8 rounded-lg bg-slate-200" />
                <div className="w-8 h-8 rounded-lg bg-slate-200" />
              </div>
              <p className="text-[10px] text-slate-400 text-center max-w-xs uppercase leading-relaxed">
                Encryption active. Authorized personnel only. Your access is monitored and logged.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
