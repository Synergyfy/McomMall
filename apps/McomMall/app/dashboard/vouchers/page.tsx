'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Percent,
  Clock,
  Users,
  BarChart2,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Inbox,
  Sparkles,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  FileText,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import {
  useGetVoucherProducts,
  useDeleteVoucherProduct,
  useEditVoucherProduct,
  useGetSoldVouchers
} from '@/service/hooks/useVoucherService';
import { VoucherProduct } from '@/service/vouchers/types';

type TabType = 'active' | 'drafts' | 'expired' | 'redeemed' | 'scheduled';

export default function VoucherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { voucherProducts, isLoading: isProductsLoading, mutate: refetchProducts } = useGetVoucherProducts();
  const { soldVouchers, isLoading: isSoldLoading } = useGetSoldVouchers();
  const deleteVoucherProduct = useDeleteVoucherProduct();
  const editVoucherProduct = useEditVoucherProduct();

  // Mock initial items to fallback to for rich UI presentation if DB is empty
  const mockVoucherProducts: VoucherProduct[] = useMemo(() => [
    {
      id: 'mock-vp-1',
      name: 'Summer Flash Sale',
      description: '20% off all dog walking services this July. Minimum spend $50.',
      voucherType: 'discount_code',
      valueType: 'percentage',
      value: 20,
      rules: 'Minimum spend $50. Cannot combine with other offers.',
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      distributionChannels: ['storefront', 'email'],
      status: 'active',
      isEnabled: true,
    },
    {
      id: 'mock-vp-2',
      name: 'New Client Welcome',
      description: 'First wash is free for all new furry neighbors!',
      voucherType: 'gift_voucher',
      valueType: 'currency',
      value: 25,
      rules: 'First-time users only. One voucher per household.',
      expiryDate: null,
      distributionChannels: ['storefront', 'qr'],
      status: 'active',
      isEnabled: true,
    },
    {
      id: 'mock-vp-3',
      name: 'Autumn Cafe Combo',
      description: 'Buy one pumpkin spice latte, get one muffin free.',
      voucherType: 'promotional_coupon',
      valueType: 'percentage',
      value: 50,
      rules: 'BOGO combo deal.',
      expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      distributionChannels: ['email'],
      status: 'expired',
      isEnabled: false,
    }
  ], []);

  const displayedProducts = useMemo(() => {
    const list = voucherProducts && voucherProducts.length > 0 ? voucherProducts : mockVoucherProducts;
    return list.filter(p => {
      // Expose fallback for items created prior to adding voucherType columns
      const pStatus = p.status || (p.isEnabled ? 'active' : 'draft');
      if (activeTab === 'active') return pStatus === 'active';
      if (activeTab === 'drafts') return pStatus === 'draft';
      if (activeTab === 'expired') return pStatus === 'expired' || (p.expiryDate && new Date(p.expiryDate) < new Date());
      if (activeTab === 'scheduled') return pStatus === 'scheduled';
      if (activeTab === 'redeemed') return false; // Handled separately if showing claimed logs
      return true;
    });
  }, [voucherProducts, mockVoucherProducts, activeTab]);

  const activeCount = useMemo(() => {
    const list = voucherProducts && voucherProducts.length > 0 ? voucherProducts : mockVoucherProducts;
    return list.filter(p => (p.status || (p.isEnabled ? 'active' : 'draft')) === 'active').length;
  }, [voucherProducts, mockVoucherProducts]);

  // Handle Pause/Resume Toggle
  const handleToggleStatus = async (product: VoucherProduct) => {
    const currentStatus = product.status || (product.isEnabled ? 'active' : 'draft');
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const newEnabled = newStatus === 'active';
    
    if (product.id.startsWith('mock-')) {
      toast.success(`Simulated campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`);
      return;
    }
    
    try {
      await editVoucherProduct({
        id: product.id,
        updatedProduct: { status: newStatus, isEnabled: newEnabled }
      });
      toast.success(`Campaign status updated to ${newStatus}`);
      refetchProducts();
    } catch (error) {
      toast.error('Failed to update campaign status.');
    }
  };

  // Delete Campaign
  const handleDelete = async (id: string) => {
    if (id.startsWith('mock-')) {
      toast.success('Mock campaign deleted successfully.');
      return;
    }
    try {
      await deleteVoucherProduct(id);
      toast.success('Voucher campaign deleted successfully!');
      refetchProducts();
    } catch (error) {
      toast.error('Failed to delete voucher campaign.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 md:p-10 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#e2bfb0]/30">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Vouchers & Coupons</h1>
          <p className="text-sm text-[#5f5e5e] font-medium mt-1">Design, distribute, and track your local merchant vouchers</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/vouchers/new')}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-full font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle size={16} />
            Start Designing
          </button>
        </div>
      </div>

      {/* Summary Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Metric Card 1 */}
        <div className="md:col-span-4 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-md transition-all">
          <div>
            <span className="text-[11px] font-bold text-[#5f5e5e] uppercase tracking-wider block">Total Active Campaigns</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-[#0b1c30] font-stat-lg">{activeCount}</span>
              <span className="text-primary font-bold text-xs bg-[#ffdbcc]/50 px-2 py-0.5 rounded-full">+12% vs last month</span>
            </div>
          </div>
          <div className="mt-6 flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-[9px] font-black text-on-primary-fixed shadow-sm">DISC</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-[9px] font-black text-primary shadow-sm">BOGO</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-tertiary-fixed flex items-center justify-center text-[9px] font-black text-on-tertiary-fixed shadow-sm">FREE</div>
          </div>
        </div>

        {/* Metric Card 2 (Recent redemptions feed) */}
        <div className="md:col-span-8 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wide">Recent Redemptions</h2>
            <button className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
              View Analytics <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
            {soldVouchers && soldVouchers.length > 0 ? (
              soldVouchers.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-[#f8f9ff] rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#ffdbcc] text-primary rounded-lg">
                      <Ticket size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{v.voucherProduct?.name || 'Voucher Redeemed'}</p>
                      <p className="text-[10px] text-slate-400">
                        Code: {v.code} • Claimed by {v.recipientName || v.recipientEmail || 'Customer'}
                      </p>
                    </div>
                  </div>
                  <span className="text-primary font-black text-xs">
                    {v.voucherProduct?.valueType === 'percentage' ? `-${v.voucherProduct?.value}%` : `-$${v.initialValue}`}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-[#f8f9ff] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#ffdbcc] text-primary rounded-lg">
                      <Ticket size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Summer Coffee Walk (15% OFF)</p>
                      <p className="text-[10px] text-slate-400">Redeemed by Alex Rivera • 2 mins ago</p>
                    </div>
                  </div>
                  <span className="text-primary font-black text-xs">-$4.50</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f8f9ff] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-slate-200 text-slate-500 rounded-lg">
                      <Ticket size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">New Neighbor Welcome</p>
                      <p className="text-[10px] text-slate-400">Redeemed by Sarah J. • 1 hour ago</p>
                    </div>
                  </div>
                  <span className="text-primary font-black text-xs">FREE</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/50">
        {([
          { id: 'active', label: 'Active' },
          { id: 'drafts', label: 'Drafts' },
          { id: 'expired', label: 'Expired' },
          { id: 'scheduled', label: 'Scheduled' }
        ] as { id: TabType; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap active:scale-95 duration-100 ${
              activeTab === tab.id
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-[#5a4136] hover:bg-slate-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Voucher Cards list */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {displayedProducts.length > 0 ? (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {displayedProducts.map((p) => {
                const isMock = p.id.startsWith('mock-');
                const isPromo = p.voucherType === 'promotional_coupon';
                const isGift = p.voucherType === 'gift_voucher';
                const expiryString = p.expiryDate 
                  ? `Ends ${new Date(p.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                  : 'Perpetual';

                return (
                  <div 
                    key={p.id}
                    className="bg-white border border-[#e2e8f0] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-primary-container/20 group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isGift ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-orange-50 border-orange-200 text-primary'
                      }`}>
                        {isGift ? <Gift size={24} /> : <Percent size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-[#0b1c30] text-sm group-hover:text-primary transition-colors">
                            {p.name}
                          </h3>
                          {p.isEnabled && (
                            <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5a4136] mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                        
                        <div className="flex items-center gap-4 text-[10px] text-[#5f5e5e] font-bold uppercase tracking-wider mt-3">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {expiryString}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} className="text-slate-400" />
                            {p.distributionChannels?.join(', ') || 'storefront'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 pt-3 md:pt-0 md:border-none justify-end">
                      <button
                        onClick={() => router.push(`/dashboard/vouchers/products/edit/${p.id}`)}
                        className="px-4 py-2 rounded-xl border border-[#ff6900] text-[#ff6900] font-bold text-xs hover:bg-[#ff6900]/5 active:scale-95 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#5a4136] font-bold text-xs active:scale-95 transition-all"
                      >
                        {p.status === 'active' || p.isEnabled ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/vouchers/${p.id}/analytics`)}
                        className="p-2.5 text-slate-400 hover:text-primary hover:bg-[#ffdbcc]/30 rounded-xl active:scale-95 transition-all"
                        title="Attribution Analytics"
                      >
                        <BarChart2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl active:scale-95 transition-all"
                        title="Delete Campaign"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center text-center bg-white"
            >
              <div className="w-16 h-16 bg-[#eff4ff] rounded-full flex items-center justify-center mb-4 text-[#5f5e5e]">
                <Inbox size={32} />
              </div>
              <h4 className="font-extrabold text-[#0b1c30] text-sm">No Voucher Campaigns</h4>
              <p className="text-xs text-[#5f5e5e] max-w-xs mt-1 mb-6">Create a dynamic voucher campaign to trigger local engagement and boost storefront conversions.</p>
              <button 
                onClick={() => router.push('/dashboard/vouchers/new')}
                className="px-6 py-3 bg-primary-container text-white font-bold rounded-full text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Create Campaign
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button (FAB) for Mobile Creator trigger */}
      <button 
        onClick={() => router.push('/dashboard/vouchers/new')}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 rounded-full bg-primary-container text-white shadow-[0_10px_25px_-5px_rgba(255,105,0,0.4)] flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all group border-2 border-white/20"
      >
        <Plus size={24} />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#213145] text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          Create Voucher
        </span>
      </button>
    </div>
  );
}
