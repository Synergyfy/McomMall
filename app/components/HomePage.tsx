import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, ArrowRight, Heart, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Winter from '@/public/homepage/WinterSale.png';
import Summer from '@/public/homepage/SummerBanner.png';
import Spring from '@/public/homepage/SpringBanner.png';
import Autumn from '@/public/homepage/AutumnBanner.png';
import Image from 'next/image';
import { businessCategories } from '@/lib/business-categories';
import { useGetRecentListings } from '@/service/listings/hook';

// Dynamically import components
const McomFeatureSection = dynamic(() => import('../homepage/components/McomFeatureSection').then(mod => mod.McomFeatureSection));
const SeasonalMarketingSection = dynamic(() => import('../homepage/components/SeasonalMarketingSection').then(mod => mod.SeasonalMarketingSection));
const McomMallBrandsSection = dynamic(() => import('../homepage/components/McomMallBrandsSection').then(mod => mod.McomMallBrandsSection));
const BusinessCategoriesSection = dynamic(() => import('../homepage/components/BusinessCategoriesSection').then(mod => mod.BusinessCategoriesSection));
const McomEgiftCard = dynamic(() => import('../homepage/components/McomEgiftCard').then(mod => mod.McomEgiftCard));
const VirtualCardCarousel = dynamic(() => import('../homepage/components/VirtualCardCarousel'));
const HowItWorks = dynamic(() => import('../homepage/components/HowItWorks'));
const AuditSection = dynamic(() => import('../homepage/components/AuditSection').then(mod => mod.AuditSection));
const VCardFeaturesSection = dynamic(() => import('../homepage/components/VCardFeatures'));
const McomVouchersCoupons = dynamic(() => import('../homepage/components/McomVouchersCoupons'));
const McomSolutions = dynamic(() => import('../homepage/components/McomSolutions'));
const LoyaltyProgramSection = dynamic(() => import('../homepage/components/LoyaltyProgramSection'));
const Footer = dynamic(() => import('@/components/Footer'));

// --- Helper Components ---
const ScrollAnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
};

const blogPosts = [
  {
    title: 'How To Find Best Food Restaurant In Adlin',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop',
  },
  {
    title: 'Best Winter Collection In AdlinIn 2022',
    category: 'Collection',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1572804013427-4d714e280592?q=80&w=300&auto=format&fit=crop',
  },
  {
    title: 'Best Watch Listed In 2022',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop',
  },
  {
    title: 'Best Racing Car Listed In 2022',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1553440569-99424e1bf07c?q=80&w=300&auto=format&fit=crop',
  },
];

// --- SVG Components ---
const SwirlArrow = () => (
  <svg
    width="100"
    height="50"
    viewBox="0 0 132 58"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute -bottom-8 right-0 md:-bottom-4 md:right-16 w-20 md:w-32 text-white"
  >
    <motion.path
      d="M130.5 1C112.5 1.5 98.5 10.3333 94 16C82.9924 32.2217 93.5 45 111.5 45C118.667 45 125.6 42.8 130 39.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, delay: 1, ease: 'easeInOut' }}
    />
    <motion.path
      d="M1 56.5C13.5 54.1667 31.8 45.5 39.5 35C50.5 19.5 36 6.5 22.5 1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, delay: 1, ease: 'easeInOut' }}
    />
  </svg>
);

// --- Main App Component ---
export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searchError, setSearchError] = useState('');
  const router = useRouter();
  const {
    data: recentListings,
    isLoading,
    isError,
  } = useGetRecentListings();

  const backgroundImages = [Autumn, Summer, Spring, Winter];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(
        prevIndex => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  // Effect for back to top button visibility
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showBackToTop && window.pageYOffset > 400) {
        setShowBackToTop(true);
      } else if (showBackToTop && window.pageYOffset <= 400) {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showBackToTop]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter something to search for.');
      return;
    }
    setSearchError(''); // Clear error if search is valid
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="bg-[#fafafa] font-sans relative">
      <main>
        {/* --- Hero Section with Animated Background --- */}
        <section className="relative h-[80vh] md:h-[70vh] w-full text-white overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <Image
                src={backgroundImages[currentImageIndex]}
                layout="fill"
                objectFit="cover"
                priority
                alt="Seasonal background"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <motion.h1
              className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Find The Best Amenity In <br className="hidden sm:block" /> Your
              Neighbourhood
              <SwirlArrow />
            </motion.h1>

            <motion.div
              className="mt-8 bg-white rounded-lg p-2 md:p-4 w-full max-w-3xl flex flex-col md:flex-row items-center gap-2 md:gap-4 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-full md:w-auto flex-1 flex items-center border-b md:border-b-0 md:border-r border-gray-200 p-2">
                <Search className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent focus:outline-none text-black placeholder:text-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="w-full md:w-auto flex-1 flex items-center p-2">
                <MapPin className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-transparent focus:outline-none text-black placeholder:text-sm"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <motion.button
                className="bg-[#f58220] text-white font-bold py-3 px-6 rounded-lg w-full md:w-auto flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
              >
                <span className="md:hidden">
                  <ArrowRight size={20} />
                </span>
                <span className="hidden md:block">Search Now</span>
              </motion.button>
            </motion.div>

            {searchError && (
              <motion.p
                className="mt-2 text-red-400 bg-white/20 backdrop-blur-sm p-2 rounded-md font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {searchError}
              </motion.p>
            )}

            <motion.div
              className="mt-6 text-sm text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4">
                <span className="font-semibold">Popular:</span>
                {businessCategories.slice(0, 4).map(category => (
                  <Link
                    key={category.name}
                    href={`/listings?category=${encodeURIComponent(
                      category.name
                    )}`}
                    className="underline hover:text-orange-300"
                  >
                    {category.name}
                  </Link>
                ))}
                <Link
                  href="/listings?showFilters=true"
                  className="font-bold hover:text-orange-300"
                >
                  + See All
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <HowItWorks />

        {/* --- Categories Section --- */}

        <BusinessCategoriesSection />

        {/* --- Recent Listings Section --- */}
        <ScrollAnimatedSection>
          <div className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              Recent Listings
            </h2>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              <AnimatePresence>
                {isLoading ? (
                  <p>Loading...</p>
                ) : isError ? (
                  <p>Error fetching listings.</p>
                ) : (
                  recentListings?.slice(0, 3).map(ad => (
                    <motion.div
                      key={ad.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
                    >
                      <Image
                        src={`https://source.unsplash.com/random/300x200?sig=${ad.id}`}
                        alt={ad.businessName}
                        width={300}
                        height={200}
                        loading="lazy"
                        className="w-full h-48 object-cover"
                      />
                      <div className="flex flex-col justify-between w-full p-4">
                        <div>
                          <div className="flex justify-between items-start">
                            <Link href={`/listings/${ad.id}`}>
                              <h3 className="font-bold text-lg mb-2 hover:underline">
                                {ad.businessName}
                              </h3>
                            </Link>
                            <button className="text-gray-400 hover:text-red-500">
                              <Heart />
                            </button>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mb-1">
                            <MapPin size={16} className="mr-2" />{' '}
                            {ad.location.addressLine1}, {ad.location.city}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mb-4">
                            <span className="mr-4">
                              🕒{' '}
                              {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                            {ad.categories[0]?.name}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </ScrollAnimatedSection>

        {/* NEW SECTION */}
        <McomFeatureSection />
        <SeasonalMarketingSection />
        <AuditSection />
        <LoyaltyProgramSection />
        {/* <StockAuditSection /> */}
        <McomEgiftCard />
        <VirtualCardCarousel />
        <VCardFeaturesSection />
        <McomVouchersCoupons />
        <McomSolutions />

        <McomMallBrandsSection />
        {/* NEW SECTION ENDS */}
      </main>

      {/* --- Our Latest Blog Post Section --- */}
      <ScrollAnimatedSection>
        <div className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Our Latest Blog Post
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden group"
              >
                <div className="relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={300}
                    height={200}
                    loading="lazy"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                    {post.date}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-gray-500 text-sm font-semibold">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-lg mt-2 mb-4 h-14">
                    {post.title}
                  </h3>
                  <Link
                    href="#"
                    className="text-[#f58220] font-semibold hover:underline"
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollAnimatedSection>

      {/* --- Footer Section --- */}
      <Footer />

      {/* --- Back to Top Button --- */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-[#f58220] text-white p-3 rounded-full shadow-lg z-50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
