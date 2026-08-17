'use client';

import type { NextPage } from 'next';
import {
  AlertCircle,
  Eye,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Upload,
  Youtube,
  User as UserIcon,
  MapPin,
} from 'lucide-react';
import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import {
  useGetUserProfile,
  useUpdateUserProfile,
} from '../../../service/user/hook';
import {
  useSendOtp,
  useValidateOtp,
  useResetPassword,
} from '../../../service/auth/hook';
import { User, Socials } from '../../../service/user/types';
import { toast } from 'sonner';
import { uploadFile } from '../../../lib/upload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddressList from './components/AddressList';
import MediaCropper from '../add-listing/components/steps/shared/MediaCropper';

type SocialPlatform =
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'instagram'
  | 'youtube';

const socialIcons: { [key in SocialPlatform]: React.ElementType } = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
};

type PasswordFields = {
  new: string;
  confirm: string;
};

type ProfileErrors = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  socials?: { [key in SocialPlatform]?: string };
  avatar?: string;
};

type PasswordErrors = {
  [key in keyof PasswordFields]?: string;
};

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
}

interface PasswordFieldProps extends Omit<InputFieldProps, 'type' | 'id'> {
  id: keyof PasswordFields;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface SocialInputFieldProps {
  platform: SocialPlatform;
  url: string;
  onChange: (platform: SocialPlatform, url: string) => void;
  error?: string;
}

// --- UI Components ---

const InputField = ({
  label,
  id,
  type = 'text',
  value,
  placeholder,
  onChange,
  disabled = false,
  error,
}: InputFieldProps) => (
  <div>
    <label
      htmlFor={id}
      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`block w-full rounded-md p-2.5 text-gray-900 shadow-sm sm:text-sm ${error
        ? 'border-red-500 ring-1 ring-red-500'
        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
    />
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const PasswordField = ({
  label,
  id,
  value,
  placeholder,
  onChange,
  error,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={isVisible ? 'text' : 'password'}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full rounded-md p-2.5 pr-10 text-gray-900 shadow-sm sm:text-sm ${error
            ? 'border-red-500 ring-1 ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            } bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

const SocialInputField = ({
  platform,
  url,
  onChange,
  error,
}: SocialInputFieldProps) => {
  const Icon = socialIcons[platform];
  return (
    <div>
      <label
        htmlFor={platform}
        className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <Icon className="h-4 w-4" />
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </label>
      <input
        type="text"
        id={platform}
        value={url}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(platform, e.target.value)
        }
        className={`block w-full rounded-md p-2.5 text-gray-900 shadow-sm sm:text-sm ${error
          ? 'border-red-500 ring-1 ring-red-500'
          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          } bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

// --- Main Page Component ---

const MyProfilePage: NextPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserProfile();
  const updateUserMutation = useUpdateUserProfile();
  const sendOtpMutation = useSendOtp();
  const validateOtpMutation = useValidateOtp();
  const resetPasswordMutation = useResetPassword();

  const [profile, setProfile] = useState<Partial<User>>({});
  const [initialProfile, setInitialProfile] = useState<Partial<User>>({});
  const [socials, setSocials] = useState<Partial<Socials>>({});
  const [initialSocials, setInitialSocials] = useState<Partial<Socials>>({});

  // Password Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'EMAIL' | 'OTP' | 'PASSWORD'>('EMAIL');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState<PasswordFields>({
    new: '',
    confirm: '',
  });

  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCropping, setIsCropping] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const initialProfileData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };
      const initialSocialsData = user.socials || {};

      setProfile(initialProfileData);
      setInitialProfile(initialProfileData);
      setSocials(initialSocialsData);
      setInitialSocials(initialSocialsData);
      setAvatarPreview(
        user.profilePictureUrl ||
        'https://placehold.co/150x150/EFEFEF/333333?text=User'
      );
    }
  }, [user]);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
    if (profileErrors[id as keyof ProfileErrors]) {
      setProfileErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSocialChange = (platform: SocialPlatform, url: string): void => {
    setSocials(prev => ({ ...prev, [platform]: url }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileErrors(prev => ({
          ...prev,
          avatar: 'Invalid file type. Only images are allowed.',
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setProfileErrors(prev => ({
          ...prev,
          avatar: 'File size exceeds the 5MB limit.',
        }));
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsCropping(true); // Open cropper after selection
      };
      reader.readAsDataURL(file);
      setProfileErrors(prev => ({ ...prev, avatar: undefined }));
    }
  };

  const handleCropSave = (croppedFile: File) => {
    setAvatarFile(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    setIsCropping(false);
  };

  const handleProfileSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setProfileErrors({});

    const profileHasChanged =
      JSON.stringify(profile) !== JSON.stringify(initialProfile);
    const socialsHaveChanged =
      JSON.stringify(socials) !== JSON.stringify(initialSocials);
    const avatarHasChanged = avatarFile !== null;

    if (!profileHasChanged && !socialsHaveChanged && !avatarHasChanged) {
      toast.info('No changes to save.');
      return;
    }

    const newErrors: ProfileErrors = {};
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (profile.firstName !== initialProfile.firstName) {
      if (profile.firstName && profile.firstName.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters long.';
      }
    }
    if (profile.lastName !== initialProfile.lastName) {
      if (profile.lastName && profile.lastName.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters long.';
      }
    }

    if (profile.phoneNumber !== initialProfile.phoneNumber) {
      if (
        profile.phoneNumber &&
        !/^\+?[0-9\s-()]{7,20}$/.test(profile.phoneNumber)
      ) {
        newErrors.phoneNumber = 'Please enter a valid phone number.';
      }
    }

    const socialErrors: { [key in SocialPlatform]?: string } = {};
    for (const platform of Object.keys(socials) as SocialPlatform[]) {
      if (socials[platform] !== initialSocials[platform]) {
        if (socials[platform] && !urlRegex.test(socials[platform] as string)) {
          socialErrors[platform] = 'Please enter a valid URL.';
        }
      }
    }
    if (Object.keys(socialErrors).length > 0) {
      newErrors.socials = socialErrors;
    }

    if (avatarFile) {
      if (!avatarFile.type.startsWith('image/')) {
        newErrors.avatar = 'Invalid file type. Only images are allowed.';
      } else if (avatarFile.size > 5 * 1024 * 1024) {
        newErrors.avatar = 'File size exceeds the 5MB limit.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      toast.error('Please correct the errors before submitting.');
      return;
    }

    let profilePictureUrl: string | undefined = undefined;
    if (avatarFile) {
      setIsUploading(true);
      try {
        const { secure_url } = await uploadFile(avatarFile);
        profilePictureUrl = secure_url;
      } catch (error) {
        toast.error('Failed to upload image. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const { ...socialsToUpdate } = socials;
    if (!user) return;

    updateUserMutation.mutate(
      {
        id: user.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        socials: socialsToUpdate,
        profilePictureUrl,
      },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully!');
          setAvatarFile(null);
        },
        onError: (error) => {
          toast.error(`Failed to update profile: ${error.message}`);
        },
      }
    );
  };

  const openResetModal = () => {
    setResetStep('EMAIL');
    setOtpCode('');
    setOtpError(null);
    setPasswords({ new: '', confirm: '' });
    setPasswordErrors({});
    setIsResetModalOpen(true);
  };

  const handleSendOtp = () => {
    if (!profile.email) {
      toast.error("Email is missing from profile.");
      return;
    }
    sendOtpMutation.mutate(
      { email: profile.email, type: 'PASSWORD_RESET' },
      {
        onSuccess: () => {
          toast.success('OTP sent to your email.');
          setResetStep('OTP');
        },
        onError: (error) => {
          toast.error(error.message || "Failed to send OTP");
        },
      }
    );
  };

  const handleValidateOtp = () => {
    if (!profile.email) return;
    setOtpError(null);
    if (!otpCode) {
      setOtpError('Please enter the OTP code.');
      return;
    }

    if (otpCode.length !== 6) {
      setOtpError('Code must be 6 digits');
      return;
    }

    validateOtpMutation.mutate(
      { email: profile.email, otp: otpCode, type: 'PASSWORD_RESET' },
      {
        onSuccess: () => {
          toast.success('OTP validated successfully.');
          setResetStep('PASSWORD');
        },
        onError: (error) => {
          const message = error.message || "Failed to validate OTP";
          if (message.includes("Invalid OTP") || message.includes("Request failed with status code 404")) {
            setOtpError("Code not correct");
            toast.error("Code not correct");
          } else {
            setOtpError(message);
            toast.error(message);
          }
        },
      }
    );
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setPasswords(prev => ({ ...prev, [id]: value }));
    if (passwordErrors[id as keyof PasswordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleResetSubmit = () => {
    const { new: newPass, confirm } = passwords;
    const errors: PasswordErrors = {};

    if (!newPass) {
      errors.new = 'New password is required.';
    } else if (newPass.length < 12) {
      errors.new = 'New password must be at least 12 characters long.';
    }
    if (!confirm) {
      errors.confirm = 'Please confirm your new password.';
    } else if (newPass && newPass !== confirm) {
      errors.confirm = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    if (!profile.email) return;

    resetPasswordMutation.mutate(
      {
        email: profile.email,
        password: newPass,
        confirmPassword: confirm,
        otp: otpCode
      },
      {
        onSuccess: () => {
          toast.success('Password reset successfully!');
          setIsResetModalOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to reset password");
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Account Settings
            </h1>
            <nav className="text-sm text-muted-foreground">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Dashboard
              </span>
            </nav>
          </div>
        </header>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
            <TabsTrigger value="profile">
              <UserIcon className="mr-2 h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="mr-2 h-4 w-4" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <form
                onSubmit={handleProfileSubmit}
                className="space-y-6 lg:col-span-2"
                noValidate
              >
                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                    Profile Details
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex flex-col items-center md:col-span-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Picture
                      </label>
                      <div
                        className="group relative mb-2 h-36 w-36 cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-2 dark:border-gray-600"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="User Avatar"
                            width="130"
                            height="130"
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-700">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <p className="text-xs text-gray-500">Upload</p>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="text-sm text-white">Change</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                        }}
                        className="text-sm text-red-600 hover:underline dark:text-red-500"
                      >
                        Remove file
                      </button>
                      {profileErrors.avatar && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {profileErrors.avatar}
                        </p>
                      )}
                    </div>
                    <div className="space-y-6 md:col-span-2">
                      <InputField
                        label="First Name"
                        id="firstName"
                        value={profile.firstName || ''}
                        onChange={handleProfileChange}
                        error={profileErrors.firstName}
                      />
                      <InputField
                        label="Last Name"
                        id="lastName"
                        value={profile.lastName || ''}
                        onChange={handleProfileChange}
                        error={profileErrors.lastName}
                      />
                    </div>
                  </div>
                  <div className="mt-6 space-y-6">
                    <InputField
                      label="Mobile Number"
                      id="phoneNumber"
                      value={profile.phoneNumber || ''}
                      onChange={handleProfileChange}
                      error={profileErrors.phoneNumber}
                    />
                    <InputField
                      label="E-mail"
                      id="email"
                      value={profile.email || ''}
                      onChange={handleProfileChange}
                      disabled={true}
                      error={profileErrors.email}
                    />
                    {(
                      Object.keys(socialIcons) as SocialPlatform[]
                    ).map(platform => (
                      <SocialInputField
                        key={platform}
                        platform={platform}
                        url={socials[platform as keyof typeof socials] || ''}
                        onChange={handleSocialChange}
                        error={profileErrors.socials?.[platform]}
                      />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      disabled={updateUserMutation.isPending || isUploading}
                    >
                      {isUploading
                        ? 'Uploading...'
                        : updateUserMutation.isPending
                          ? 'Saving...'
                          : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>

              <div className="lg:col-span-1">
                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                    Security
                  </h2>
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Manage your password and security settings.
                    </p>
                    <button
                      type="button"
                      onClick={openResetModal}
                      className="w-full rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </TabsContent>

          <TabsContent value="addresses">
            <AddressList />
          </TabsContent>
        </Tabs>

        <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Follow the steps to reset your password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {resetStep === 'EMAIL' && (
                <div className="space-y-4">
                  <InputField
                    label="Confirm Email Address"
                    id="reset-email"
                    value={profile.email || ''}
                    onChange={() => { }}
                    disabled={true}
                    placeholder="Your email address"
                  />
                  <p className="text-sm text-muted-foreground">
                    We will send a verification code to this email.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendOtp}
                      disabled={sendOtpMutation.isPending}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {sendOtpMutation.isPending ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </div>
              )}

              {resetStep === 'OTP' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value);
                        if (otpError) setOtpError(null);
                      }}
                      placeholder="Enter the code sent to your email"
                      className={`block w-full rounded-md p-2.5 text-gray-900 shadow-sm sm:text-sm ${otpError
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        } bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                    />
                    {otpError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{otpError}</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResetStep('EMAIL')}
                      className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleValidateOtp}
                      disabled={validateOtpMutation.isPending}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {validateOtpMutation.isPending ? 'Validating...' : 'Verify Code'}
                    </button>
                  </div>
                </div>
              )}

              {resetStep === 'PASSWORD' && (
                <div className="space-y-4">
                  <PasswordField
                    label="New Password"
                    id="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    error={passwordErrors.new}
                  />
                  <PasswordField
                    label="Confirm New Password"
                    id="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    error={passwordErrors.confirm}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleResetSubmit}
                      disabled={resetPasswordMutation.isPending}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {isCropping && avatarPreview && (
          <MediaCropper
            isOpen={isCropping}
            onClose={() => setIsCropping(false)}
            mediaUrl={avatarPreview}
            mediaType="image"
            onCropSave={handleCropSave}
            aspect={1} // Square aspect for profile picture
          />
        )}

      </div>
    </div>
  );
};

export default MyProfilePage;
