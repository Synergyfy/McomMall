'use client';

import { motion } from 'framer-motion';

import { InHouseBusiness } from '@/service/listings/types';

import {

  Building2,

  Users2,

  CalendarCheck,

  Award,

  ArrowRight,

  Truck,

  RotateCcw,

  ShoppingBag,

  ExternalLink,

  ShieldCheck,

  Calendar,

  FileCheck,

  AlertCircle,

  Clock,

  MapPin,

  Scale,

  Hash,

  Fingerprint,

  CheckCircle2,

  MessageSquare

} from 'lucide-react';



interface AboutSectionProps {

  listing: InHouseBusiness;

}



export default function AboutSection({ listing }: AboutSectionProps) {

  const stats = [

    { label: 'Established', value: listing.createdAt ? new Date(listing.createdAt).getFullYear() : '2023', icon: Building2 },

    { label: 'Community', value: 'Verified', icon: Users2 },

    { label: 'Service', value: listing.listingType.join(' & '), icon: Award },

    { label: 'Availability', value: 'Flexible', icon: CalendarCheck },

  ];



  const productProfile = listing.productSellerProfile;

  const serviceProfile = listing.serviceProviderProfile;



  const formatTime = (timeString: string) => {

    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');

    let h = parseInt(hours, 10);

    const ampm = h >= 12 ? 'PM' : 'AM';

    h = h % 12;

    h = h ? h : 12;

    return `${h}:${minutes} ${ampm}`;

  };



  const daysOfWeek = [

    'Sunday',

    'Monday',

    'Tuesday',

    'Wednesday',

    'Thursday',

    'Friday',

    'Saturday',

  ];



  const DAY_MAP: Record<number, string> = {

    0: 'SUNDAY',

    1: 'MONDAY',

    2: 'TUESDAY',

    3: 'WEDNESDAY',

    4: 'THURSDAY',

    5: 'FRIDAY',

    6: 'SATURDAY',

  };



  const today = new Date().getDay();

  const todayString = DAY_MAP[today];

  const currentDayHours = listing.businessHours?.find(h => h.dayOfWeek === todayString);



  const isOpenNow = () => {

    if (!currentDayHours) return false;

    if (currentDayHours.is24h) return true;



    const now = new Date();

    const currentTime = now.getHours() * 100 + now.getMinutes();

    const openTime = parseInt(currentDayHours.openTime.replace(':', ''), 10);

    const closeTime = parseInt(currentDayHours.closeTime.replace(':', ''), 10);



    return currentTime >= openTime && currentTime <= closeTime;

  };



  return (



    <div className="space-y-12">



      {/* Quick Highlights Bar */}



      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">



        {stats.map((stat, i) => {



          const Icon = stat.icon;



          return (



            <motion.div



              key={i}



              initial={{ opacity: 0, y: 10 }}



              animate={{ opacity: 1, y: 0 }}



              transition={{ delay: 0.1 * i }}



              className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-orange-200 hover:shadow-md transition-all"



            >



              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 flex items-center justify-center text-[#f58220] group-hover:bg-[#f58220] group-hover:text-white transition-all shrink-0">



                <Icon size={20} className="md:w-6 md:h-6" />



              </div>



              <div className="min-w-0">



                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>



                <p className="text-sm md:text-base font-black text-gray-900 capitalize truncate">{stat.value}</p>



              </div>



            </motion.div>



          );



        })}



      </div>







      {/* Story Content */}



      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-500/5">



        <div className="max-w-4xl">



          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">



            Our Story & <span className="text-[#f58220]">Mission</span>



          </h2>



          <div className="prose prose-lg max-w-none text-gray-500 font-medium leading-relaxed">



            {listing.about?.split('\n').map((paragraph, i) => (



              <p key={i} className="mb-4">{paragraph}</p>



            )) || "Welcome to " + listing.businessName + ". We are dedicated to providing the highest quality products and services to our customers. Our team is committed to excellence and ensuring that every experience with us is exceptional."}



          </div>







          {listing.website && (



            <div className="mt-8 pt-8 border-t border-gray-50">



              <a



                href={listing.website}



                target="_blank"



                rel="noreferrer"



                className="inline-flex items-center gap-3 text-[#f58220] font-black text-lg hover:gap-5 transition-all"



              >



                Visit Our Official Website <ArrowRight size={20} />



              </a>



            </div>



          )}



        </div>



      </div>







      {/* Operational Hours & Location */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-500/5">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-50">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-900/20">

                <Clock size={28} />

              </div>

              <div>

                <h3 className="text-2xl font-black text-gray-900">Operational Hours</h3>

                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">When we're available</p>

              </div>

            </div>



            {currentDayHours && (

              <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${isOpenNow()

                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'

                  : 'bg-red-50 border-red-100 text-red-600'

                }`}>

                <div className={`w-3 h-3 rounded-full animate-pulse ${isOpenNow() ? 'bg-emerald-500' : 'bg-red-500'}`} />

                <span className="font-black text-sm uppercase tracking-wider">

                  {isOpenNow() ? 'Open Now' : 'Currently Closed'}

                </span>

              </div>

            )}

          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">

            {listing.businessHours?.sort((a, b) => {

              const dayOrder: Record<string, number> = { 'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6 };

              return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];

            }).map((hour) => (

              <div key={hour.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${hour.dayOfWeek === todayString ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50'}`}>

                <span className={`text-sm font-bold ${hour.dayOfWeek === todayString ? 'text-[#f58220]' : 'text-gray-600'}`}>

                  {daysOfWeek[Object.keys(DAY_MAP).find(k => DAY_MAP[Number(k)] === hour.dayOfWeek) as any]}

                </span>

                <span className={`text-sm font-black ${hour.dayOfWeek === todayString ? 'text-[#f58220]' : 'text-gray-900'}`}>

                  {hour.is24h ? '24 Hours' : `${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}`}

                </span>

              </div>

            ))}

          </div>

        </div>



        <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden">

          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f58220]/20 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="relative z-10">

            <div className="w-14 h-14 rounded-2xl bg-[#f58220] flex items-center justify-center text-white mb-8 shadow-lg shadow-orange-500/30">

              <MapPin size={28} />

            </div>

            <h3 className="text-2xl font-black mb-4">Visit Our Location</h3>

            <p className="text-white/60 font-bold leading-relaxed mb-8">

              {listing.location.addressLine1},<br />

              {listing.location.addressLine2 && <>{listing.location.addressLine2},<br /></>}

              {listing.location.city}, {listing.location.postcode}

            </p>

          </div>

          <button className="relative z-10 w-full bg-white/10 hover:bg-[#f58220] border border-white/10 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3">

            Open in Google Maps <ExternalLink size={18} />

          </button>

        </div>

      </div>



      {/* Seller/Provider Specific Data */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Product Seller Profile Details */}

        {productProfile && (

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-500/5 space-y-8"

          >

            <div className="flex items-center gap-4 border-b border-gray-50 pb-6">

              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">

                <ShoppingBag size={28} />

              </div>

              <div>

                <h3 className="text-2xl font-black text-gray-900">Commerce Profile</h3>

                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Shopping & Fulfilment</p>

              </div>

            </div>



            <div className="space-y-6">

              {productProfile.sellingModes && productProfile.sellingModes.length > 0 && (

                <div className="space-y-3">

                  <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-wider">

                    <Truck size={18} className="text-[#f58220]" /> Fulfilment Methods

                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {productProfile.sellingModes.map((mode) => (

                      <span key={mode} className="px-4 py-2 bg-orange-50 text-[#f58220] text-xs font-black rounded-full uppercase">

                        {mode.replace('_', ' ')}

                      </span>

                    ))}

                  </div>

                </div>

              )}



              {productProfile.fulfilmentNotes && (

                <div className="space-y-3 bg-gray-50 p-6 rounded-3xl border border-gray-100">

                  <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">

                    <AlertCircle size={18} className="text-orange-400" /> Fulfilment Notes

                  </h4>

                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{productProfile.fulfilmentNotes}</p>

                </div>

              )}



              {productProfile.returnsPolicy && (

                <div className="space-y-3">

                  <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-wider">

                    <RotateCcw size={18} className="text-[#f58220]" /> Returns Policy

                  </h4>

                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{productProfile.returnsPolicy}</p>

                </div>

              )}



              {productProfile.storefrontLinks && productProfile.storefrontLinks.length > 0 && (

                <div className="space-y-3 pt-4 border-t border-gray-50">

                  <h4 className="text-sm font-black text-gray-900">Shop Us on Other Platforms</h4>

                  <div className="grid grid-cols-2 gap-4">

                    {productProfile.storefrontLinks.map((link) => (

                      <a

                        key={link.id}

                        href={link.url}

                        target="_blank"

                        rel="noreferrer"

                        className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl hover:border-orange-300 transition-all group"

                      >

                        <span className="text-sm font-black text-gray-700 capitalize">{link.platform}</span>

                        <ExternalLink size={14} className="text-gray-300 group-hover:text-orange-500" />

                      </a>

                    ))}

                  </div>

                </div>

              )}

            </div>

          </motion.div>

        )}



        {/* Service Provider Profile Details */}

        {serviceProfile && (

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ delay: 0.1 }}

            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-500/5 space-y-8"

          >

            <div className="flex items-center gap-4 border-b border-gray-50 pb-6">

              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">

                <CalendarCheck size={28} />

              </div>

              <div>

                <h3 className="text-2xl font-black text-gray-900">Professional Profile</h3>

                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Service & Expertise</p>

              </div>

            </div>



            <div className="space-y-6">

              {/* Fixed/Hourly Rate display removed if not needed or can be added back if desired */}



              {serviceProfile.bookingUrl && (



                <button



                  onClick={() => {



                    const contactSection = document.getElementById('contact');



                    if (contactSection) {



                      contactSection.scrollIntoView({ behavior: 'smooth' });



                    }



                  }}



                  className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-[#f58220] transition-all"



                >



                  <MessageSquare size={20} /> Send Message



                </button>



              )}



              {serviceProfile.hasPublicLiabilityInsurance && (

                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4">

                  <div className="p-2 bg-emerald-500 rounded-xl text-white">

                    <ShieldCheck size={20} />

                  </div>

                  <div>

                    <h4 className="text-sm font-black text-emerald-900">Fully Insured Provider</h4>

                    <p className="text-xs font-medium text-emerald-600/80 mt-1">

                      {serviceProfile.insuranceProvider ? `Insured by ${serviceProfile.insuranceProvider}` : 'Valid Public Liability Insurance'}

                      {serviceProfile.insuranceExpiryDate && ` until ${new Date(serviceProfile.insuranceExpiryDate).toLocaleDateString()}`}

                    </p>

                  </div>

                </div>

              )}



              {serviceProfile.certifications && serviceProfile.certifications.length > 0 && (

                <div className="space-y-4">

                  <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-wider">

                    <FileCheck size={18} className="text-[#f58220]" /> Accreditations

                  </h4>

                  <div className="space-y-2">

                    {serviceProfile.certifications.map((cert) => (

                      <div

                        key={cert.id}

                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"

                      >

                        <span className="text-sm font-bold text-gray-700">{cert.name}</span>

                        {cert.fileUrl && (

                          <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">

                            <ExternalLink size={16} />

                          </a>

                        )}

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

          </motion.div>

        )}

      </div>



      {/* Legal & Business Identity */}

      {(listing.legalName || listing.companyRegistrationNumber || listing.vatNumber) && (

        <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">

          <div className="flex items-center gap-4 mb-8">

            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">

              <Scale size={24} />

            </div>

            <h3 className="text-2xl font-black text-gray-900">Legal Information</h3>

          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {listing.legalName && (

              <div className="space-y-1">

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">

                  <Building2 size={12} /> Registered Legal Name

                </p>

                <p className="text-lg font-black text-gray-800">{listing.legalName}</p>

              </div>

            )}

            {listing.companyRegistrationNumber && (

              <div className="space-y-1">

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">

                  <Hash size={12} /> Company Registration

                </p>

                <p className="text-lg font-black text-gray-800">{listing.companyRegistrationNumber}</p>

              </div>

            )}

            {listing.vatNumber && (

              <div className="space-y-1">

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">

                  <Fingerprint size={12} /> VAT Number

                </p>

                <p className="text-lg font-black text-gray-800">{listing.vatNumber}</p>

              </div>

            )}

          </div>



          <div className="mt-8 pt-8 border-t border-gray-200/50 flex items-center gap-2 text-emerald-600">

            <CheckCircle2 size={16} />

            <span className="text-xs font-bold uppercase tracking-widest">Verified Business Entity</span>

          </div>

        </div>

      )}

    </div>

  );

}


