'use client';

import { useState, useEffect, useRef } from 'react';

import { useGetBusinessData } from '@/service/listings/hook';

import { InHouseBusiness } from '@/service/listings/types';

import HeroSection from './redesign/HeroSection';

import AboutSection from './redesign/AboutSection';

import MediaGallery from './redesign/MediaGallery';

import ProductsSection from './redesign/ProductsSection';

import ServicesSection from './redesign/ServicesSection';

import PromotionsSection from './redesign/PromotionsSection';

import ContactSection from './redesign/ContactSection';

import Footer from '@/components/Footer';

import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams } from 'next/navigation';

import { 

  Info, 

  Package, 

  Wrench, 

  Tag, 

  Image as ImageIcon, 

  MessageSquare, 

  PhoneCall,

  ChevronDown

} from 'lucide-react';

import { ReviewsTabContent } from './ReviewsTabContent';



type ClientListingDetailProps = {

  placeId: string;

};



const NAV_ITEMS = [

  { id: 'about', label: 'About', icon: Info },

  { id: 'media', label: 'Gallery', icon: ImageIcon },

  { id: 'products', label: 'Products', icon: Package },

  { id: 'services', label: 'Services', icon: Wrench },

  { id: 'promotions', label: 'Offers', icon: Tag },

  { id: 'reviews', label: 'Reviews', icon: MessageSquare },

  { id: 'contact', label: 'Contact', icon: PhoneCall },

];



export default function ClientListingDetail({

  placeId,

}: ClientListingDetailProps) {

  const [activeSection, setActiveSection] = useState('about');

  const [isNavSticky, setIsNavSticky] = useState(false);

  const searchParams = useSearchParams();

  const navRef = useRef<HTMLDivElement>(null);



  const {

    data: listing,

    isLoading,

  } = useGetBusinessData({

    id: placeId,

  });



    // Switch to services tab if bookService is present, or use activeSection param



    useEffect(() => {



      const bookServiceId = searchParams.get('bookService');



      const sectionParam = searchParams.get('activeSection');



  



      if (bookServiceId) {



        setActiveSection('services');



      } else if (sectionParam && NAV_ITEMS.some(item => item.id === sectionParam)) {



        setActiveSection(sectionParam);



      }



    }, [searchParams]);



  



  useEffect(() => {


    const handleScroll = () => {
      setIsNavSticky(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (id: string) => {
    setActiveSection(id);
    // Smooth scroll to content top when switching tabs
    const headerOffset = 140;
    const element = navRef.current;
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - 80;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#f58220] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Experience</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-500 mb-8">The business you are looking for might have moved or been removed from our directory.</p>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-[#f58220] text-white font-bold py-4 rounded-2xl hover:bg-[#e67a1d] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const inHouseListing = listing as InHouseBusiness;

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <HeroSection listing={inHouseListing} />

      {/* Sub-Navigation */}
      <div 
        ref={navRef}
        className={`z-40 transition-all duration-300 sticky top-16 border-b ${
          isNavSticky 
            ? 'bg-white/80 backdrop-blur-md shadow-md py-2' 
            : 'bg-white py-4'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex items-center justify-center md:justify-start gap-1 md:gap-8 overflow-x-auto hide-scrollbar py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              // Skip sections that don't have content based on listingType
              if (item.id === 'products' && !inHouseListing.listingType.includes('product')) return null;
              if (item.id === 'services' && !inHouseListing.listingType.includes('service')) return null;
              if (item.id === 'media' && (!inHouseListing.media || inHouseListing.media.length === 0)) return null;
              
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#f58220] text-white shadow-lg shadow-orange-500/20' 
                      : 'text-gray-500 hover:text-[#f58220] hover:bg-orange-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8 min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* About Section */}
            {activeSection === 'about' && (
              <section id="about">
                <AboutSection listing={inHouseListing} />
              </section>
            )}

            {/* Media Gallery */}
            {activeSection === 'media' && inHouseListing.media && inHouseListing.media.length > 0 && (
              <section id="media">
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <ImageIcon className="text-[#f58220]" /> Visual Gallery
                  </h2>
                  <p className="text-gray-500 font-medium">Explore the venue and products through our lens.</p>
                </div>
                <MediaGallery media={inHouseListing.media} />
              </section>
            )}

            {/* Products Section */}
            {activeSection === 'products' && (
              <section id="products">
                <ProductsSection products={inHouseListing.products} />
              </section>
            )}

            {/* Services Section */}
            {activeSection === 'services' && (
              <section id="services">
                <ServicesSection businessId={inHouseListing.id} />
              </section>
            )}

            {/* Promotions Section */}
            {activeSection === 'promotions' && (
              <section id="promotions">
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <Tag className="text-[#f58220]" /> Exclusive Offers
                  </h2>
                  <p className="text-gray-500 font-medium">Don't miss out on our special deals and loyalty rewards.</p>
                </div>
                <PromotionsSection listing={inHouseListing} />
              </section>
            )}

            {/* Reviews Section */}
            {activeSection === 'reviews' && (
              <section id="reviews">
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <MessageSquare className="text-[#f58220]" /> Customer Feedback
                  </h2>
                  <p className="text-gray-500 font-medium">See what our community has to say about their experience.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                  <ReviewsTabContent businessId={inHouseListing.id} />
                </div>
              </section>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <section id="contact" className="pb-20">
                <ContactSection listing={inHouseListing} />
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}