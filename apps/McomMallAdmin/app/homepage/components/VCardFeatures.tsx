import React, { useRef } from 'react';

// Mock data for the feature cards
const features = [
  {
    title: 'Share Your Brand Journey',
    description:
      'Share your business information with prospects directly via SMS, Email, or any other way.',
    imageUrl:
      'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Scan QR Code',
    description:
      'By scanning your QR Code, your client can see your details and also share your QR Code with others.',
    imageUrl:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Social Media Links',
    description:
      'Your client can follow you on social media. You can also increase your business by sharing your social link.',
    imageUrl:
      'https://images.unsplash.com/photo-1583864697784-a0efc8379f70?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Various Range of Templates',
    description:
      'You can select various templates for your vCards and share them with your clients.',
    imageUrl:
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Pricing And Plans',
    description:
      'We provide various plan from which you can choose a plan according to your requirement.',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Easy Customization',
    description:
      "Customize your digital card's colors, layout, and fonts to perfectly match your brand identity.",
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

// Reusable FeatureCard component
const FeatureCard = ({
  title,
  description,
  imageUrl,
}: {
  title:string;
  description: string;
  imageUrl: string;
}) => (
  <div className="w-[80vw] flex-shrink-0 rounded-2xl bg-white p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg sm:w-64">
    <div className="flex justify-center mb-4">
      <img
        src={imageUrl}
        alt={title}
        width={80}
        height={80}
        className="rounded-full object-cover"
      />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

// Main Features component
export default function VCardFeaturesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // The amount to scroll is the width of one card plus its gap
      const scrollAmount = current.offsetWidth * 0.8;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Icon components for better semantics
  const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );

  const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );

  // Button component (shadcn/ui inspired)
  const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 bg-orange-600 text-white hover:bg-orange-700 ${className}`}
      {...props}
    />
  ));
  Button.displayName = 'Button';

  return (
    <section className="bg-gray-50 w-full py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Features
            </h2>
            <div className="w-16 h-1 bg-orange-600 rounded-full mt-2"></div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Button onClick={() => scroll('left')} aria-label="Scroll left">
              <ChevronLeftIcon className="h-6 w-6" />
            </Button>
            <Button onClick={() => scroll('right')} aria-label="Scroll right">
              <ChevronRightIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Scrollable container for feature cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 -mb-4 snap-x snap-mandatory scrollbar-hide"
        >
          {features.map((feature, index) => (
            <div key={index} className="snap-center">
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
