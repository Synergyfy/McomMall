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
import { Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import OTPInput from './ui/otp-input';
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

type Mode = 'login' | 'register' | 'forgot-password' | 'verify-email';
import { useAddShippingAddress } from '@/service/shipping/hook';
import Cookies from 'js-cookie';

type Step = 'enter-email' | 'registration-form' | 'address-details' | 'enter-otp';

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
    fullName: '',
    email: '',
    phoneNumber: '',
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
    fullName: '',
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
  const { isPending, mutateAsync } = useCreateUser();
  const { isPending: loginPending, mutateAsync: loginAsync } = useLogin();
  const { isPending: sendOtpPending, mutateAsync: sendOtpAsync } = useSendOtp();
  const { isPending: validateOtpPending, mutateAsync: validateOtpAsync } =
    useValidateOtp();
  const { isPending: resetPasswordPending, mutateAsync: resetPasswordAsync } =
    useResetPassword();
  const { mutateAsync: addAddressAsync } = useAddShippingAddress();

  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

  useEffect(() => {
    if (pathname === '/signin') {
      setMode('login');
    } else if (pathname === '/signup') {
      setMode('register');

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
      addressLine1: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
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

  const validateForm = (stepOverride?: string) => {
    let isValid = true;
    const newErrors = { ...errors }; // Keep existing errors

    if (mode === 'register') {
      // If we are validating only the email step
      if (stepOverride === 'to-form-step' || step === 'enter-email') {
        if (!formData.email) {
          newErrors.email = 'Email is required.';
          isValid = false;
        } else {
          const emailError = validateEmail(formData.email);
          if (emailError) {
            newErrors.email = emailError;
            isValid = false;
          } else {
            newErrors.email = '';
          }
        }
        if (stepOverride === 'to-form-step') {
          setErrors(newErrors);
          return isValid;
        }
      }

      // Validate Registration Form Fields
      if (stepOverride === 'to-address-step' || step === 'registration-form' || step === 'address-details') {
        if (!formData.fullName) {
          newErrors.fullName = 'Full name is required.';
          isValid = false;
        } else {
          const nameError = validateFullName(formData.fullName);
          if (nameError) {
            newErrors.fullName = nameError;
            isValid = false;
          } else {
            newErrors.fullName = '';
          }
        }

        if (!formData.phoneNumber) {
          newErrors.phoneNumber = 'Phone number is required.';
          isValid = false;
        } else {
          const phoneError = validatePhoneNumber(formData.phoneNumber);
          if (phoneError) {
            newErrors.phoneNumber = phoneError;
            isValid = false;
          } else {
            newErrors.phoneNumber = '';
          }
        }

        if (!formData.password) {
          newErrors.password = 'Password is required.';
          isValid = false;
        } else {
          newErrors.password = '';
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match.';
          isValid = false;
        } else {
          newErrors.confirmPassword = '';
        }

        if (!selectedRole) {
          newErrors.role = 'Please select a role (Customer or Business).';
          isValid = false;
        } else {
          newErrors.role = '';
        }

        if (!termsAccepted) {
          newErrors.terms = 'You must accept the Terms and Conditions.';
          isValid = false;
        } else {
          newErrors.terms = '';
        }

        if (stepOverride === 'to-address-step') {
          setErrors(newErrors);
          return isValid;
        }
      }

      // Address is now mandatory
      if (stepOverride !== 'to-address-step' || step === 'address-details') {
        if (!formData.addressLine1) {
          newErrors.addressLine1 = 'Address Line 1 is required.';
          isValid = false;
        } else {
          newErrors.addressLine1 = '';
        }
        if (!formData.city) {
          newErrors.city = 'City is required.';
          isValid = false;
        } else {
          newErrors.city = '';
        }
        if (!formData.postcode) {
          newErrors.postcode = 'Postcode is required.';
          isValid = false;
        } else if (formData.postcode.length < 3) {
          newErrors.postcode = 'Postcode is too short.';
          isValid = false;
        } else {
          newErrors.postcode = '';
        }
      }

    } else if (mode === 'login') {
      if (!formData.email) {
        newErrors.email = 'Email is required.';
        isValid = false;
      } else {
        newErrors.email = '';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required.';
        isValid = false;
      } else {
        newErrors.password = '';
      }
    } else if (mode === 'forgot-password') {
      if (step === 'enter-otp') {
        if (!formData.otp) {
          newErrors.otp = 'OTP is required.';
          isValid = false;
        } else {
          newErrors.otp = '';
        }
        if (!formData.password) {
          newErrors.password = 'Password is required.';
          isValid = false;
        } else {
          newErrors.password = '';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match.';
          isValid = false;
        } else {
          newErrors.confirmPassword = '';
        }
      } else {
        if (!formData.email) {
          newErrors.email = 'Email is required.';
          isValid = false;
        } else {
          newErrors.email = '';
        }
      }
    } else if (mode === 'verify-email') {
      if (!formData.otp) {
        newErrors.otp = 'OTP is required.';
        isValid = false;
      } else {
        newErrors.otp = '';
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'enter-email') {
      if (validateForm('to-form-step')) {
        setStep('registration-form');
      }
    } else if (step === 'registration-form') {
      if (validateForm('to-address-step')) {
        setStep('address-details');
      }
    }
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
      setTimeout(() => setIsSuccessDialogOpen(false), 3000);
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

          // If user provided address details during registration, save them now
          if (formData.addressLine1 && formData.city && formData.postcode) {
            try {
              await addAddressAsync({
                addressName: 'Home',
                recipientName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                addressLine1: formData.addressLine1,
                city: formData.city,
                state: formData.city, // Using city as state for simplicity if not provided
                country: formData.country,
                postalCode: formData.postcode,
                isMain: true
              });
            } catch (addressErr) {
              console.error("Failed to save address after signup", addressErr);
              // We don't block login success if address fails, but maybe warn?
              // toast.warning("Account created, but failed to save address.");
            }
          }

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
      const provisionCode = searchParams.get('provisionCode') || Cookies.get('provisionCode');
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: selectedRole,
        provisionCode: provisionCode || undefined,
      };

      try {
        await mutateAsync(payload);

        // Send OTP for verification after user is created
        await sendOtpAsync({
          email: formData.email,
          type: 'VERIFICATION',
        });

        setEmailForVerification(formData.email);
        setDialogMessage('Account created successfully! Please verify your email.');
        setIsSuccessDialogOpen(true);
        setMode('verify-email');
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
      <div
        className={`w-full ${pathname === '/signup' && step !== 'enter-email' ? 'max-w-2xl' : 'max-w-md'
          } p-8 space-y-8 bg-white rounded-lg shadow-md transition-all duration-300`}
      >
        <div className="text-center">
          {mode !== 'verify-email' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                {mode === 'login' && 'Login'}
                {mode === 'register' &&
                  `Create ${selectedRole === UserRole.CUSTOMER
                    ? 'Customer'
                    : selectedRole === UserRole.OWNER
                      ? 'Business'
                      : ''
                  } Account`}
                {mode === 'forgot-password' && 'Reset Password'}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {mode === 'login' && 'Login to your account to continue.'}
                {mode === 'register' &&
                  `Create a new ${selectedRole === UserRole.CUSTOMER
                    ? 'customer'
                    : selectedRole === UserRole.OWNER
                      ? 'business'
                      : ''
                  } account to get started.`}
                {mode === 'forgot-password' &&
                  'Enter your email to reset your password.'}
              </p>
            </>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            {mode === 'register' && (
              <>
                {step === 'enter-email' && (
                  <div className="grid gap-2 max-w-sm mx-auto w-full">
                    <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                      className={`h-12 ${errors.email ? 'border-orange-500' : 'border-gray-200'} focus:ring-orange-500 rounded-lg`}
                    />
                    {errors.email && (
                      <p className="text-orange-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                )}

                {step === 'registration-form' && (
                  <div className="space-y-6">
                    {!isRolePreselected && (
                      <div>
                        <TooltipProvider>
                          <div className="flex gap-4 mb-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`flex-1 px-4 py-2 text-gray-700 ${selectedRole === UserRole.CUSTOMER
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    } rounded`}
                                  onClick={() => handleRoleSelect(UserRole.CUSTOMER)}
                                >
                                  <span className="mr-2">👤</span> Customer
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  As a customer, you can discover unique products, enjoy
                                  seamless booking, and manage your orders all in one
                                  place.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`flex-1 px-4 py-2 text-gray-700 ${selectedRole === UserRole.OWNER
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    } rounded`}
                                  onClick={() => handleRoleSelect(UserRole.OWNER)}
                                >
                                  <span className="mr-2">🏠</span> Business
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  As a business, you can showcase your products, manage
                                  your inventory, and connect with a wide customer base.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        {errors.role && (
                          <p className="text-orange-500 text-sm mt-1">{errors.role}</p>
                        )}
                      </div>
                    )}

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
                        className={`sm:h-[3rem] ${errors.fullName ? 'border-orange-500' : ''
                          }`}
                      />
                      {errors.fullName && (
                        <p className="text-orange-500 text-sm">{errors.fullName}</p>
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
                        className={`sm:h-[3rem] ${errors.phoneNumber ? 'border-red-500' : ''
                          }`}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                      )}
                    </div>

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
                            className={`sm:h-[3rem] pr-10 ${errors.password ? 'border-orange-500' : ''
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
                            className={`sm:h-[3rem] pr-10 ${errors.confirmPassword ? 'border-orange-500' : ''
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
                  </div>
                )}

                {step === 'address-details' && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="addressLine1" className="text-lg">Address Line 1</Label>
                        <Input
                          id="addressLine1"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          className={`sm:h-[3rem] ${errors.addressLine1 ? 'border-orange-500' : ''}`}
                        />
                        {errors.addressLine1 && <p className="text-orange-500 text-sm">{errors.addressLine1}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="city" className="text-lg">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            className={`sm:h-[3rem] ${errors.city ? 'border-orange-500' : ''}`}
                          />
                          {errors.city && <p className="text-orange-500 text-sm">{errors.city}</p>}
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="postcode" className="text-lg">Postcode</Label>
                          <Input
                            id="postcode"
                            name="postcode"
                            value={formData.postcode}
                            onChange={handleInputChange}
                            placeholder="Postcode"
                            className={`sm:h-[3rem] ${errors.postcode ? 'border-orange-500' : ''}`}
                          />
                          {errors.postcode && <p className="text-orange-500 text-sm">{errors.postcode}</p>}
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="country" className="text-lg">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Country"
                          className="sm:h-[3rem] bg-gray-100"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {(mode === 'login' || mode === 'forgot-password') && step === 'enter-email' && (
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
                  className={`sm:h-[3rem] ${errors.email ? 'border-orange-500' : ''
                    }`}
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
                    className={`sm:h-[3rem] pr-10 ${errors.password ? 'border-orange-500' : ''
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
            )}
            {(mode === 'forgot-password' && step === 'enter-otp') && (
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
                  className={`sm:h-[3rem] ${errors.otp ? 'border-orange-500' : ''
                    }`}
                />
                {errors.otp && (
                  <p className="text-orange-500 text-sm">{errors.otp}</p>
                )}
              </div>
            )}

            {mode === 'verify-email' && (
              <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300 py-4">
                <div className="text-center space-y-4">
                  <div className="bg-orange-100 p-4 rounded-full inline-block mb-2">
                    <ShieldCheck className="w-12 h-12 text-orange-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Verify Email</h1>
                  <p className="text-gray-500 text-lg max-w-[80%] mx-auto">
                    Enter the code sent to <span className="font-semibold text-gray-900">{emailForVerification}</span>
                  </p>
                </div>

                <div className="w-full py-2">
                  <OTPInput
                    length={6}
                    value={formData.otp}
                    onChange={(otp) => setFormData(prev => ({ ...prev, otp }))}
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm text-center mt-3 font-medium">{errors.otp}</p>
                  )}
                </div>

                <div className="w-full space-y-4 pt-2">
                  <Button
                    type="button"
                    className="w-full h-12 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-all"
                    onClick={handleValidateOtp}
                    disabled={validateOtpPending || formData.otp.length < 6}
                  >
                    {validateOtpPending ? 'Verifying...' : 'Verify Email'}
                  </Button>

                  <div className="flex flex-col items-center gap-4 text-sm">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendOtpPending}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${sendOtpPending ? 'animate-spin' : ''}`} />
                      {sendOtpPending ? 'Sending...' : 'Resend new code'}
                    </button>

                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 font-medium"
                      onClick={() => handleToggleMode('register')}
                    >
                      Change Email
                    </button>
                  </div>
                </div>
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
                      className={`sm:h-[3rem] pr-10 ${errors.password ? 'border-orange-500' : ''
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
                      className={`sm:h-[3rem] pr-10 ${errors.confirmPassword ? 'border-orange-500' : ''
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
              <div className="space-y-4">
                {step === 'enter-email' && (
                  <div className="flex justify-center w-full">
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="justify-center w-full max-w-sm bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold"
                      disabled={sendOtpPending}
                    >
                      {sendOtpPending ? 'Sending...' : 'Next'}
                    </Button>
                  </div>
                )}
                {step === 'registration-form' && (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('enter-email')}
                      className="flex-1 justify-center h-12"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 justify-center bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold"
                    >
                      Next
                    </Button>
                  </div>
                )}
                {step === 'address-details' && (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('registration-form')}
                      className="flex-1 justify-center h-12"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 justify-center bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold"
                      disabled={isPending}
                    >
                      {isPending ? 'Submitting...' : 'Sign Up'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* add google */}
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
