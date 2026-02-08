'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RememberMe } from './remember-me';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ErrorResponse,
  useLogin,
  useSendOtp,
  useResetPassword,
} from '@/service/auth/hook';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/service/store/store';
import { setLoginModalOpen } from '@/service/store/uiSlice';
import { SuccessDialog } from './SuccessDialog';
import { ErrorDialog } from './ErrorDialog';

type Mode = 'login' | 'forgot-password';
type Step = 'enter-email' | 'enter-otp';

const Auth = ({
  children,
}: {
  children?: React.ReactNode;
  redirect: string | null;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { isLoginModalOpen } = useSelector((state: RootState) => state.ui);
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('enter-email');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
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
      setDialogMessage('Email is required.');
      setIsErrorDialogOpen(true);
      return;
    }
    try {
      await sendOtpAsync({
        email: formData.email,
        type: 'PASSWORD_RESET',
      });
      setDialogMessage('OTP sent successfully');
      setIsSuccessDialogOpen(true);
      setStep('enter-otp');
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      setDialogMessage(err.message || 'Failed to send OTP');
      setIsErrorDialogOpen(true);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPasswordAsync({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setDialogMessage('Password reset successfully');
      setIsSuccessDialogOpen(true);
      handleToggleMode('login');
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      setDialogMessage(err.message || 'Failed to reset password');
      setIsErrorDialogOpen(true);
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
          description: `Welcome, ${response.name}!`,
        });
        handleToggleMode('login');
        dispatch(setLoginModalOpen(false));
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        toast.error('Failed to login', {
          description: err?.message || 'An unexpected error occurred.',
        });
      }
    }
  };

  return (
    <Dialog
      open={isLoginModalOpen}
      onOpenChange={isOpen => dispatch(setLoginModalOpen(isOpen))}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-orange-500 "
          onClick={() => dispatch(setLoginModalOpen(true))}
        >
          {children || 'Sign In'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:min-w-[425px] mx-2">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-orange-500 hover:text-orange-600">
            {mode === 'login' && 'Admin Login'}
            {mode === 'forgot-password' && 'Reset Password'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login' && 'Please enter your credentials to access the admin dashboard.'}
            {mode === 'forgot-password' &&
              'Enter your email to reset your password.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {step === 'enter-email' && (
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-lg">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                className={`sm:h-[3rem] ${errors.email ? 'border-orange-500' : ''}`}
              />
              {errors.email && (
                <p className="text-orange-500 text-sm">{errors.email}</p>
              )}
            </div>
          )}
          {mode === 'login' && (
            <div className="grid gap-3">
              <Label htmlFor="password" className="text-lg">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Your password"
                  className={`sm:h-[3rem] pr-10 ${errors.password ? 'border-orange-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-orange-500 text-sm">{errors.password}</p>
              )}
            </div>
          )}
          {mode === 'forgot-password' && step === 'enter-otp' && (
            <>
               <div className="grid gap-3">
                <Label htmlFor="otp" className="text-lg">
                  OTP
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter OTP"
                  className={`sm:h-[3rem] ${errors.otp ? 'border-orange-500' : ''}`}
                />
                {errors.otp && (
                  <p className="text-orange-500 text-sm">{errors.otp}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-lg">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className={`sm:h-[3rem] pr-10 ${errors.password ? 'border-orange-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-orange-500 text-sm">{errors.password}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="text-lg">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className={`sm:h-[3rem] pr-10 ${errors.confirmPassword ? 'border-orange-500' : ''}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-orange-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}
        </div>
        {mode === 'login' && (
          <div className="flex justify-between">
            <Button
              variant="link"
              className="justify-start primaryText p-0"
              onClick={() => handleToggleMode('forgot-password')}
            >
              Forgotten your password? Reset
            </Button>
            <RememberMe />
          </div>
        )}
        <DialogFooter className="sm:justify-between mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {mode === 'login' && (
            <Button
              type="button"
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSubmit}
              disabled={loginPending}
            >
              {loginPending ? 'Logging in...' : 'Login'}
            </Button>
          )}
          {mode === 'forgot-password' && (
            <>
              {step === 'enter-email' && (
                <Button
                  type="button"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleSendOtp}
                  disabled={sendOtpPending}
                >
                  {sendOtpPending ? 'Sending...' : 'Send OTP'}
                </Button>
              )}
              {step === 'enter-otp' && (
                <Button
                  type="button"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleResetPassword}
                  disabled={resetPasswordPending}
                >
                  {resetPasswordPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        message={dialogMessage}
      />
      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        message={dialogMessage}
      />
    </Dialog>
  );
};

export default Auth;
