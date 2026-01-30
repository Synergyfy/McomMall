'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TermsCondtion } from './terms-condition';
import { RememberMe } from './remember-me';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ErrorResponse,
  useCreateUser,
  useLogin,
  useSendOtp,
  useValidateOtp,
} from '@/service/auth/hook';
import { Eye, EyeOff, X } from 'lucide-react';
import { UserRole } from '@/service/auth/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Mode = 'login' | 'register' | 'verify-email';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: Mode;
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'register' }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { isPending: registerPending, mutateAsync: registerAsync } = useCreateUser();
  const { isPending: loginPending, mutateAsync: loginAsync } = useLogin();
  const { isPending: sendOtpPending, mutateAsync: sendOtpAsync } = useSendOtp();
  const { isPending: validateOtpPending, mutateAsync: validateOtpAsync } = useValidateOtp();

  const handleToggleMode = (newMode: Mode) => {
    setMode(newMode);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: any = {};

    if (mode === 'register') {
      if (!formData.fullName) { newErrors.fullName = 'Full name is required.'; isValid = false; }
      if (!formData.phoneNumber) { newErrors.phoneNumber = 'Phone number is required.'; isValid = false; }
      if (!formData.password) { newErrors.password = 'Password is required.'; isValid = false; }
      if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = 'Passwords do not match.'; isValid = false; }
      if (!termsAccepted) { newErrors.terms = 'You must accept the terms.'; isValid = false; }
    }

    if (!formData.email) { newErrors.email = 'Email is required.'; isValid = false; }
    if (mode === 'login' && !formData.password) { newErrors.password = 'Password is required.'; isValid = false; }
    if (mode === 'verify-email' && !formData.otp) { newErrors.otp = 'OTP is required.'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (mode === 'register') {
        await registerAsync({
          name: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          role: selectedRole,
        });
        await sendOtpAsync({ email: formData.email, type: 'VERIFICATION' });
        setEmailForVerification(formData.email);
        setMode('verify-email');
        toast.success('Account created! Please verify your email.');
      } else if (mode === 'login') {
        await loginAsync({ email: formData.email, password: formData.password });
        toast.success('Login successful!');
        onSuccess();
      } else if (mode === 'verify-email') {
        await validateOtpAsync({ email: formData.email, otp: formData.otp, type: 'VERIFICATION' });
        // Automatically login after verification
        await loginAsync({ email: formData.email, password: formData.password });
        toast.success('Email verified and logged in!');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Account'}
            {mode === 'verify-email' && 'Verify Your Email'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {mode === 'register' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+1234567890" />
                {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber}</p>}
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>
          )}

          {mode === 'register' && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>
          )}

          {mode === 'verify-email' && (
            <div className="grid gap-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input id="otp" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="123456" />
              {errors.otp && <p className="text-red-500 text-xs">{errors.otp}</p>}
            </div>
          )}

          {mode === 'register' && (
            <div className="flex items-center gap-2 pt-2">
              <TermsCondtion isChecked={termsAccepted} onChange={setTermsAccepted} />
            </div>
          )}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={registerPending || loginPending || validateOtpPending}>
            {mode === 'login' ? 'Login' : mode === 'register' ? 'Sign Up' : 'Verify'}
          </Button>

          <div className="text-center text-sm mt-4">
            {mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => handleToggleMode('login')} className="text-orange-500 font-bold hover:underline">
                  Login
                </button>
              </p>
            ) : mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => handleToggleMode('register')} className="text-orange-500 font-bold hover:underline">
                  Sign Up
                </button>
              </p>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
