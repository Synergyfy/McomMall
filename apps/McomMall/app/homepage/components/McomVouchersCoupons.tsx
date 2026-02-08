import React, { useState } from 'react';
import LazyYouTubeVideo from '@/app/components/LazyYouTubeVideo';

// Tab data
const tabs: { id: 'vouchers' | 'coupons'; name: string }[] = [
  { id: 'vouchers', name: 'Mcom Voucher' },
  { id: 'coupons', name: 'Mcom Coupons' },
];

// Content for each tab
const contentData = {
  vouchers: {
    title: 'Unlock Exclusive Savings with Mcom Vouchers',
    description:
      'Gain a competitive edge in your Master of Commerce studies. Our voucher system provides incredible discounts on essential textbooks, online courses, and academic software. Maximize your learning potential while minimizing costs.',
    buttonText: 'Explore Voucher Deals',
    buttonLink: '/vouchers',
    videoUrl: 'https://www.youtube.com/embed/YykjpeuMNEk',
  },
  coupons: {
    title: 'Get Instant Discounts with Mcom Coupons',
    description:
      'Instantly apply coupons at checkout for your Mcom resources. We partner with top educational providers to bring you exclusive coupon codes that make your study materials more affordable than ever.',
    buttonText: 'Find Coupons Now',
    buttonLink: '/coupons',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
};

// Arrow Icon for the button
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

// Main Voucher Component
export default function McomVouchersCoupons() {
  const [activeTab, setActiveTab] = useState<'vouchers' | 'coupons'>(
    'vouchers'
  );

  const currentContent = contentData[activeTab];

  return (
    <section className="bg-white w-full py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-12">
          <nav
            className="-mb-px flex space-x-4 sm:space-x-8 justify-center"
            aria-label="Tabs"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-base sm:py-4 sm:text-lg transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              {currentContent.title}
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
              {currentContent.description}
            </p>
            <div className="mt-8">
              <a
                href="/coupons"
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border border-transparent text-base font-medium rounded-full text-white bg-orange-600 hover:bg-orange-700 transition-transform duration-200 hover:scale-105"
              >
                {currentContent.buttonText}
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Right Side: YouTube Video */}
          <div className="w-full h-[300px] md:h-[450px]">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
              <LazyYouTubeVideo
                videoId={currentContent.videoUrl.split('/').pop() || ''}
                title={currentContent.title}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
