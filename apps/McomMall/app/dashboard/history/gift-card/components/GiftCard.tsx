"use client";

import { useRef } from "react";
import { MyPurchase } from "@/service/gift-card/types";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";

interface GiftCardProps {
  purchase: MyPurchase;
}

const PinstripePattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="pinstripe-hist" patternUnits="userSpaceOnUse" width="100%" height="4">
        <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pinstripe-hist)" />
  </svg>
);

const GoldenBow = () => (
  <div className="relative w-20 h-12 flex items-center justify-center scale-75">
    <div className="absolute w-[200%] h-3 bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-lg" />
    <div className="absolute -left-1.5 w-8 h-8 border-[3px] border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg] shadow-md" />
    <div className="absolute -right-1.5 w-8 h-8 border-[3px] border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg] shadow-md" />
    <div className="absolute top-6 -left-1 w-4 h-8 bg-gradient-to-t from-amber-600 to-yellow-400 skew-x-[-20deg]"
      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />
    <div className="absolute top-6 -right-1 w-4 h-8 bg-gradient-to-t from-amber-600 to-yellow-400 skew-x-[20deg]"
      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />
    <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 shadow-xl z-10" />
  </div>
);

const GiftCard = ({ purchase }: GiftCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const formatGiftCardCode = (code: string) => {
    return code.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleExport = () => {
    if (!cardRef.current) {
      toast.error("Failed to find gift card element.");
      return;
    }
    const cardElement = cardRef.current;

    const balanceElement =
      cardElement.querySelector<HTMLElement>(".gift-card-balance");
    const exportButtonElement = cardElement.querySelector<HTMLElement>(
      ".gift-card-export-button"
    );

    if (balanceElement) balanceElement.style.visibility = "hidden";
    if (exportButtonElement) exportButtonElement.style.visibility = "hidden";

    htmlToImage
      .toPng(cardElement, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        fetchRequestInit: {
          mode: 'cors',
          cache: 'no-cache',
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `gift-card-${purchase.code}.png`;
        link.click();
      })
      .catch((error) => {
        console.error("Oops, something went wrong!", error);
        toast.error("Failed to export gift card.");
      })
      .finally(() => {
        if (balanceElement) balanceElement.style.visibility = "visible";
        if (exportButtonElement)
          exportButtonElement.style.visibility = "visible";
      });
  };

  return (
    <div
      ref={cardRef}
      className="relative p-7 flex flex-col justify-between text-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white/10"
      style={{
        backgroundColor: purchase.template?.backgroundColor || "#8b0000",
        color: "#fff",
        backgroundImage: purchase.template?.backgroundImageUrl ? `url(${purchase.template?.backgroundImageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "240px",
      }}
    >
      {/* Background Pinstripe Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <PinstripePattern />
      </div>

      {/* Golden Ribbon Layer */}
      <div className="absolute bottom-[28%] left-0 w-full h-3 z-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
      </div>

      {/* Golden Bow Centered on Ribbon */}
      <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-6px)] z-20 pointer-events-none">
        <GoldenBow />
      </div>

      <div className="absolute top-4 right-4 gift-card-export-button z-50">
        <Download
          className="cursor-pointer text-white/80 hover:text-yellow-400 transition-colors"
          size={20}
          onClick={handleExport}
        />
      </div>

      <div className="flex justify-between items-start relative z-30">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-yellow-500 tracking-tight leading-none italic" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            GIFT <span className="text-yellow-400">CARD</span>
          </h3>
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-none">
            {purchase.purchaseBusiness?.businessName}
          </p>
        </div>
        <div className="bg-white/95 p-1 rounded-xl shadow-lg">
          <QRCode
            value={purchase.code}
            size={56}
            fgColor={purchase.template?.backgroundColor || "#000"}
            bgColor="transparent"
          />
        </div>
      </div>

      <div className="text-center my-2 relative z-30">
        <p className="font-mono text-xl tracking-widest text-yellow-500 drop-shadow">
          {formatGiftCardCode(purchase.code)}
        </p>
      </div>

      <div className="flex justify-between items-end relative z-30">
        <div className="space-y-0.5">
          <p className="text-[9px] uppercase font-bold tracking-widest text-white/50">Recipient</p>
          <p className="font-bold text-sm text-yellow-50/90">{purchase.recipientEmail}</p>
        </div>
        <div className="text-right gift-card-balance">
          <p className="text-[9px] uppercase font-bold tracking-widest text-white/50">Balance</p>
          <p className="text-3xl font-black text-yellow-400 drop-shadow">
            £{Number(purchase.currentBalance).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GiftCard;