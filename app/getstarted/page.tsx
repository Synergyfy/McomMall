'use client';

import Link from 'next/link';

export default function GetStartedPage() {
  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row">

      {/* Left Section (Desktop Only) - Marketing/Decorative */}
      <div className="hidden md:flex relative w-1/2 flex-col justify-center px-12 py-12 text-white bg-gradient-to-br from-[#0f4c46] to-[#06332f]">

        {/* Background Overlay/Texture if needed */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />

        <div className="relative z-10 max-w-lg">
          <div className="mb-12">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Revolutionize <br />
              Commerce with <br />
              McomMall.
            </h1>
            <p className="text-lg text-gray-200">
              Experience the future of buying and selling. Seamless, secure, and designed for growth.
            </p>
          </div>

          {/* Testimonial Card */}
          <div className="bg-[#1a5f58] p-6 rounded-xl border border-[#2d7a72] backdrop-blur-sm bg-opacity-80">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white font-medium mb-4 leading-relaxed">
              "McomMall has completely transformed how I run my business. The platform is intuitive, and the affiliate program is a game-changer for passive income."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                {/* Placeholder for user avatar if available, otherwise generic */}
                <div className="w-full h-full bg-orange-500 flex items-center justify-center text-sm font-bold">
                  JD
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">John Doe</p>
                <p className="text-xs text-gray-300">Entrepreneur & Affiliate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative footer on left side */}
        <div className="absolute bottom-8 left-12 text-xs text-gray-400">
           © {new Date().getFullYear()} McomMall. All rights reserved.
        </div>
      </div>

      {/* Right Section (Full width mobile, 1/2 desktop) - Functional */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8 min-h-screen relative">

        {/* Mobile Header Logo (Visible only on mobile if needed, or rely on global header)
            But typically getstarted pages have their own branding flow.
        */}
        <div className="md:hidden absolute top-6 mb-8">
           <span className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">M</span>
        </div>

        <div className="w-full max-w-md text-center pt-10 md:pt-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Buy and Sell on Mcom
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            Join our marketplace to discover, buy, and sell products and services with ease.
          </p>

          <div className="space-y-4">
            <Link
              href="/signup"
              className="block w-full rounded-lg bg-orange-700 hover:bg-orange-800 text-white py-3.5 text-lg font-semibold shadow-lg transition-transform hover:scale-[1.02]"
            >
              Create Account
            </Link>

            <Link
              href="/getstarted/agent"
              className="block w-full rounded-lg border-2 border-orange-700 text-orange-700 hover:bg-orange-50 py-3.5 text-lg font-semibold transition-transform hover:scale-[1.02]"
            >
              Become an Affiliate
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-gray-600">
              I already have an account.{' '}
              <Link href="/signin" className="font-semibold text-orange-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-6 w-full text-center text-xs text-gray-400 px-4">
          By proceeding, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-600">terms of use</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">privacy policy</Link>.
        </div>
      </div>

    </main>
  );
}
