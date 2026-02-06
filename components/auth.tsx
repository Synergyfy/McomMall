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
          router.push('/');
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
        else router.push('/');
    } catch (error: unknown) {
        const err = error as ErrorResponse;
        toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className={`w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md transition-all duration-300`}>
        
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
                {mode === 'login' ? 'Login' : 'Create Account'}
            </h1>
            {mode === 'register' && step === 'enter-otp' && <p className="text-sm text-gray-600">Enter OTP sent to {formData.email}</p>}
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
                        <Input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className={errors.password ? 'border-red-500' : ''} />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loginPending}>
                        {loginPending ? 'Logging in...' : 'Sign In'}
                    </Button>
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                             Don't have an account? <button type="button" onClick={() => handleToggleMode('register')} className="text-orange-600 font-bold hover:underline">Sign Up</button>
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
                                <Input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className={errors.password ? 'border-red-500' : ''} />
                             </div>
                             <div className="grid gap-2">
                                <Label>Confirm Password</Label>
                                <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" className={errors.confirmPassword ? 'border-red-500' : ''} />
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
      </div>
    </div>
  );
};

export default Auth;