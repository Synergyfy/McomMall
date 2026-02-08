import React from 'react';
import { CreateGiftCardTemplateDto } from '@/service/gift-card/types';

interface GiftCardPreviewProps {
  template: Partial<CreateGiftCardTemplateDto>;
}

const GiftCardPreview: React.FC<GiftCardPreviewProps> = ({ template }) => {
  const { backgroundImageUrl, backgroundColor, textColor, name } = template;

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundImageUrl ? 'transparent' : backgroundColor,
    color: textColor,
    position: 'relative',
    overflow: 'hidden',
  };

  const textShadow = '0 1px 3px rgba(0,0,0,0.3)';

  return (
    <div className="w-full max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Gift Card Preview</h3>
        <div
            className="rounded-lg shadow-lg p-6 flex flex-col justify-between h-56"
            style={cardStyle}
        >
            {backgroundImageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                />
            )}
            <div className="relative z-10">
                <h4 className="text-2xl font-bold" style={{ textShadow }}>{name || 'Gift Card'}</h4>
            </div>
            <div className="relative z-10 text-right">
                <p className="text-sm font-mono tracking-widest" style={{ textShadow }}>XXXX-XXXX-XXXX-1234</p>
                <p className="text-xs mt-1" style={{ textShadow }}>Expires: 12/2030</p>
            </div>
        </div>
    </div>
  );
};

export default GiftCardPreview;