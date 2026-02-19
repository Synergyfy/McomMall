'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// --- Barcode SVG (decorative) ---
export const BarcodeDecor = ({ className }: { className?: string }) => {
    const bars = [3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 1, 2, 1, 3, 1, 1, 2, 1, 3];
    return (
        <div className={cn('flex items-end gap-[1.5px] h-10', className)}>
            {bars.map((w, i) => (
                <div
                    key={i}
                    className="bg-[#1a3a6b] rounded-[0.5px]"
                    style={{ width: `${w * 1.5}px`, height: `${60 + ((i * 7) % 40)}%` }}
                />
            ))}
        </div>
    );
};

// --- Stars Decoration ---
export const StarDecor = ({ count = 3, className }: { count?: number; className?: string }) => (
    <div className={cn('flex items-center gap-1', className)}>
        {Array.from({ length: count }).map((_, i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#2563eb" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
        ))}
    </div>
);

// --- Perforated Edge (scallop dots) ---
export const PerforatedEdge = ({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical'; className?: string }) => {
    const dots = Array.from({ length: 18 });
    if (orientation === 'vertical') {
        return (
            <div className={cn('flex flex-col items-center justify-around h-full py-2', className)}>
                {dots.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#cde4f8]" />
                ))}
            </div>
        );
    }
    return (
        <div className={cn('flex items-center justify-around w-full px-2', className)}>
            {dots.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#cde4f8]" />
            ))}
        </div>
    );
};

// ------------------------------------------------------------------
// STYLE A: Full-width dark blue ticket (left card from image)
// ------------------------------------------------------------------
interface CouponTicketFullProps {
    title: string;
    subtitle?: string;
    valueLabel: string;    // e.g. "75%" or "£25"
    validUntil?: string;   // e.g. "12 DEC 2024"
    footerText?: string;   // e.g. "www.loremipsum.com"
    className?: string;
    children?: React.ReactNode; // action buttons etc.
}

export const CouponTicketFull: React.FC<CouponTicketFullProps> = ({
    title,
    subtitle,
    valueLabel,
    validUntil = 'No Expiry',
    footerText,
    className,
    children,
}) => {
    return (
        <div className={cn('relative w-full', className)}>
            <div className="relative overflow-hidden rounded-2xl shadow-xl bg-[#1a3a6b] text-white select-none">
                {/* Top perforated edge */}
                <div className="py-1.5 border-b border-dashed border-blue-400/40">
                    <PerforatedEdge orientation="horizontal" className="[&>div]:bg-[#0d2550]" />
                </div>

                {/* Main content */}
                <div className="flex items-stretch min-h-[130px]">
                    {/* Value badge area */}
                    <div className="flex-shrink-0 flex items-center justify-center bg-[#2563eb] w-28 p-4">
                        <div className="text-center">
                            <span className="text-3xl font-black leading-none block">{valueLabel}</span>
                        </div>
                    </div>

                    {/* Title section */}
                    <div className="flex-1 flex flex-col justify-center px-5 py-4 border-l border-blue-400/20">
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">{title}</h3>
                        {subtitle && (
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Footer band */}
                <div className="border-t border-dashed border-blue-400/40 bg-[#0d2550] px-5 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-300 mb-0.5">This Voucher Valid Until</p>
                        <p className="text-[11px] font-black text-white">{validUntil}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-blue-400" />
                        ))}
                    </div>
                    {footerText && (
                        <p className="text-[9px] font-bold text-blue-300 uppercase tracking-wide">{footerText}</p>
                    )}
                </div>

                {/* Bottom perforated edge */}
                <div className="py-1.5 border-t border-dashed border-blue-400/40">
                    <PerforatedEdge orientation="horizontal" className="[&>div]:bg-[#0d2550]" />
                </div>
            </div>

            {/* Actions below card */}
            {children && <div className="mt-3">{children}</div>}
        </div>
    );
};

// ------------------------------------------------------------------
// STYLE B: Split white/blue ticket with barcode (right card from image)
// ------------------------------------------------------------------
interface CouponTicketSplitProps {
    title: string;
    subtitle?: string;
    valueLabel: string;    // e.g. "75%"
    validUntil?: string;
    footerText?: string;
    barcodeId?: string;    // used as barcode number label
    showStars?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const CouponTicketSplit: React.FC<CouponTicketSplitProps> = ({
    title,
    subtitle,
    valueLabel,
    validUntil = 'No Expiry',
    footerText,
    barcodeId,
    showStars = true,
    className,
    children,
}) => {
    return (
        <div className={cn('relative w-full', className)}>
            <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white border border-blue-100 select-none flex">
                {/* Left notch */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#cde4f8] rounded-r-full z-10" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#cde4f8] rounded-l-full z-10" />

                {/* Top perforated edge */}
                <div className="absolute top-0 left-0 right-0 py-1 border-b border-dashed border-blue-200 z-10">
                    <PerforatedEdge orientation="horizontal" />
                </div>

                {/* Main split layout */}
                <div className="flex w-full pt-5 pb-5 min-h-[140px]">
                    {/* Left section: title + stars + validity */}
                    <div className="flex-1 flex flex-col justify-between px-5 py-2">
                        <div>
                            {showStars && <StarDecor count={3} className="mb-2" />}
                            <h3 className="text-lg font-black uppercase text-[#1a3a6b] leading-tight tracking-tight">{title}</h3>
                            {subtitle && (
                                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-400 mt-0.5">{subtitle}</p>
                            )}
                        </div>
                        <div className="mt-3">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">This Voucher Valid Until</p>
                            <p className="text-[10px] font-black text-[#1a3a6b]">{validUntil}</p>
                            {footerText && (
                                <p className="text-[8px] font-bold text-blue-400 mt-0.5">{footerText}</p>
                            )}
                        </div>
                    </div>

                    {/* Vertical perforated divider */}
                    <div className="relative w-6 flex-shrink-0 flex items-center justify-center">
                        <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-blue-200" />
                        <PerforatedEdge orientation="vertical" className="[&>div]:bg-blue-100 relative z-10" />
                    </div>

                    {/* Right section: value badge + barcode */}
                    <div className="flex-shrink-0 w-28 flex flex-col items-center justify-between py-2 px-3">
                        <div className="bg-[#2563eb] rounded-xl px-3 py-2 text-center mb-3 w-full">
                            <span className="text-2xl font-black text-white leading-none block">{valueLabel}</span>
                        </div>
                        <BarcodeDecor />
                        {barcodeId && (
                            <p className="text-[7px] font-mono text-slate-400 mt-1 tracking-widest">{barcodeId.slice(0, 12)}</p>
                        )}
                    </div>
                </div>

                {/* Bottom perforated edge */}
                <div className="absolute bottom-0 left-0 right-0 py-1 border-t border-dashed border-blue-200 z-10">
                    <PerforatedEdge orientation="horizontal" />
                </div>
            </div>

            {/* Actions below card */}
            {children && <div className="mt-3">{children}</div>}
        </div>
    );
};
