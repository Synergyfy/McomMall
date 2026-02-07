'use client';

import { motion } from 'framer-motion';
import { InHouseBusiness } from '@/service/listings/types';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ContactSectionProps {
  listing: InHouseBusiness;
}

const socialIconMap = {
  facebook: <Facebook size={20} />,
  twitter: <Twitter size={20} />,
  instagram: <Instagram size={20} />,
  linkedin: <Linkedin size={20} />,
  youtube: <Youtube size={20} />,
  website: <Globe size={20} />,
};

export default function ContactSection({ listing }: ContactSectionProps) {
  const router = useRouter();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const handleOpenChat = () => {
    if (!accessToken) {
      const callbackUrl = window.location.href;
      const separator = callbackUrl.includes('?') ? '&' : '?';
      const redirectUrl = `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}${separator}activeSection=contact`;
      
      toast.error('Please sign in to message the business');
      router.push(redirectUrl);
      return;
    }
    // Logic for opening chat would go here
    toast.info('Chat room will open soon!');
  };

  return (
    <div className="bg-[#1A1A1A] rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Connect With <span className="text-[#f58220]">Us</span> Today
          </h2>
          <p className="text-white/60 text-lg font-bold mb-10 leading-relaxed max-w-md">
            Have questions or want to learn more about our services? Reach out to our team directly.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 group-hover:bg-[#f58220] group-hover:text-white transition-all">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Send Email</p>
                <a href={`mailto:${listing.businessEmail}`} className="text-xl font-black hover:text-orange-400 transition-colors">
                  {listing.businessEmail || 'contact@' + listing.businessName.toLowerCase().replace(/\s/g, '') + '.com'}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 group-hover:bg-[#f58220] group-hover:text-white transition-all">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Call Support</p>
                <a href={`tel:${listing.businessPhone}`} className="text-xl font-black hover:text-orange-400 transition-colors">
                  {listing.businessPhone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 group-hover:bg-[#f58220] group-hover:text-white transition-all">
                <Navigation size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Visit Location</p>
                <p className="text-xl font-black">
                  {listing.location?.addressLine1}, {listing.location?.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
           <h3 className="text-2xl font-black mb-8">Follow Our Journey</h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
              {listing.socialLinks?.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-[#f58220] transition-all group"
                >
                  <span className="text-white group-hover:text-white">
                    {socialIconMap[link.platform as keyof typeof socialIconMap] || <Globe size={20} />}
                  </span>
                  <span className="text-xs font-bold capitalize">{link.platform}</span>
                </a>
              ))}
           </div>

           <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#f58220] to-orange-600 text-white shadow-2xl shadow-orange-500/20">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageSquare size={24} />
                 </div>
                 <h4 className="text-lg font-black tracking-tight">Direct Message</h4>
              </div>
              <p className="text-white/80 text-sm font-bold mb-6 leading-relaxed">
                Connect with our account managers for personalized service requests.
              </p>
              <Button 
                onClick={handleOpenChat}
                className="w-full bg-white text-orange-600 hover:bg-black hover:text-white font-black text-xs uppercase tracking-widest py-6 rounded-xl transition-all h-auto"
              >
                Open Chat Room
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}