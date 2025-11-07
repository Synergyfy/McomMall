'use client';

import { useState } from 'react';

export default function AgentGetStartedPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="flex min-h-screen w-full">
      {/* Left Section */}
      <div className="relative flex h-screen w-full flex-col bg-gray-100 p-12 md:w-1/2 pt-24">
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
      <div className="relative flex h-screen w-full flex-col items-center justify-center bg-orange-600 p-8 md:w-1/2 pt-24">
        {showForm ? (
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
              Quick Profile
            </h2>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full name / Business name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email / Phone
                </label>
                <input
                  type="text"
                  id="contact"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                ></textarea>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
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
                  className="mt-1 block w-full"
                />
              </div>
              <button
                type="submit"
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
