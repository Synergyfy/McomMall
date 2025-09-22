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
} from 'lucide-react';
import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import {
  useGetUserProfile,
  useUpdateUserProfile,
} from '../../../service/user/hook';
import { User, Socials } from '../../../service/user/types';
import { toast } from 'sonner';
import { uploadFile } from '../../../lib/upload';

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
  current: string;
  new: string;
  confirm: string;
};

type ProfileErrors = {
  name?: string;
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
      className={`block w-full rounded-md p-2.5 text-gray-900 shadow-sm sm:text-sm ${
        error
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
          className={`block w-full rounded-md p-2.5 pr-10 text-gray-900 shadow-sm sm:text-sm ${
            error
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
        className={`block w-full rounded-md p-2.5 text-gray-900 shadow-sm sm:text-sm ${
          error
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

const InfoAlert = ({
  message,
  type,
}: {
  message: string;
  type: 'info' | 'warning';
}) => {
  const baseClasses = 'flex items-start space-x-3 rounded-lg border p-4';
  const typeClasses = {
    info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    warning:
      'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  };
  const iconColor = type === 'info' ? 'text-blue-500' : 'text-yellow-500';

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <AlertCircle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor}`} />
      <p className="text-sm">{message}</p>
    </div>
  );
};

const MyProfilePage: NextPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserProfile();
  const updateUserMutation = useUpdateUserProfile();

  const [profile, setProfile] = useState<Partial<User>>({});
  const [initialProfile, setInitialProfile] = useState<Partial<User>>({});
  const [socials, setSocials] = useState<Partial<Socials>>({});
  const [initialSocials, setInitialSocials] = useState<Partial<Socials>>({});
  const [passwords, setPasswords] = useState<PasswordFields>({
    current: '',
    new: '',
    confirm: '',
  });

  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const initialProfileData = {
        name: user.name,
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

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setPasswords(prev => ({ ...prev, [id]: value }));
    if (passwordErrors[id as keyof PasswordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSocialChange = (platform: SocialPlatform, url: string): void => {
    setSocials(prev => ({ ...prev, [platform]: url }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setProfileErrors(prev => ({
          ...prev,
          avatar: 'Invalid file type. Only images are allowed.',
        }));
        return;
      }

      // Validate file size (5MB limit)
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
      };
      reader.readAsDataURL(file);
      setProfileErrors(prev => ({ ...prev, avatar: undefined }));
    }
  };

  const validatePasswords = (): boolean => {
    const errors: PasswordErrors = {};
    const { current, new: newPass, confirm } = passwords;

    // Only validate if user starts filling any of the password fields
    if (current || newPass || confirm) {
      if (!current) {
        errors.current = 'Current password is required to change password.';
      }
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
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setProfileErrors({}); // Clear previous errors

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

    // Validate only changed fields
    if (profile.name !== initialProfile.name) {
      if (profile.name && profile.name.trim().length < 2) {
        newErrors.name = 'Full name must be at least 2 characters long.';
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
        name: profile.name,
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

  const handlePasswordSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (validatePasswords()) {
      // Implement password change logic here
      toast.success('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              My Profile
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
                  <div
                    className="group relative mb-2 h-36 w-36 cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-2 dark:border-gray-600"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <Image
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
                    label="Full Name"
                    id="name"
                    value={profile.name || ''}
                    onChange={handleProfileChange}
                    error={profileErrors.name}
                  />
                </div>
              </div>
              <div className="mt-6 space-y-6">
                <InfoAlert
                  message="For demo purposes you can type fake phone number"
                  type="warning"
                />
                <InputField
                  label="Phone"
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

          <form
            onSubmit={handlePasswordSubmit}
            className="lg:col-span-1"
            noValidate
          >
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <div className="space-y-6">
                <InfoAlert
                  message="Your password should be at least 12 random characters long to be safe"
                  type="info"
                />
                <PasswordField
                  label="Current Password"
                  id="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  error={passwordErrors.current}
                />
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
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default MyProfilePage;
