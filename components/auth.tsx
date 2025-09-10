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
import { TermsCondtion } from './terms-condition';
import { RememberMe } from './remember-me';
import { useState } from 'react';
import { toast } from 'sonner';
import { ErrorResponse, useCreateUser, useLogin } from '@/service/auth/hook';
import { UserRole } from '@/service/auth/types';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/service/store/store';
import { setLoginModalOpen } from '@/service/store/uiSlice';

const Auth = ({
  children,
  redirect,
}: {
  children?: React.ReactNode;
  redirect: string | null;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { isLoginModalOpen } = useSelector((state: RootState) => state.ui);
  const [newAccount, setNewAccount] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    terms: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { isPending, mutateAsync } = useCreateUser();
  const { isPending: loginPending, mutateAsync: loginAsync } = useLogin();

  const router = useRouter();

  const isValidRedirect = (path: string | null) => {
    if (!path) return false;
    // Basic validation: path should start with '/' and not contain '://' or '//' to prevent open redirects.
    return path.startsWith('/') && !path.includes('://') && !path.startsWith('//');
  };

  const handleToggleMode = (mode: boolean) => {
    setNewAccount(mode);
    setSelectedRole(null);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      terms: '',
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
    };

    if (newAccount) {
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

    if (newAccount) {
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
    } else {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (newAccount && selectedRole) {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: selectedRole,
      };

      try {
        const response = await mutateAsync(payload);

        toast.success('Account created successfully!', {
          description: `Welcome, ${response.name}! Please log in to continue.`,
        });
        handleToggleMode(false); // Switch to login mode after successful signup
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        toast.error('Failed to create account', {
          description: err?.message || 'An unexpected error occurred.',
        });
      }
    } else {
      try {
        const response = await loginAsync({
          email: formData.email,
          password: formData.password,
        });

        toast.success('Login successful', {
          description: `Welcome, ${response.name}!`,
        });
        handleToggleMode(false); // Switch to login mode after successful signup
        dispatch(setLoginModalOpen(false)); // Close the modal
        if (isValidRedirect(redirect)) {
          router.push(redirect as string);
        } else {
          router.push('/dashboard'); // Redirect to dashboard after login
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
          <div>
            <div className="flex justify-center mb-4">
              <Button
                variant="link"
                className={`mr-4 text-lg ${
                  !newAccount ? 'text-orange-500' : 'text-gray-400'
                }`}
                onClick={() => handleToggleMode(false)}
              >
                Log In
              </Button>
              <Button
                variant="link"
                className={`text-lg ${
                  newAccount ? 'text-orange-500' : 'text-gray-400'
                }`}
                onClick={() => handleToggleMode(true)}
              >
                Register
              </Button>
            </div>
            <hr className="w-full bg-gray-400 " />
          </div>
          <DialogTitle className="text-2xl text-orange-500 hover:text-orange-600">
            {newAccount
              ? `Create ${
                  selectedRole === UserRole.CUSTOMER
                    ? 'Customer'
                    : selectedRole === UserRole.OWNER
                    ? 'Business'
                    : ''
                } Account`
              : 'Login'}
          </DialogTitle>
          <DialogDescription className="">
            {newAccount
              ? `Create a new ${
                  selectedRole === UserRole.CUSTOMER
                    ? 'customer'
                    : selectedRole === UserRole.OWNER
                    ? 'business'
                    : ''
                } account to get started.`
              : 'Login to your account to continue.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1">
          <div>
            {newAccount && (
              <div className="flex gap-4 mb-4">
                <Button
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
            )}
            {errors.role && (
              <p className="text-orange-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>
          {newAccount && (
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
          <div className="grid gap-3">
            <Label htmlFor="email" className="text-lg">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@doe.com"
              className={`sm:h-[3rem] ${
                errors.email ? 'border-orange-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-orange-500 text-sm">{errors.email}</p>
            )}
          </div>
          {newAccount && (
            <div className="grid gap-3">
              <Label htmlFor="phoneNumber" className="text-lg">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+44 ... ... ..."
                className={`sm:h-[3rem] ${
                  errors.phoneNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
              )}
            </div>
          )}
          <div className="grid gap-3">
            <Label htmlFor="password" className="text-lg">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="your password"
              className={`sm:h-[3rem] ${
                errors.password ? 'border-orange-500' : ''
              }`}
            />
            {errors.password && (
              <p className="text-orange-500 text-sm">{errors.password}</p>
            )}
          </div>
          {newAccount && (
            <div className="grid gap-3">
              <Label htmlFor="password2" className="text-lg">
                Confirm Password
              </Label>
              <Input
                id="password2"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="confirm password"
                className={`sm:h-[3rem] ${
                  errors.confirmPassword ? 'border-orange-500' : ''
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-orange text-sm">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}
        </div>
        {!newAccount && (
          <Button variant="link" className="justify-start primaryText p-0">
            Forgotten your password? Reset
          </Button>
        )}
        {newAccount && (
          <TermsCondtion
            isChecked={termsAccepted}
            onChange={handleTermsChange}
          />
        )}
        {newAccount && errors.terms && (
          <p className="text-orange-500 text-sm mt-1">{errors.terms}</p>
        )}
        {!newAccount && <RememberMe />}
        <DialogFooter className="flex flex-col justify-between mt-4">
          <DialogClose asChild className="hidden sm:block">
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            className="justify-start w-fit bg-orange-500 hover:bg-orange-600"
            onClick={handleSubmit}
            disabled={isPending || loginPending}
          >
            {isPending || loginPending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
