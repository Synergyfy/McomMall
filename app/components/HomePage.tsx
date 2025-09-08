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

// Dynamically import components
const McomFeatureSection = dynamic(() => import('../homepage/components/McomFeatureSection').then(mod => mod.McomFeatureSection));
const SeasonalMarketingSection = dynamic(() => import('../homepage/components/SeasonalMarketingSection').then(mod => mod.SeasonalMarketingSection));
const McomMallBrandsSection = dynamic(() => import('../homepage/components/McomMallBrandsSection').then(mod => mod.McomMallBrandsSection));
const PopularCategoriesSection = dynamic(() => import('../homepage/components/PopularCategoriesSection').then(mod => mod.PopularCategoriesSection));
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

const allFeaturedAds = [
  {
    title: 'Albuquerque NM',
    location: 'California, Cape May',
    date: 'August 21, 2024',
    seller: 'adlinet',
    category: 'Place',
    price: '$156,245.00',
    image:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=300&auto-format&fit=crop',
  },
  {
    title: 'Pizza Point',
    location: 'California, Cape May',
    date: 'August 21, 2024',
    seller: 'adlinet',
    category: 'Restaurant',
    price: '$300.00',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300&auto-format&fit=crop',
  },
  {
    title: 'Modern Apartment',
    location: 'New York, NY',
    date: 'July 15, 2024',
    seller: 'cityhomes',
    category: 'Real Estate',
    price: '$2,500,000.00',
    image:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=300&auto-format&fit=crop',
  },
  {
    title: 'Cozy Cafe',
    location: 'Paris, France',
    date: 'June 02, 2024',
    seller: 'pariseats',
    category: 'Restaurant',
    price: '$500.00',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto-format&fit=crop',
  },
];

const blogPosts = [
  {
    title: 'How To Find Best Food Restaurant In Adlin',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto-format&fit=crop',
  },
  {
    title: 'Best Winter Collection In AdlinIn 2022',
    category: 'Collection',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1572804013427-4d714e280592?q=80&w=300&auto-format&fit=crop',
  },
  {
    title: 'Best Watch Listed In 2022',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto-format&fit=crop',
  },
  {
    title: 'Best Racing Car Listed In 2022',
    category: 'Listing',
    date: '16 Nov, 2022',
    image:
      'https://images.unsplash.com/photo-1553440569-99424e1bf07c?q=80&w=300&auto-format&fit=crop',
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

const McomMallLogo = ({ className = '' }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 10 L 25 25 L 40 10 L 40 40 L 25 25 L 10 40 Z"
      stroke="#f58220"
      strokeWidth="4"
      fill="none"
    />
    <path
      d="M10 10 L 25 25 L 40 10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

// --- Main App Component ---
export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeAdFilter, setActiveAdFilter] = useState('All');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searchError, setSearchError] = useState('');
  const router = useRouter();

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

  // Filtered ads based on the active tab
  const filteredAds =
    activeAdFilter === 'All'
      ? allFeaturedAds
      : allFeaturedAds.filter(ad => ad.category === activeAdFilter);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter something to search for.');
      return;
    }
    setSearchError(''); // Clear error if search is valid
    let query = searchQuery;
    if (location) {
      query = `${searchQuery} in ${location}`;
    }
    router.push(`/listings?queryText=${encodeURIComponent(query)}`);
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
        <section className="relative h-[60vh] md:h-[70vh] w-full text-white overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImages[currentImageIndex].src})`,
              }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <motion.h1
              className="text-4xl md:text-6xl font-bold leading-tight relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Find The Best Amenity In <br /> Your Neighbourhood
              <SwirlArrow />
            </motion.h1>

            <motion.div
              className="mt-12 bg-white rounded-lg p-2 md:p-4 w-full max-w-3xl flex flex-col md:flex-row items-center gap-2 md:gap-4 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-full md:w-auto flex-1 flex items-center border-b md:border-b-0 md:border-r border-gray-200 p-2">
                <Search className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Type what are you looking for..."
                  className="w-full bg-transparent focus:outline-none text-black"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="w-full md:w-auto flex-1 flex items-center p-2">
                <MapPin className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Enter Location (e.g. Canasa)"
                  className="w-full bg-transparent focus:outline-none text-black"
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
                Search Now <ArrowRight size={20} />
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
              className="mt-4 text-sm text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="font-semibold">Popular:</span>
              {businessCategories.slice(0, 5).map((category, index) => (
                <Link
                  key={index}
                  href={`/listings?category=${encodeURIComponent(
                    category.name
                  )}`}
                  className="underline hover:text-orange-300 mx-1"
                >
                  {category.name}
                  {index < 4 && ','}
                </Link>
              ))}
              <Link
                href="/listings?showFilters=true"
                className="underline hover:text-orange-300 ml-1"
              >
                View All
              </Link>
            </motion.div>
          </div>
        </section>

        <HowItWorks />

        {/* --- Categories Section --- */}

        <PopularCategoriesSection />
        <BusinessCategoriesSection />

        {/* --- Featured Ads Section --- */}
        <ScrollAnimatedSection>
          <div className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
            <h2 className="text-4xl font-bold text-center mb-4">
              Featured Ads
            </h2>
            <div className="flex justify-center gap-4 mb-8">
              {['All', 'Place', 'Restaurant', 'Real Estate', 'Others'].map(
                tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveAdFilter(tab)}
                    className={`py-2 px-5 rounded-lg font-semibold transition-colors ${
                      activeAdFilter === tab
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
            >
              <AnimatePresence>
                {filteredAds.map(ad => (
                  <motion.div
                    key={ad.title}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col sm:flex-row gap-4 p-4 hover:shadow-xl transition-shadow"
                  >
                    <Image
                      src={ad.image}
                      alt={ad.title}
                      width={100}
                      height={100}
                      loading="lazy"
                      className="w-full sm:w-1/3 h-48 sm:h-full object-cover rounded-lg"
                    />
                    <div className="flex flex-col justify-between w-full">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-xl mb-2">{ad.title}</h3>
                          <button className="text-gray-400 hover:text-red-500">
                            <Heart />
                          </button>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mb-1">
                          <MapPin size={16} className="mr-2" /> {ad.location}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <span className="mr-4">🕒 {ad.date}</span>
                          <span>👤 {ad.seller}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                          {ad.category}
                        </span>
                        <span className="font-bold text-lg text-gray-800">
                          {ad.price}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
          <h2 className="text-4xl font-bold text-center mb-12">
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
                    width={100}
                    height={100}
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
