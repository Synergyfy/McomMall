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
  useCheckEmail,
} from '@/service/auth/hook';
import { Eye, EyeOff, ShieldCheck, RefreshCw, X } from 'lucide-react';
import OTPInput from './ui/otp-input';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/service/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserRole } from '@/service/auth/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SuccessDialog } from './SuccessDialog';
import { ErrorDialog } from './ErrorDialog';
import { useAddShippingAddress } from '@/service/shipping/hook';
import Cookies from 'js-cookie';
import Link from 'next/link';

type Mode = 'login' | 'register' | 'forgot-password' | 'verify-email';
type Step = 'enter-email' | 'enter-otp' | 'registration-form' | 'address-details';

const Auth = ({ redirect }: { redirect: string | null }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('enter-email');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRolePreselected, setIsRolePreselected] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '+44',
    password: '',
    confirmPassword: '',
    otp: '',
    // Address Fields
    addressLine1: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    terms: '',
    otp: '',
    addressLine1: '',
    city: '',
    postcode: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showGoogleSignInPopup, setShowGoogleSignInPopup] = useState(false);

  const handleGoogleSignInStart = () => {
    setShowGoogleSignInPopup(true);
  };

  const handleGoogleSignInSelect = async (email: string) => {
    setShowGoogleSignInPopup(false);
    try {
      const res = await api.post('google-business/login', { email });
      const { auth, user } = res.data;

      // Set headers and auth cookies
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`;
      document.cookie = `accessToken=${auth.accessToken}; path=/`;

      toast.success('Google Login successful');
      if (redirect) router.push(redirect);
      else router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Google Sign-in failed. Please register first.');
    }
  };

  const { isPending: createUserPending, mutateAsync: createUserAsync } = useCreateUser();
  const { isPending: loginPending, mutateAsync: loginAsync } = useLogin();
  const { isPending: sendOtpPending, mutateAsync: sendOtpAsync } = useSendOtp();
  const { isPending: validateOtpPending, mutateAsync: validateOtpAsync } = useValidateOtp();
  const { isPending: resetPasswordPending, mutateAsync: resetPasswordAsync } = useResetPassword();
  const { isPending: checkEmailPending, mutateAsync: checkEmailAsync } = useCheckEmail();
  const { mutateAsync: addAddressAsync } = useAddShippingAddress();

  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

  useEffect(() => {
    if (pathname === '/signin') {
      setMode('login');
      setStep('enter-email');
    } else if (pathname === '/signup') {
      setMode('register');
      setStep('enter-email');

      if (roleParam === 'customer') {
        setSelectedRole(UserRole.CUSTOMER);
        setIsRolePreselected(true);
      } else if (roleParam === 'business') {
        setSelectedRole(UserRole.OWNER);
        setIsRolePreselected(true);
      }
    }
  }, [pathname, roleParam]);

  const handleToggleMode = (newMode: Mode) => {
    const currentParams = searchParams.toString();
    const queryString = currentParams ? `?${currentParams}` : '';

    if (newMode === 'login') {
      router.push(`/signin${queryString}`);
    } else if (newMode === 'register') {
      router.push(`/getstarted${queryString}`);
    } else {
      setMode(newMode);
    }
    setStep('enter-email');
    setSelectedRole(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '+44',
      password: '',
      confirmPassword: '',
      otp: '',
      addressLine1: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
    });
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      terms: '',
      otp: '',
      addressLine1: '',
      city: '',
      postcode: '',
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
  };

  const validatePhoneNumber = (phone: string) => {
    // Basic UK phone validation (starts with +44 or 0, 10-11 digits)
    // Adjust regex as per strict requirements
    const phoneRegex = /^(\+44|0)7\d{9}$|^(\+44|0)\d{10}$/; 
    // Allowing flexible +44 format
    return phoneRegex.test(phone.replace(/\s/g, ''))
      ? ''
      : 'Please enter a valid UK phone number (e.g. +44 7911 123456).';
  };

  const validatePostcode = (postcode: string) => {
    // Simple UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    return postcodeRegex.test(postcode) ? '' : 'Please enter a valid UK postcode.';
  };

  const validateForm = async (currentStep: Step) => {
    let isValid = true;
    const newErrors = { ...errors };

    if (mode === 'register') {
      if (currentStep === 'enter-email') {
        if (!formData.email) {
          newErrors.email = 'Email is required.';
          isValid = false;
        } else {
          const emailError = validateEmail(formData.email);
          if (emailError) {
            newErrors.email = emailError;
            isValid = false;
          } else {
            // Check if email exists
            try {
              const result = await checkEmailAsync(formData.email);
              if (result.exists) {
                newErrors.email = 'This email is already registered. Please sign in.';
                isValid = false;
              } else {
                newErrors.email = '';
              }
            } catch (error) {
              console.error('Email check failed', error);
              // Allow proceeding if check fails? Or block?
              // For safety, maybe just assume unique or show generic error
              // But requirements say "show an error message under the input field"
            }
          }
        }
      }

      if (currentStep === 'enter-otp') {
         if (!formData.otp || formData.otp.length < 6) {
           newErrors.otp = 'Please enter a valid 6-digit OTP.';
           isValid = false;
         } else {
           newErrors.otp = '';
         }
      }

      if (currentStep === 'registration-form') {
        if (!formData.firstName) {
          newErrors.firstName = 'First Name is required.';
          isValid = false;
        }
        if (!formData.lastName) {
          newErrors.lastName = 'Last Name is required.';
          isValid = false;
        }
        if (!formData.phoneNumber) {
          newErrors.phoneNumber = 'Phone number is required.';
          isValid = false;
        } else if (validatePhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
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
        if (!selectedRole) {
          newErrors.role = 'Please select a role.';
          isValid = false;
        }
      }

      if (currentStep === 'address-details') {
          if (!formData.postcode) {
              newErrors.postcode = 'Postcode is required.';
              isValid = false;
          } else if (validatePostcode(formData.postcode)) {
              newErrors.postcode = validatePostcode(formData.postcode);
              isValid = false;
          }

          if (!termsAccepted) {
            newErrors.terms = 'You must accept the Terms and Conditions.';
            isValid = false;
          }
      }
    } else if (mode === 'login') {
         if (!formData.email) newErrors.email = 'Email is required.';
         if (!formData.password) newErrors.password = 'Password is required.';
         if (newErrors.email || newErrors.password) isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendOtp = async (email: string) => {
    try {
      await sendOtpAsync({
        email,
        type: mode === 'forgot-password' ? 'PASSWORD_RESET' : 'VERIFICATION',
      });
      toast.success('OTP sent successfully.');
      return true;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      setDialogMessage(err.message || 'Failed to send OTP');
      setIsErrorDialogOpen(true);
      return false;
    }
  };

  const handleNextStep = async () => {
    if (mode === 'register') {
      const isValid = await validateForm(step);
      if (!isValid) return;

      if (step === 'enter-email') {
        // Send OTP
        const sent = await handleSendOtp(formData.email);
        if (sent) {
            setEmailForVerification(formData.email);
            setStep('enter-otp');
        }
      } else if (step === 'enter-otp') {
        // Validate OTP
        try {
            await validateOtpAsync({
                email: formData.email,
                otp: formData.otp,
                type: 'VERIFICATION',
            });
            toast.success('Email verified successfully.');
            setStep('registration-form');
        } catch (error: unknown) {
             const err = error as ErrorResponse;
             setErrors(prev => ({...prev, otp: err.message || 'Invalid OTP'}));
        }
      } else if (step === 'registration-form') {
          setStep('address-details');
      } else if (step === 'address-details') {
          handleSubmitRegistration();
      }
    }
  };

  const handleSubmitRegistration = async () => {
      const provisionCode = searchParams.get('provisionCode') || Cookies.get('provisionCode');
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: selectedRole!,
        provisionCode: provisionCode || undefined,
      };

      try {
        await createUserAsync(payload);
        
        // Auto login after registration
        const response = await loginAsync({
            email: formData.email,
            password: formData.password,
        });

        toast.success('Account created and logged in!', {
            description: `Welcome, ${response.name}!`,
        });

        // Save Address
        if (formData.postcode) {
             try {
              await addAddressAsync({
                addressName: 'Home',
                recipientName: `${formData.firstName} ${formData.lastName}`,
                phoneNumber: formData.phoneNumber,
                addressLine1: formData.addressLine1 || '',
                city: formData.city || '',
                state: '',
                country: formData.country,
                postalCode: formData.postcode,
                isMain: true
              });
            } catch (err) {
                console.error("Address save failed", err);
            }
        }

        if (redirect) {
          router.push(redirect);
        } else {
          router.push('/dashboard');
        }

      } catch (error: unknown) {
        const err = error as ErrorResponse;
        setDialogMessage(err.message || 'Failed to create account');
        setIsErrorDialogOpen(true);
      }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!await validateForm('enter-email')) return; // Reusing validation logic? No, simplistic check

    // Manual check for login
    let isValid = true;
    const newErrors = {...errors};
    if (!formData.email) { newErrors.email = 'Required'; isValid = false; }
    if (!formData.password) { newErrors.password = 'Required'; isValid = false; }
    setErrors(newErrors);
    if (!isValid) return;

    try {
        const response = await loginAsync({
          email: formData.email,
          password: formData.password,
        });
        toast.success('Login successful');
        if (redirect) router.push(redirect);
        else router.push('/dashboard');
    } catch (error: unknown) {
        const err = error as ErrorResponse;
        toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center pt-16 sm:pt-24 pb-16 min-h-screen bg-gray-50/50">
      <div className="w-full max-w-md h-fit p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-150/10 transition-all duration-300">
        
        <div className="text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20 transform rotate-45">
              <span className="text-white font-black text-lg -rotate-45">M</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {mode === 'login' ? 'Sign In to McomMall' : 'Create Your Account'}
            </h1>
            {mode === 'register' && step === 'enter-otp' && <p className="text-xs text-gray-400 mt-1">Enter OTP sent to {formData.email}</p>}
        </div>

        <form className="mt-8 space-y-6" onSubmit={mode === 'login' ? handleLoginSubmit : (e) => e.preventDefault()}>
            
            {/* Login Mode */}
            {mode === 'login' && (
                <>
                    <div className="grid gap-3">
                        <Label>Email</Label>
                        <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className={errors.email ? 'border-red-500' : ''} />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                    <div className="grid gap-3">
                        <Label>Password</Label>
                        <div className="relative">
                           <Input 
                            name="password" 
                            type={showPassword ? 'text' : 'password'} 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            placeholder="Password" 
                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'} 
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loginPending}>
                        {loginPending ? 'Logging in...' : 'Sign In'}
                    </Button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-semibold uppercase tracking-wider">or</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignInStart}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center justify-center gap-2.5 font-bold text-xs text-gray-700 shadow-sm cursor-pointer"
                    >
                      <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.87z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z" />
                        <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 5 12c0-.79.13-1.57.38-2.32V6.53H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.37l4.06-3.13z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.39 0 3.18 2.12 1.21 5.37l4.06 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                      </svg>
                      Sign In with Google
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                             Don't have an account? <button type="button" onClick={() => handleToggleMode('register')} className="text-orange-600 font-bold hover:underline text-orange-600">Sign Up</button>
                        </p>
                    </div>
                </>
            )}

            {/* Register Mode */}
            {mode === 'register' && (
                <>
                    {step === 'enter-email' && (
                        <div className="grid gap-4">
                             <div className="grid gap-3">
                                <Label>Email</Label>
                                <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className={errors.email ? 'border-red-500' : ''} />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                             </div>
                             <Button type="button" onClick={handleNextStep} className="w-full bg-orange-500 hover:bg-orange-600" disabled={checkEmailPending || sendOtpPending}>
                                 {checkEmailPending ? 'Checking...' : sendOtpPending ? 'Sending OTP...' : 'Next'}
                             </Button>
                             <div className="text-center mt-2">
                                 <p className="text-sm text-gray-600">
                                     Already have an account? <Link href="/signin" className="text-orange-600 font-bold hover:underline">Sign in</Link>
                                 </p>
                             </div>
                        </div>
                    )}

                    {step === 'enter-otp' && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <OTPInput length={6} value={formData.otp} onChange={(otp) => setFormData(prev => ({...prev, otp}))} />
                            </div>
                            {errors.otp && <p className="text-red-500 text-sm text-center">{errors.otp}</p>}
                            <Button type="button" onClick={handleNextStep} className="w-full bg-orange-500 hover:bg-orange-600" disabled={validateOtpPending}>
                                {validateOtpPending ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setStep('enter-email')} className="w-full">Change Email</Button>
                        </div>
                    )}

                    {step === 'registration-form' && (
                        <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="grid gap-2">
                                     <Label>First Name</Label>
                                     <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className={errors.firstName ? 'border-red-500' : ''} />
                                     {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                                 </div>
                                 <div className="grid gap-2">
                                     <Label>Last Name</Label>
                                     <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className={errors.lastName ? 'border-red-500' : ''} />
                                     {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                                 </div>
                             </div>

                             <div className="grid gap-2">
                                 <Label>Phone Number</Label>
                                 <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+44 7..." className={errors.phoneNumber ? 'border-red-500' : ''} />
                                 {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                             </div>

                             <div className="grid gap-2">
                                <Label>Password</Label>
                                <div className="relative">
                                    <Input 
                                        name="password" 
                                        type={showPassword ? 'text' : 'password'} 
                                        value={formData.password} 
                                        onChange={handleInputChange} 
                                        placeholder="Password" 
                                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'} 
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                             </div>
                             <div className="grid gap-2">
                                <Label>Confirm Password</Label>
                                <div className="relative">
                                    <Input 
                                        name="confirmPassword" 
                                        type={showConfirmPassword ? 'text' : 'password'} 
                                        value={formData.confirmPassword} 
                                        onChange={handleInputChange} 
                                        placeholder="Confirm Password" 
                                        className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'} 
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                             </div>

                             {!isRolePreselected && (
                                <div className="grid gap-2">
                                    <Label>Select Role</Label>
                                    <div className="flex gap-2">
                                        <Button type="button" variant={selectedRole === UserRole.CUSTOMER ? 'default' : 'outline'} onClick={() => handleRoleSelect(UserRole.CUSTOMER)} className="flex-1">Customer</Button>
                                        <Button type="button" variant={selectedRole === UserRole.OWNER ? 'default' : 'outline'} onClick={() => handleRoleSelect(UserRole.OWNER)} className="flex-1">Business</Button>
                                    </div>
                                    {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                                </div>
                             )}

                             <Button type="button" onClick={handleNextStep} className="w-full bg-orange-500 hover:bg-orange-600">Next</Button>
                        </div>
                    )}

                    {step === 'address-details' && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Postcode <span className="text-red-500">*</span></Label>
                                <Input name="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="SW1A 1AA" className={errors.postcode ? 'border-red-500' : ''} />
                                {errors.postcode && <p className="text-red-500 text-sm">{errors.postcode}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label>Address Line 1</Label>
                                <Input name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="123 Street" />
                            </div>

                            <div className="grid gap-2">
                                <Label>City</Label>
                                <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                            </div>

                             <div className="grid gap-2">
                                <Label>Country</Label>
                                <Input name="country" value={formData.country} readOnly className="bg-gray-100" />
                            </div>

                            <div className="flex items-start gap-2">
                                <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => handleTermsChange(e.target.checked)} className="mt-1" />
                                <label htmlFor="terms" className="text-sm">I accept the <Link href="/terms-and-conditions" className="text-orange-600 hover:underline">Terms and Conditions</Link></label>
                            </div>
                            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

                            <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={() => setStep('registration-form')} className="flex-1">Back</Button>
                                <Button type="button" onClick={handleNextStep} className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={createUserPending}>
                                    {createUserPending ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
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

        {/* ─── Google Mock Account Picker for Sign-in ─── */}
        <AnimatePresence>
          {showGoogleSignInPopup && (
            <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
              {/* Dark glassmorphic overlay */}
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={() => setShowGoogleSignInPopup(false)}
              />

              {/* Popup window */}
              <div
                className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 border border-gray-150 overflow-hidden flex flex-col font-sans"
                style={{ minHeight: '380px' }}
              >
                {/* Header */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-orange-505 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 tracking-wide">Sign in with Google</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSignInPopup(false)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <svg className="w-12 h-12" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.87z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z" />
                        <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 5 12c0-.79.13-1.57.38-2.32V6.53H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.37l4.06-3.13z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.39 0 3.18 2.12 1.21 5.37l4.06 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                      </svg>
                    </div>

                    <div className="text-center">
                      <h3 className="text-sm font-bold text-gray-900">Choose an account</h3>
                      <p className="text-xs text-gray-400 mt-1">to continue to <span className="font-semibold text-orange-600">McomMall</span></p>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[
                        { email: 'merchant.jane@gmail.com', name: 'Jane Smith', initials: 'JS', bg: 'bg-orange-500' },
                        { email: 'shopowner.peckham@gmail.com', name: 'Mark Robinson', initials: 'MR', bg: 'bg-blue-500' },
                        { email: 'guest.merchant@gmail.com', name: 'Guest Merchant', initials: 'GM', bg: 'bg-emerald-500' }
                      ].map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => handleGoogleSignInSelect(acc.email)}
                          className="w-full p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 text-left cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-full ${acc.bg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                            {acc.initials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-none">{acc.name}</p>
                            <p className="text-[9px] text-gray-400 mt-1">{acc.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;