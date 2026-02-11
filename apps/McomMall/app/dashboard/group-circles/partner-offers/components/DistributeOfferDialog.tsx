"use client";

import React, { useState, useRef } from "react";
import { 
    Dialog, DialogContent, DialogDescription, 
    DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Copy, Check, Share2, MessageCircle, 
    Mail, QrCode, Download, Clipboard,
    Send, Users, Smartphone, Globe, Zap
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DistributeOfferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: any;
}

export function DistributeOfferDialog({ open, onOpenChange, campaign }: DistributeOfferDialogProps) {
    const [hasCopied, setHasCopied] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);
    
    if (!campaign) return null;

    // In a real app, this would be a tracked affiliate link
    const distributionLink = `${window.location.origin}/campaigns/${campaign.id}?ref=partner-collab`;

    const handleCopy = () => {
        navigator.clipboard.writeText(distributionLink);
        setHasCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setHasCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const text = encodeURIComponent(`Check out this offer from ${campaign.businessName}: ${campaign.campaignName}! ${distributionLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareEmail = () => {
        const subject = encodeURIComponent(`Exclusive Offer: ${campaign.campaignName}`);
        const body = encodeURIComponent(`Hi,

I thought you might be interested in this offer from our partner ${campaign.businessName}:

${campaign.campaignName}

Check it out here: ${distributionLink}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const getQRBlob = async (): Promise<Blob | null> => {
        if (!qrRef.current) return null;
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return null;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const size = 1000;
        canvas.width = size;
        canvas.height = size;

        return new Promise((resolve) => {
            img.onload = () => {
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, size, size);
                    canvas.toBlob(resolve, 'image/png');
                } else {
                    resolve(null);
                }
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
    };

    const downloadQR = async () => {
        const blob = await getQRBlob();
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `offer-qr-${campaign.id.slice(0,8)}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("QR Code downloaded!");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                <div className="bg-zinc-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight">Distribute Offer</h2>
                            <p className="text-zinc-400 text-sm font-medium">{campaign.campaignName}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <Tabs defaultValue="digital" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 bg-zinc-100 rounded-2xl p-1 h-12">
                            <TabsTrigger value="digital" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Digital Share</TabsTrigger>
                            <TabsTrigger value="assets" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Physical Assets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="digital" className="space-y-6 mt-0">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Affiliate Link</label>
                                <div className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-2xl">
                                    <Input 
                                        value={distributionLink} 
                                        readOnly 
                                        className="border-none bg-transparent focus-visible:ring-0 text-zinc-600 text-sm font-medium"
                                    />
                                    <Button 
                                        onClick={handleCopy}
                                        className={cn(
                                            "rounded-xl px-4 h-10 transition-all duration-300",
                                            hasCopied ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-900 hover:bg-zinc-800"
                                        )}
                                    >
                                        {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button 
                                    variant="outline" 
                                    onClick={shareWhatsApp}
                                    className="h-14 rounded-2xl border-zinc-200 gap-3 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">WhatsApp</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={shareEmail}
                                    className="h-14 rounded-2xl border-zinc-200 gap-3 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">Email</span>
                                </Button>
                            </div>

                            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-start gap-3">
                                <Zap className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-800 leading-relaxed font-medium">
                                    <strong>Automatic Tracking:</strong> Every scan or click through these channels is automatically attributed to your account for rewards.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="assets" className="space-y-6 mt-0">
                            <div className="flex flex-col items-center justify-center py-4 space-y-6">
                                <div 
                                    ref={qrRef}
                                    className="p-6 bg-white rounded-[2rem] shadow-xl border border-zinc-100 shadow-orange-500/5 transition-transform hover:scale-105 duration-500"
                                >
                                    <QRCode 
                                        value={distributionLink} 
                                        size={180}
                                        level="H"
                                    />
                                </div>

                                <div className="flex gap-3 w-full">
                                    <Button 
                                        onClick={downloadQR}
                                        className="flex-1 h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold gap-2"
                                    >
                                        <Download className="w-4 h-4" /> PNG Image
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 h-12 rounded-2xl border-zinc-200 font-bold gap-2"
                                    >
                                        <Smartphone className="w-4 h-4" /> Digital Flyer
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-center">
                        <Button 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            className="text-zinc-400 font-bold hover:text-zinc-600"
                        >
                            Close Distribution Panel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
