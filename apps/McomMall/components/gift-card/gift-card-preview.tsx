import React from 'react';
import { CreateGiftCardTemplateDto } from '@/service/gift-card/types';
import { Sparkles } from 'lucide-react';


interface GiftCardPreviewProps {
  template: Partial<CreateGiftCardTemplateDto>;
}

const GoldenRibbon = () => (
  <div className="absolute bottom-[28%] left-0 w-full h-3 z-10 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-lg" />
  </div>
);

const GoldenBow = () => (
  <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-6px)] z-20 scale-75 pointer-events-none">
    <div className="relative w-20 h-12 flex items-center justify-center">
      <div className="absolute -left-1.5 w-8 h-8 border-[3px] border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg] shadow-md" />
      <div className="absolute -right-1.5 w-8 h-8 border-[3px] border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg] shadow-md" />
      <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 z-10 shadow-xl" />
    </div>
  </div>
);

const PinstripePattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-20 pointer-events-none">
    <defs>
      <pattern id="pinstripe-preview" patternUnits="userSpaceOnUse" width="100%" height="4">
        <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pinstripe-preview)" />
  </svg>
);

const GiftCardPreview: React.FC<GiftCardPreviewProps> = ({ template }) => {
  const { backgroundImageUrl, backgroundColor, textColor, name } = template;

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundImageUrl ? 'transparent' : (backgroundColor || '#8b0000'),
    color: textColor || '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  };

  const textShadow = '0 2px 4px rgba(0,0,0,0.3)';

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Template Preview</h3>
      <div
        className="rounded-[2.5rem] shadow-2xl p-8 flex flex-col justify-between h-64 relative overflow-hidden border-4 border-white/10"
        style={cardStyle}
      >
        {backgroundImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
        )}

        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <PinstripePattern />

        <GoldenRibbon />
        <GoldenBow />

        <div className="relative z-30">
          <h4 className="text-4xl font-black text-yellow-500 italic tracking-tight" style={{ textShadow }}>
            GIFT <span className="text-yellow-400">CARD</span>
          </h4>
          <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1" style={{ textShadow }}>
            {name || 'Template Name'}
          </p>
        </div>

        <div className="relative z-30 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/50">Card Serial</p>
            <p className="text-lg font-mono tracking-widest text-yellow-500 drop-shadow" style={{ textShadow }}>XXXX XXXX XXXX</p>
          </div>
          <div className="text-right">
            <div className="bg-white/95 p-1 rounded-xl inline-block shadow-lg">
              <div className="w-10 h-10 border-2 border-gray-100 rounded flex items-center justify-center text-gray-400">
                <Sparkles size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardPreview;