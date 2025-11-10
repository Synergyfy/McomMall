'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type FormData = {
  name: string;
  contact: string;
  bio: string;
  rate: string;
  location: string;
  portfolio: string;
  verification: FileList;
};

export default function AgentGetStartedPage() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    router.push('/quiz/0');
  };

  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left Section */}
      <div className="relative flex w-full flex-col bg-gray-100 p-12 md:w-1/2 pt-24">
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
          <ul className="mb-8 list-disc list-inside text-gray-600">
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
      <div className="relative flex w-full flex-col items-center justify-center bg-orange-600 p-4 md:p-8 pt-24">
        {showForm ? (
          <div className="w-full max-w-md rounded-lg bg-white p-12 shadow-2xl">
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
              Quick Profile
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full name 
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block border-1 rounded-sm w-full border-gray-400 shadow-md focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
               <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block border-1 rounded-sm w-full border-gray-400 shadow-md focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="text"
                  id="contact"
                  {...register('contact', {
                    required: 'Email or phone number is required',
                    validate: (value) => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
                      return (
                        emailRegex.test(value) ||
                        phoneRegex.test(value) ||
                        'Invalid email or phone number format'
                      );
                    },
                  })}
                  className="mt-1 block w-full border-1 rounded-sm border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contact.message as string || 'Invalid email or phone number'}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700"
                >
                 Phone
                </label>
                <input
                  type="text"
                  id="contact"
                  {...register('contact', {
                    required: ' phone number is required',
                    validate: (value) => {
                      const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
                      return (
                        phoneRegex.test(value) ||
                        'Invalid phone number format'
                      );
                    },
                  })}
                  className="mt-1 block w-full border-1 rounded-sm border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contact.message as string || 'phone number'}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Short bio (50–120 characters)
                </label>
                <textarea
                  id="bio"
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
                  className="mt-1 block w-full border-1 rounded-sm border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                ></textarea>
                 {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bio.message as string}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="rate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hourly or per-session rate (optional)
                </label>
                <input
                  type="text"
                  id="rate"
                  {...register('rate')}
                  className="mt-1 block w-full border-1 rounded-sm border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country / Timezone / Languages
                </label>
                <input
                  type="text"
                  id="location"
                  {...register('location')}
                  className="mt-1 block w-full border-1 rounded-sm border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label
                  htmlFor="portfolio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Portfolio link / sample work
                </label>
                <input
                  type="url"
                  id="portfolio"
                  {...register('portfolio')}
                  className="mt-1 block w-full border-1 rounded-sm border-gray-s00 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              {/* Hidden until asked */}
              <div className="hidden">
                <label
                  htmlFor="verification"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload ID / verification docs
                </label>
                <input
                  type="file"
                  id="verification"
                  {...register('verification')}
                  className="mt-1 block w-full"
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
