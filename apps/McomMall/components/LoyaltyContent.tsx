'use client';

import {
  useCheckPromotions,
  useParticipateInPromotion,
} from '@/service/promotions/hook';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format, isFuture } from 'date-fns';
import { Calendar, Tag, ShieldCheck, Award, Zap, Trophy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CongratulatoryModal } from './CongratulatoryModal';

type LoyaltyContentProps = {
  businessId?: string;
  productId?: string;
};

const LoyaltyContent = ({ businessId, productId }: LoyaltyContentProps) => {
  const {
    data: promotions,
    isLoading,
    isError,
  } = useCheckPromotions({
    businessId,
    productId,
  });

  const participateMutation = useParticipateInPromotion();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    promotionName: string;
    points?: number;
  }>({
    isOpen: false,
    promotionName: '',
  });

  const handleParticipate = (promotionId: string, promotionName: string, points?: number) => {
    participateMutation.mutate(promotionId, {
      onSuccess: () => {
        setModalState({
          isOpen: true,
          promotionName: promotionName,
          points: points,
        });
      },
      onError: (error) => {
        toast.error(`Failed to register: ${error.message}`);
      },
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
        return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="aspect-[1.58/1] bg-gray-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (isError || !promotions || promotions.length === 0) {
    return (
        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
            <Award className="mx-auto text-gray-300 mb-4" size={48} />
            <h4 className="text-xl font-black text-gray-900">No Loyalty Programs</h4>
            <p className="text-gray-500 font-bold text-sm mt-2">Join our community to earn points and exclusive rewards.</p>
        </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {promotions.map((promotion, index) => {
          const isFuturePromotion = promotion.beginDate && isFuture(new Date(promotion.beginDate));
          const hasJoined = promotion.isParticipating;

          return (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[1.58/1]"
            >
              <div className="absolute inset-0 bg-[#1A1A1A] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
                  {/* Accent visuals */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                  
                  <div className="flex justify-between items-start z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-orange-500/20">
                              {promotion.promotionType?.replace('_', ' ') || 'Loyalty'}
                          </span>
                          {hasJoined && (
                            <span className="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={10} /> Joined
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">{promotion.name}</h3>
                        <p className="text-white/40 text-xs font-bold line-clamp-2 max-w-[250px]">
                          {promotion.description}
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400">
                        <Trophy size={28} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white/60">
                          <Calendar size={14} className="text-orange-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Ends {formatDate(promotion.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-blue-400" />
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Verified Program</span>
                        </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleParticipate(promotion.id, promotion.name, promotion.points)}
                      disabled={participateMutation.isPending || !!isFuturePromotion || hasJoined}
                      className={`h-14 px-10 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-black/20 disabled:opacity-50 ${
                        hasJoined 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-white text-black hover:bg-[#f58220] hover:text-white'
                      }`}
                    >
                      {hasJoined 
                        ? 'Program Joined' 
                        : isFuturePromotion 
                        ? 'Coming Soon' 
                        : participateMutation.isPending 
                        ? 'Joining...' 
                        : 'Join Program'}
                    </Button>
                  </div>

                  {/* Points Badge */}
                  {promotion.points && (
                    <div className="absolute top-1/2 right-8 -translate-y-1/2 text-right opacity-10 group-hover:opacity-20 transition-opacity">
                        <p className="text-6xl font-black text-white">{promotion.points}</p>
                        <p className="text-xs font-black text-white uppercase tracking-[0.5em]">Points</p>
                    </div>
                  )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <CongratulatoryModal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        promotionName={modalState.promotionName}
        points={modalState.points}
      />
    </>
  );
};

export default LoyaltyContent;
