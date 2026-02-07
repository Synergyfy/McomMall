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
  const navRef = useRef<HTMLDivElement>(null);

  const {
    data: listing,
    isLoading,
  } = useGetBusinessData({
    id: placeId,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const navTop = navRef.current.getBoundingClientRect().top;
        setIsNavSticky(window.scrollY > 400);
      }

      // Update active section based on scroll position
      const scrollPosition = window.scrollY + 150;
      for (const item of NAV_ITEMS) {
        const element = document.getElementById(item.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(item.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

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
        className={`z-40 transition-all duration-300 ${
          isNavSticky 
            ? 'fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-md py-2' 
            : 'bg-white border-b sticky top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center md:justify-start gap-1 md:gap-8 overflow-x-auto hide-scrollbar py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              // Skip sections that don't have content
              if (item.id === 'products' && (!inHouseListing.products || inHouseListing.products.length === 0)) return null;
              if (item.id === 'services' && !inHouseListing.serviceProviderProfile) return null;
              if (item.id === 'media' && (!inHouseListing.media || inHouseListing.media.length === 0)) return null;
              
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
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

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
        {/* About Section */}
        <section id="about" className="scroll-mt-32">
          <AboutSection listing={inHouseListing} />
        </section>

        {/* Media Gallery */}
        {inHouseListing.media && inHouseListing.media.length > 0 && (
          <section id="media" className="scroll-mt-32">
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
        {inHouseListing.products && inHouseListing.products.length > 0 && (
          <section id="products" className="scroll-mt-32">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <Package className="text-[#f58220]" /> Featured Products
              </h2>
              <p className="text-gray-500 font-medium">Browse our premium selection of available items.</p>
            </div>
            <ProductsSection products={inHouseListing.products} />
          </section>
        )}

        {/* Services Section */}
        {inHouseListing.serviceProviderProfile && (
          <section id="services" className="scroll-mt-32">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <Wrench className="text-[#f58220]" /> Expert Services
              </h2>
              <p className="text-gray-500 font-medium">Professional solutions tailored to your specific needs.</p>
            </div>
            <ServicesSection businessId={inHouseListing.id} />
          </section>
        )}

        {/* Promotions Section */}
        <section id="promotions" className="scroll-mt-32">
           <div className="mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <Tag className="text-[#f58220]" /> Exclusive Offers
              </h2>
              <p className="text-gray-500 font-medium">Don't miss out on our special deals and loyalty rewards.</p>
            </div>
          <PromotionsSection listing={inHouseListing} />
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32">
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

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-32 pb-20">
          <ContactSection listing={inHouseListing} />
        </section>
      </div>

      <Footer />
    </div>
  );
}