'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface AgentFormValues {
  name: string;
  businessName: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  bio: string;
  rate?: string;
  location?: string;
  portfolio?: string;
  verification?: FileList;
}

export default function AgentGetStartedPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AgentFormValues>();
  const passwordValue = watch('password');

  const onSubmit: SubmitHandler<AgentFormValues> = (data) => {
    console.log(data);
    router.push('/agent-dashboard');
  };

  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left Section */}
      <div className="flex w-full md:w-1/2 flex-col bg-gray-100 p-12 pt-24">
        <div className="max-w-md">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">
            Become an Agent
          </h1>
          <p className="mb-6 text-gray-600">
            Join our network of professional agents and unlock a world of
            opportunities. Enjoy the flexibility of working on your own terms
            while we provide the tools and support you need to succeed.
          </p>
          <h2 className="mb-3 text-2xl font-semibold text-gray-800">
            Benefits of Being an Agent:
          </h2>
          <ul className="mb-8 list-disc list-inside text-gray-600 space-y-1">
            <li>Competitive commission rates</li>
            <li>Access to a wide range of clients</li>
            <li>Flexible work schedule</li>
            <li>Dedicated support team</li>
            <li>Professional development resources</li>
          </ul>
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg bg-orange-600 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-700"
          >
            Enroll Now
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 flex-col items-center justify-center bg-orange-600 p-6 md:p-12 pt-24">
        {showForm ? (
          <div className="w-full max-w-md rounded-lg bg-white p-10 shadow-2xl">
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
              Quick Profile
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business name
                </label>
                <input
                  type="text"
                  id="businessName"
                  {...register('businessName', {
                    required: 'Business name is required',
                  })}
                  className="mt-1 block border-1 rounded-sm w-full border-gray-400 shadow-md focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.businessName.message as string}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register('confirm_password', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === passwordValue || 'Passwords do not match',
                  })}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.businessName && (
                  <p className="text-sm text-red-600">
                    {errors.businessName.message as string}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[0-9\s-]{7,15}$/,
                      message: 'Invalid phone number format',
                    },
                  })}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Short bio (50–120 characters)
                </label>
                <textarea
                  rows={3}
                  {...register('bio', {
                    minLength: {
                      value: 50,
                      message: 'Bio must be at least 50 characters',
                    },
                    maxLength: {
                      value: 120,
                      message: 'Bio must be less than 120 characters',
                    },
                  })}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                ></textarea>
                {errors.bio && (
                  <p className="text-sm text-red-600">
                    {errors.bio.message as string}
                  </p>
                )}
              </div>

              {/* Optional Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hourly or per-session rate (optional)
                </label>
                <input
                  type="text"
                  {...register('rate')}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country / Timezone / Languages
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Portfolio link / sample work
                </label>
                <input
                  type="url"
                  {...register('portfolio')}
                  className="mt-1 w-full rounded-sm border border-gray-400 p-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="w-full rounded-lg bg-orange-600 py-3 text-lg font-semibold text-white transition-transform hover:scale-105 hover:bg-orange-700"
              >
                Submit Application
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold">Your Journey Starts Here</h2>
            <p className="mt-4 text-lg">
              Click the enroll button to get started.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
