'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TermsCondtion } from './terms-condition';
import { RememberMe } from './remember-me';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  ErrorResponse,
  useCreateUser,
  useLogin,
  useSendOtp,
  useValidateOtp,
  useResetPassword,
} from '@/service/auth/hook';
import { Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/service/auth/types';
import { useRouter, usePathname } from 'next/navigation';
import { SuccessDialog } from './SuccessDialog';
import { ErrorDialog } from './ErrorDialog';

type Mode = 'login' | 'register' | 'forgot-password' | 'verify-email';
type Step = 'enter-email' | 'enter-otp';

const Auth = ({ redirect }: { redirect: string | null }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('enter-email');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    terms: '',
    otp: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { isPending, mutateAsync } = useCreateUser();
  const { isPending: loginPending, mutateAsync: loginAsync } = useLogin();
  const { isPending: sendOtpPending, mutateAsync: sendOtpAsync } = useSendOtp();
  const { isPending: validateOtpPending, mutateAsync: validateOtpAsync } =
    useValidateOtp();
  const { isPending: resetPasswordPending, mutateAsync: resetPasswordAsync } =
    useResetPassword();

  useEffect(() => {
    if (pathname === '/signin') {
      setMode('login');
    } else if (pathname === '/signup') {
      setMode('register');
    }
  }, [pathname]);

  const handleToggleMode = (newMode: Mode) => {
    if (newMode === 'login') {
      router.push('/signin');
    } else if (newMode === 'register') {
      router.push('/signup');
    } else {
      setMode(newMode);
    }
    setStep('enter-email');
    setSelectedRole(null);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      otp: '',
    });
    setErrors({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      terms: '',
      otp: '',
    });
    setTermsAccepted(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrors(prev => ({ ...prev, role: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked);
    setErrors(prev => ({ ...prev, terms: '' }));
  };

  const validateFullName = (name: string) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name)
      ? ''
      : 'Name cannot contain numbers or special characters.';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex =
      /^\+?(\d{1,4}(?:\s?|\s*\(\d{3}\)\s*))?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(phone)
      ? ''
      : 'Please enter a valid phone number (e.g., +1 (123) 456-7890).';
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      terms: '',
      otp: '',
    };

    if (mode === 'register') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required.';
        isValid = false;
      } else {
        const nameError = validateFullName(formData.fullName);
        if (nameError) {
          newErrors.fullName = nameError;
          isValid = false;
        }
      }
    }

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

    if (mode === 'register') {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required.';
        isValid = false;
      } else {
        const phoneError = validatePhoneNumber(formData.phoneNumber);
        if (phoneError) {
          newErrors.phoneNumber = phoneError;
          isValid = false;
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required.';
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
        isValid = false;
      }

      if (!selectedRole) {
        newErrors.role = 'Please select a role (Customer or Business).';
        isValid = false;
      }

      if (!termsAccepted) {
        newErrors.terms = 'You must accept the Terms and Conditions.';
        isValid = false;
      }
    } else if (mode === 'login') {
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
    } else if (mode === 'verify-email') {
      if (!formData.otp) {
        newErrors.otp = 'OTP is required.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendOtp = async () => {
    const email =
      mode === 'verify-email' ? emailForVerification : formData.email;
    if (!email) {
      setDialogMessage('Email is required.');
      setIsErrorDialogOpen(true);
      return;
    }
    try {
      await sendOtpAsync({
        email,
        type: mode === 'forgot-password' ? 'PASSWORD_RESET' : 'VERIFICATION',
      });
      setDialogMessage('OTP sent successfully');
      setIsSuccessDialogOpen(true);
      if (mode === 'forgot-password') {
        setStep('enter-otp');
      }
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      setDialogMessage(err.message || 'Failed to send OTP');
      setIsErrorDialogOpen(true);
    }
  };

  const handleValidateOtp = async () => {
    try {
      await validateOtpAsync({
        email: formData.email,
        otp: formData.otp,
        type: mode === 'forgot-password' ? 'PASSWORD_RESET' : 'VERIFICATION',
      });
      setDialogMessage('OTP validated successfully');
      setIsSuccessDialogOpen(true);
      if (mode === 'verify-email') {
        try {
          const response = await loginAsync({
            email: formData.email,
            password: formData.password,
          });

          toast.success('Login successful', {
            description: `Welcome, ${response.name}!`,
          });
          if (redirect) {
            router.push(redirect);
          } else {
            router.push('/');
          }
        } catch (error: unknown) {
          const err = error as ErrorResponse;
          toast.error('Failed to login', {
            description: err?.message || 'An unexpected error occurred.',
          });
        }
      }
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      setDialogMessage(err.message || 'Failed to validate OTP');
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

    if (mode === 'register' && selectedRole) {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: selectedRole,
      };

      try {
        await mutateAsync(payload);
        await sendOtpAsync({
          email: formData.email,
          type: 'VERIFICATION',
        });
        setEmailForVerification(formData.email);
        setDialogMessage(
          'Account created successfully! Please verify your email.'
        );
        setIsSuccessDialogOpen(true);
        handleToggleMode('verify-email');
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        setDialogMessage(err.message || 'Failed to create account');
        setIsErrorDialogOpen(true);
      }
    } else if (mode === 'login') {
      try {
        const response = await loginAsync({
          email: formData.email,
          password: formData.password,
        });

        toast.success('Login successful', {
          description: `Welcome, ${response.name}!`,
        });
        if (redirect) {
          router.push(redirect);
        } else {
          router.push('/');
        }
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        toast.error('Failed to login', {
          description: err?.message || 'An unexpected error occurred.',
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          {mode !== 'forgot-password' && mode !== 'verify-email' && (
            <div>
              <div className="flex justify-center mb-4">
                <Button
                  variant="link"
                  className={`mr-4 text-lg ${
                    mode === 'login' ? 'text-orange-500' : 'text-gray-400'
                  }`}
                  onClick={() => handleToggleMode('login')}
                >
                  Log In
                </Button>
                <Button
                  variant="link"
                  className={`text-lg ${
                    mode === 'register' ? 'text-orange-500' : 'text-gray-400'
                  }`}
                  onClick={() => handleToggleMode('register')}
                >
                  Register
                </Button>
              </div>
              <hr className="w-full bg-gray-400 " />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {mode === 'login' && 'Login'}
            {mode === 'register' &&
              `Create ${
                selectedRole === UserRole.CUSTOMER
                  ? 'Customer'
                  : selectedRole === UserRole.OWNER
                  ? 'Business'
                  : ''
              } Account`}
            {mode === 'forgot-password' && 'Reset Password'}
            {mode === 'verify-email' && 'Verify Email'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' && 'Login to your account to continue.'}
            {mode === 'register' &&
              `Create a new ${
                selectedRole === UserRole.CUSTOMER
                  ? 'customer'
                  : selectedRole === UserRole.OWNER
                  ? 'business'
                  : ''
              } account to get started.`}
            {mode === 'forgot-password' &&
              'Enter your email to reset your password.'}
            {mode === 'verify-email' &&
              'Enter the OTP sent to your email to verify your account.'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            {mode === 'register' && (
              <div>
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className={`flex-1 px-4 py-2 text-gray-700 ${
                      selectedRole === UserRole.CUSTOMER
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    } rounded`}
                    onClick={() => handleRoleSelect(UserRole.CUSTOMER)}
                  >
                    <span className="mr-2">👤</span> Customer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`flex-1 px-4 py-2 text-gray-700 ${
                      selectedRole === UserRole.OWNER
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    } rounded`}
                    onClick={() => handleRoleSelect(UserRole.OWNER)}
                  >
                    <span className="mr-2">🏠</span> Business
                  </Button>
                </div>
                {errors.role && (
                  <p className="text-orange-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>
            )}
            {mode === 'register' && (
              <div className="grid gap-3">
                <Label htmlFor="fullName" className="text-lg">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`sm:h-[3rem] ${
                    errors.fullName ? 'border-orange-500' : ''
                  }`}
                />
                {errors.fullName && (
                  <p className="text-orange-500 text-sm">{errors.fullName}</p>
                )}
              </div>
            )}
            {mode === 'register' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-lg">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email"
                    className={`sm:h-[3rem] ${
                      errors.email ? 'border-orange-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-orange-500 text-sm">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="phoneNumber" className="text-lg">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                    className={`sm:h-[3rem] ${
                      errors.phoneNumber ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>
            ) : (
              step === 'enter-email' && (
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-lg">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email"
                    className={`sm:h-[3rem] ${
                      errors.email ? 'border-orange-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-orange-500 text-sm">{errors.email}</p>
                  )}
                </div>
              )
            )}
          {mode === 'register' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className={`sm:h-[3rem] pr-10 ${
                      errors.password ? 'border-orange-500' : ''
                    }`}
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
                <Label htmlFor="password2" className="text-lg">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="password2"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className={`sm:h-[3rem] pr-10 ${
                      errors.confirmPassword ? 'border-orange-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-orange text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
                </div>
              </div>
          ) : (
            mode === 'login' && (
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
                    className={`sm:h-[3rem] pr-10 ${
                      errors.password ? 'border-orange-500' : ''
                    }`}
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
            )
            )}
            {((mode === 'forgot-password' && step === 'enter-otp') ||
              mode === 'verify-email') && (
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
                  className={`sm:h-[3rem] ${
                    errors.otp ? 'border-orange-500' : ''
                  }`}
                />
                {errors.otp && (
                  <p className="text-orange-500 text-sm">{errors.otp}</p>
                )}
              </div>
            )}
            {mode === 'forgot-password' && step === 'enter-otp' && (
              <>
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
                      className={`sm:h-[3rem] pr-10 ${
                        errors.password ? 'border-orange-500' : ''
                      }`}
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
                    <p className="text-orange-500 text-sm">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password2" className="text-lg">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password2"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={`sm:h-[3rem] pr-10 ${
                        errors.confirmPassword ? 'border-orange-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-orange text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          {mode === 'login' && (
            <div className="flex justify-between">
              <Button
                type="button"
                variant="link"
                className="justify-start primaryText p-0"
                onClick={() => handleToggleMode('forgot-password')}
              >
                Forgotten your password? Reset
              </Button>
              <Button
                type="button"
                variant="link"
                className="justify-start primaryText p-0"
                onClick={() => handleToggleMode('verify-email')}
              >
                Verify Email
              </Button>
            </div>
          )}
          {mode === 'register' && (
            <TermsCondtion
              isChecked={termsAccepted}
              onChange={handleTermsChange}
            />
          )}
          {mode === 'register' && errors.terms && (
            <p className="text-orange-500 text-sm mt-1">{errors.terms}</p>
          )}
          {mode === 'login' && <RememberMe />}
          <div className="flex flex-col justify-between mt-4">
            {mode === 'login' && (
              <Button
                type="submit"
                className="justify-center w-full bg-orange-500 hover:bg-orange-600"
                disabled={loginPending}
              >
                {loginPending ? 'Submitting...' : 'Submit'}
              </Button>
            )}
            {mode === 'register' && (
              <Button
                type="submit"
                className="justify-center w-full bg-orange-500 hover:bg-orange-600"
                disabled={isPending}
              >
                {isPending ? 'Submitting...' : 'Submit'}
              </Button>
            )}
            {mode === 'forgot-password' && (
              <>
                {step === 'enter-email' && (
                  <Button
                    type="button"
                    className="justify-center w-full bg-orange-500 hover:bg-orange-600"
                    onClick={handleSendOtp}
                    disabled={sendOtpPending}
                  >
                    {sendOtpPending ? 'Sending...' : 'Send OTP'}
                  </Button>
                )}
                {step === 'enter-otp' && (
                  <Button
                    type="button"
                    className="justify-center w-full bg-orange-500 hover:bg-orange-600"
                    onClick={handleResetPassword}
                    disabled={resetPasswordPending}
                  >
                    {resetPasswordPending ? 'Resetting...' : 'Reset Password'}
                  </Button>
                )}
              </>
            )}
            {mode === 'verify-email' && (
              <div className="flex gap-4">
                <Button
                  type="button"
                  className="flex-1 justify-center bg-orange-500 hover:bg-orange-600"
                  onClick={handleSendOtp}
                  disabled={sendOtpPending}
                >
                  {sendOtpPending ? 'Sending...' : 'Resend OTP'}
                </Button>
                <Button
                  type="button"
                  className="flex-1 justify-center bg-orange-500 hover:bg-orange-600"
                  onClick={handleValidateOtp}
                  disabled={validateOtpPending}
                >
                  {validateOtpPending ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            )}
          </div>
        </form>
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
      </div>
    </div>
  );
};

export default Auth;
