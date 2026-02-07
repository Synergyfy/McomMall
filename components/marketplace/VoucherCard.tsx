'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Ticket, Copy, Check, Calendar, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PromotionalItem } from '@/lib/listing-data';
import { useState } from 'react';

interface VoucherCardProps {
    voucher: PromotionalItem;
    viewMode?: 'grid' | 'list';
}

export default function VoucherCard({ voucher, viewMode = 'grid' }: VoucherCardProps) {
    const [copied, setCopied] = useState(false);

    const discountPercentage = voucher.discountedPrice
        ? Math.round(((voucher.price - voucher.discountedPrice) / voucher.price) * 100)
        : 0;

    const voucherCode = `SAVE${discountPercentage}`;

    // Mock expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const formattedExpiry = expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleCopyCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(voucherCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const price = voucher.discountedPrice || voucher.price || 0;

    if (viewMode === 'list') {
        return (
            <Link href={voucher.link || `/vouchers/${voucher.id}`} className="block">
                <div className="group relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-orange-400/30">
                    <div className="flex flex-col sm:flex-row h-full">
                        {/* Left Section - Image */}
                        <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-white/10 backdrop-blur-sm flex-shrink-0">
                            <Image
                                src={voucher.image}
                                alt={voucher.title}
                                fill
                                className="object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-transparent" />
                        </div>

                        {/* Perforated Divider */}
                        <div className="hidden sm:flex flex-col justify-between h-full w-8 relative">
                            <div className="absolute inset-y-0 left-0 w-px bg-white/20" style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8px, white 8px, white 12px)',
                            }} />
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50" />
                        </div>

                        {/* Right Section - Details */}
                        <div className="flex-1 p-6 text-white">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-2">
                                        <Ticket className="w-3 h-3 mr-1" />
                                        Voucher
                                    </Badge>
                                    <h3 className="text-2xl font-bold mb-1">{voucher.title}</h3>
                                    <p className="text-orange-50 text-sm flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Valid until {formattedExpiry}
                                    </p>
                                </div>
                                {discountPercentage > 0 && (
                                    <div className="bg-white text-orange-600 rounded-full px-4 py-2 font-black text-2xl shadow-lg">
                                        -{discountPercentage}%
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-6">
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border-2 border-dashed border-white/40">
                                    <code className="text-white font-mono font-bold text-lg tracking-wider">{voucherCode}</code>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCopyCode}
                                    className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            Copy Code
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="mt-4 text-3xl font-bold">
                                £{Number(price).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid View - Ticket Style
    return (
        <Link href={voucher.link || `/vouchers/${voucher.id}`} className="block h-full">
            <div className="group relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border-2 border-orange-400/30 hover:scale-[1.02]">
                {/* Top Section - Image & Discount */}
                <div className="relative h-32 bg-white/10 backdrop-blur-sm overflow-hidden">
                    <Image
                        src={voucher.image}
                        alt={voucher.title}
                        fill
                        className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-900/50" />

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-3 right-3 bg-white text-orange-600 rounded-full px-3 py-1 font-black text-xl shadow-lg z-10">
                            -{discountPercentage}%
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                            <Ticket className="w-3 h-3 mr-1" />
                            Voucher
                        </Badge>
                    </div>
                </div>

                {/* Perforated Divider */}
                <div className="h-4 relative">
                    <div className="absolute inset-x-0 top-0 h-px bg-white/20" style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, white 8px, white 12px)',
                    }} />
                    <div className="absolute -top-2 left-0 w-4 h-4 rounded-full bg-gray-50" />
                    <div className="absolute -top-2 right-0 w-4 h-4 rounded-full bg-gray-50" />
                </div>

                {/* Bottom Section - Details */}
                <div className="flex-1 p-4 text-white flex flex-col">
                    <h3 className="text-base font-bold mb-2 line-clamp-2 group-hover:text-orange-100 transition-colors">
                        {voucher.title}
                    </h3>

                    <div className="text-sm text-orange-50 mb-3 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">Valid until {formattedExpiry}</span>
                    </div>

                    {/* Code Section */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-dashed border-white/40 mb-3">
                        <div className="flex items-center justify-between">
                            <code className="text-white font-mono font-bold text-sm tracking-wide">{voucherCode}</code>
                            <button
                                onClick={handleCopyCode}
                                className="text-white hover:text-orange-200 transition-colors p-1"
                                aria-label="Copy code"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mt-auto">
                        <div className="text-2xl font-black text-white">
                            £{Number(price).toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
            </div>
        </Link>
    );
}
