"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Gift,
    Ticket,
    Tag,
    LayoutTemplate,
    Loader2,
    Trash2,
    Pencil,
    ChevronRight,
    Zap
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useGetGiftCardTemplates, useDeleteGiftCardTemplate } from '@/service/gift-card/hook';
import { useGetVoucherProducts, useDeleteVoucherProduct } from '@/service/hooks/useVoucherService';
import { useGetCouponProducts, useDeleteCouponProduct } from '@/service/coupon-products/hooks';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CentralizedTemplatesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("gift-cards");

    // Hooks
    const { data: giftCardTemplates, isLoading: isLoadingGC } = useGetGiftCardTemplates();
    const { voucherProducts, isLoading: isLoadingVoucher } = useGetVoucherProducts();
    const { data: couponProducts, isLoading: isLoadingCoupon } = useGetCouponProducts();

    const deleteGC = useDeleteGiftCardTemplate();
    const deleteVoucher = useDeleteVoucherProduct();
    const deleteCoupon = useDeleteCouponProduct();

    const handleDelete = async (type: 'gift-card' | 'voucher' | 'coupon', id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            if (type === 'gift-card') await deleteGC.mutateAsync(id);
            else if (type === 'voucher') await deleteVoucher(id);
            else if (type === 'coupon') await deleteCoupon.mutateAsync(id);
            toast.success("Template deleted successfully");
        } catch (error) {
            toast.error("Failed to delete template");
        }
    };

    const renderTemplateList = (
        type: 'gift-card' | 'voucher' | 'coupon',
        data: any[] | undefined,
        isLoading: boolean,
        createPath: string
    ) => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            );
        }

        if (!data || data.length === 0) {
            return (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LayoutTemplate className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No {type} templates found</h3>
                    <p className="text-slate-500 mb-6">Create your first template to get started</p>
                    <Button onClick={() => router.push(`${createPath}/new`)} className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200">
                        <div
                            className="h-32 w-full relative group-hover:scale-105 transition-transform duration-500"
                            style={{
                                backgroundColor: item.backgroundColor || '#f1f5f9',
                                backgroundImage: item.backgroundImageUrl || item.backgroundImage ? `url(${item.backgroundImageUrl || item.backgroundImage})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90" onClick={() => handleDelete(type, item.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                        <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</p>
                                </div>
                                <Zap className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-medium">
                                    {item.fixedAmounts?.length > 0 ? `£${item.fixedAmounts[0]}${item.fixedAmounts.length > 1 ? '+' : ''}` : 'Custom'}
                                </span>
                                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 p-0 h-auto font-bold" onClick={() => router.push(`${createPath}/edit/${item.id}`)}>
                                    Edit <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Templates Library</h1>
                    <p className="text-slate-500 font-medium mt-1">Design and manage standard templates for issuance by businesses</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => {
                            if (activeTab === 'gift-cards') router.push('/admin/gift-cards/templates/new');
                            if (activeTab === 'vouchers') router.push('/admin/vouchers/products/new');
                            if (activeTab === 'coupons') router.push('/admin/coupons/products/new');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New {activeTab === 'gift-cards' ? 'Gift Card' : activeTab === 'vouchers' ? 'Voucher' : 'Coupon'}
                    </Button>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-100 p-1 rounded-xl w-full sm:w-auto h-auto flex flex-wrap sm:inline-flex">
                    <TabsTrigger value="gift-cards" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 font-bold gap-2">
                        <Gift className="h-4 w-4" /> Gift Cards
                    </TabsTrigger>
                    <TabsTrigger value="vouchers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 font-bold gap-2">
                        <Ticket className="h-4 w-4" /> Vouchers
                    </TabsTrigger>
                    <TabsTrigger value="coupons" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 font-bold gap-2">
                        <Tag className="h-4 w-4" /> Coupons
                    </TabsTrigger>
                    <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 font-bold gap-2">
                        <LayoutTemplate className="h-4 w-4" /> Products
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="gift-cards" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    {renderTemplateList('gift-card', giftCardTemplates, isLoadingGC, '/admin/gift-cards/templates')}
                </TabsContent>

                <TabsContent value="vouchers" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    {renderTemplateList('voucher', voucherProducts, isLoadingVoucher, '/admin/vouchers/products')}
                </TabsContent>

                <TabsContent value="coupons" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    {renderTemplateList('coupon', couponProducts, isLoadingCoupon, '/admin/coupons/products')}
                </TabsContent>

                <TabsContent value="products" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Advanced Product Templates</h2>
                            <Button variant="outline" onClick={() => router.push('/admin/templates/products')}>
                                Manage Advanced Templates <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                        <p className="text-slate-500 mb-0">Marketplace product templates with variant management are managed in a specialized editor.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
