'use client';

import { useGetBusinessGiftCards } from '@/service/gift-card/hook';
import { GiftCardTemplate } from '@/service/gift-card/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, Zap, ShieldCheck } from 'lucide-react';

interface GiftCardTabContentProps {
  businessId: string;
}

export default function GiftCardTabContent({ businessId }: GiftCardTabContentProps) {
  const { data: templates, isPending, isError } = useGetBusinessGiftCards(businessId);
  const router = useRouter();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="aspect-[1.58/1] bg-gray-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (isError || !templates || templates.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
        <Gift className="mx-auto text-gray-300 mb-4" size={48} />
        <h4 className="text-xl font-black text-gray-900">No Active Gift Cards</h4>
        <p className="text-gray-500 font-bold text-sm mt-2">Check back later for exclusive gift card offers.</p>
      </div>
    );
  }

  const handleBuyNow = (template: GiftCardTemplate) => {
    router.push(`/listings/${businessId}/gift-card?templateId=${template.id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="group relative aspect-[1.58/1] w-full"
        >
          {/* The "Card" Body */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-orange-500/10 border border-white/20">
            <Image
              src={template.backgroundImageUrl || 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80'}
              alt={template.name}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
            <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay group-hover:bg-orange-600/20 transition-colors" />

            {/* Chip/Logo Placeholder */}
            <div className="absolute top-6 left-6 w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg opacity-80 border border-white/30" />
            <ShieldCheck className="absolute top-6 right-6 text-white/50" size={20} />

            {/* Card Content */}
            <div className="absolute inset-x-6 bottom-6">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">{template.name}</h3>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">{template.description || 'Premium Gift Experience'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Gift Card</span>
                  <div className="flex items-center gap-2">
                    <Gift className="text-[#f58220]" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8">
              <div className="text-center space-y-6 w-full">
                <div className="space-y-2">
                  {template.bonusAmount && (
                    <span className="inline-block bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      + £{template.bonusAmount} Bonus
                    </span>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    {template.fixedAmounts?.slice(0, 3).map(amt => (
                      <span key={amt} className="bg-white/20 text-white text-sm font-black px-3 py-1 rounded-lg border border-white/20">£{amt}</span>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => handleBuyNow(template)}
                  className="w-full h-14 bg-white text-black hover:bg-[#f58220] hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all"
                >
                  Purchase Card
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
