"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/service/store/store";
import { UserRole } from "@/service/auth/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, Eye, Clock, ExternalLink, Copy, Download, QrCode, Smartphone, ArrowRight, HelpCircle, Store, Banknote, ShieldCheck, Plus, Trash2, Settings, Calendar, UserCheck, Zap, Receipt, Search, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCode } from "react-qrcode-logo";
import {
  useGetTerminalClaims,
  useGetTerminalClaimDetails,
  useGetTerminalStats,
  useUpdateClaimStatus,
  useGetTerminalConfig,
  useCreateHelpRequest,
  useUpdateTerminalConfig
} from "@/service/terminal-cashback/hook";
import { TerminalClaim, ClaimStatus, HelpRequestType, TerminalConfig } from "@/service/terminal-cashback/types";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- UI Types ---
interface ClaimUI {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerImage?: string;
  amount: number;
  spendAmount: number;
  status: ClaimStatus;
  date: string;
  proofUrl: string;
  terminalName?: string;
}

export const TerminalCashback = () => {
  const { userRole, userId } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  const { data: config, isLoading: isConfigLoading } = useGetTerminalConfig(userId || undefined);

  useEffect(() => {
    setIsClient(true);
    console.log("TerminalCashback Debug - Role:", userRole, "ID:", userId);
  }, [userRole, userId]);

  const role = userRole?.toLowerCase();
  const isManagement = role === 'owner' || role === 'admin';
  console.log("TerminalCashback Debug - Is Management:", isManagement, "Role:", role);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isManagement && (
        <div className="bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
          <ShieldCheck className="h-4 w-4" />
          TERMINAL MANAGEMENT MODE ACTIVE
        </div>
      )}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-orange-600 bg-orange-50 font-bold uppercase tracking-wider text-[10px] px-2 py-0 border-none">
              Live
            </Badge>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Store Terminal Interface</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">Terminal Cashback</h3>
        </div>

        {isManagement && config && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRewardsDialog(true)}
              className="rounded-lg border-slate-200 font-medium text-xs h-9 px-4 gap-2"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              Settings
            </Button>
            <TerminalShareButton terminalId={userId as string} />
          </div>
        )}
      </div>

      {isManagement ? (
        <BusinessDashboard config={config} isConfigLoading={isConfigLoading} isAdmin={role === 'admin'} />
      ) : (
        <CustomerDashboard />
      )}

      {config && (
        <ManageRewardsDialog
          config={config}
          open={showRewardsDialog}
          onOpenChange={setShowRewardsDialog}
        />
      )}
    </div>
  );
}

// --- Business Dashboard Component ---
function BusinessDashboard({ config, isConfigLoading, isAdmin }: { config: any; isConfigLoading: boolean; isAdmin?: boolean }) {
  console.log("BusinessDashboard Debug - Config:", !!config, "IsAdmin:", isAdmin);
  const { data: statsData } = useGetTerminalStats();
  const { data: pendingData, isLoading: isPendingLoading } = useGetTerminalClaims({ status: 'PENDING' });
  const { data: approvedData } = useGetTerminalClaims({ status: 'APPROVED' });
  const { data: rejectedData } = useGetTerminalClaims({ status: 'REJECTED' });

  const { mutate: updateStatus } = useUpdateClaimStatus();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  if (isConfigLoading) {
    return <div className="p-20 text-center text-slate-400 font-medium">Loading Dashboard...</div>;
  }

  if (!config && !isAdmin) {
    return <TerminalOnboarding />;
  }

  const stats = statsData || { pendingCount: 0, approvedCount: 0, totalEarned: 0 };
  const pendingClaims = (pendingData?.data || []).map(mapTerminalClaimToUI);
  const historyClaims = [
    ...(approvedData?.data || []),
    ...(rejectedData?.data || [])
  ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .map(mapTerminalClaimToUI);

  const handleAction = (id: string, action: ClaimStatus) => {
    updateStatus({ id, status: action }, {
      onSuccess: () => toast.success(`Cashback ${action.toLowerCase()}`)
    });
  };

  return (
    <>
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", value: stats.pendingCount, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved", value: stats.approvedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Distributed", value: `£${Number(stats.totalEarned).toFixed(2)}`, color: "text-blue-600", bg: "bg-blue-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100">
          <TabsList className="bg-transparent h-10 p-0 gap-6">
            <TabsTrigger value="pending" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 rounded-none h-10 px-2 text-xs font-semibold">
              Pending Items
              {pendingClaims.length > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-600 h-4 px-1.5 rounded-full text-[9px] font-bold">
                  {pendingClaims.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none h-10 px-2 text-xs font-semibold text-slate-400">
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="mt-0 outline-none">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {pendingClaims.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 text-slate-300" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Queue is empty</h4>
                <p className="text-xs text-slate-400 mt-1">New customer claims will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Submission</th>
                      <th className="px-6 py-4 text-center">Receipt Amount</th>
                      <th className="px-6 py-4 text-center">Cashback</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-100">
                              <AvatarImage src={claim.customerImage} alt={claim.customerName} />
                              <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                                {claim.customerName ? claim.customerName.substring(0, 2).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-900 text-sm truncate">{claim.customerName}</span>
                              {claim.customerEmail && <span className="text-[11px] text-slate-500 truncate lowercase">{claim.customerEmail}</span>}
                              <span className="text-[9px] text-slate-300 font-mono mt-0.5">ID: {claim.id.slice(0, 4)}...</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-600">{new Date(claim.date).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-400">{new Date(claim.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            £{Number(claim.spendAmount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-emerald-600">
                            +£{Number(claim.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedProof(claim.proofUrl)}
                              className="h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" /> View Proof
                            </Button>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-sm"
                                onClick={() => handleAction(claim.id, 'APPROVED')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 px-4 rounded-lg text-[11px] font-bold shadow-sm"
                                onClick={() => handleAction(claim.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 outline-none">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {historyClaims.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
                No past transactions
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Reward</th>
                      <th className="px-6 py-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {historyClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-md bg-slate-100 border border-slate-50">
                              <AvatarImage src={claim.customerImage} alt={claim.customerName} />
                              <AvatarFallback className="text-slate-400 text-[9px] font-bold uppercase">
                                {claim.customerName ? claim.customerName.substring(0, 2).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-700 text-xs truncate">{claim.customerName}</span>
                              <span className="text-[9px] text-slate-300 font-mono">Ref: {claim.id.slice(0, 4)}...</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(claim.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0 h-5 text-[9px] font-bold uppercase tracking-wider border-none ${claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                              claim.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                                'bg-amber-50 text-amber-600'
                            }`}>
                            {claim.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-bold ${claim.status === 'REJECTED' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                            £{Number(claim.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-md hover:bg-slate-100" onClick={() => setSelectedProof(claim.proofUrl)}>
                            <Eye className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Proof Dialog */}
      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="absolute top-4 right-4 z-50">
            <Button variant="ghost" size="icon" onClick={() => setSelectedProof(null)} className="h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 text-white transition-all backdrop-blur-sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-slate-900 flex items-center justify-center p-6 min-h-[400px]">
            {selectedProof && (
              <div className="relative w-full h-[65vh]">
                <img src={selectedProof} alt="Receipt Analysis" unoptimized className="absolute inset-0 w-full h-full object-contain" />
              </div>
            )}
          </div>
          <div className="bg-white px-6 py-4 border-t flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receipt Verified</span>
            </div>
            <Button onClick={() => setSelectedProof(null)} size="sm" className="rounded-lg font-bold text-xs bg-slate-900 hover:bg-black px-6">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Customer Dashboard Component ---
function CustomerDashboard() {
  console.log("CustomerDashboard Rendering");
  const { data, isLoading, error } = useGetTerminalClaims();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  if (isLoading) return <div className="p-24 text-center text-slate-400 font-semibold animate-pulse tracking-widest text-sm uppercase">Accessing Rewards...</div>;
  if (error) return <div className="p-12 text-center text-red-500 font-semibold bg-red-50 rounded-2xl border border-red-100 text-[10px] uppercase">Connection Lost. Please try again.</div>;

  const claims = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {claims.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-dashed border-slate-200">
              <Receipt className="h-6 w-6 text-slate-300" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">No history found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">Scan a terminal QR code to begin earning cashback.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4 text-center">Visit Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Reward</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {claims.map((claim) => {
                  const uiClaim = mapTerminalClaimToUI(claim);
                  return (
                    <tr key={uiClaim.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-100">
                            <AvatarImage src={uiClaim.customerImage} alt={uiClaim.customerName} />
                            <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                              {uiClaim.customerName ? uiClaim.customerName.substring(0, 2).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 text-sm truncate">{uiClaim.customerName}</span>
                            {uiClaim.customerEmail && <span className="text-[11px] text-slate-500 truncate lowercase">{uiClaim.customerEmail}</span>}
                            <div className="flex items-center gap-1 text-[9px] text-slate-300 font-mono mt-0.5">
                              <span>Ref: {uiClaim.id.slice(0, 4)}...</span>
                              <span className="text-slate-200">|</span>
                              <span className="truncate max-w-[80px]">{uiClaim.terminalName}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 text-xs font-medium">
                        {new Date(uiClaim.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className={`rounded-md px-2 py-0 h-5 text-[9px] font-bold uppercase tracking-wider border-none ${uiClaim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                            uiClaim.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                              'bg-amber-50 text-amber-600'
                          }`}>
                          {uiClaim.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-emerald-600 tracking-tight">
                          +£{Number(uiClaim.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedClaimId(uiClaim.id)}
                          className="h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-wider bg-slate-50 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClaimDetailsDialog
        claimId={selectedClaimId}
        onClose={() => setSelectedClaimId(null)}
      />
    </div>
  );
}

// --- Terminal Onboarding Component ---
function TerminalOnboarding() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-10 max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase italic">Enable Store Terminal</h2>
        <p className="text-slate-500 text-base max-w-2xl mx-auto font-medium">
          Start rewarding your walk-in customers today. Bridge the gap between physical transactions and digital loyalty.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[
          { icon: Receipt, title: "Receipt Scan", text: "Customers scan your QR code and upload their receipt.", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: UserCheck, title: "Verify", text: "Review the receipt and approve the reward.", color: "text-green-600", bg: "bg-green-50" },
          { icon: Banknote, title: "Reward", text: "Cashback is instantly credited to the customer.", color: "text-purple-600", bg: "bg-purple-50" }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-start p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed text-left">{item.text}</p>
          </div>
        ))}
      </div>

      <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest px-8 h-14 rounded-xl shadow-lg transition-all" onClick={() => setShowRequestDialog(true)}>
        Activate Now <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      <RequestAccessDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} />
    </div>
  );
}

// --- Request Access Dialog ---
function RequestAccessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mutate: createHelpRequest, isPending: isSubmitting } = useCreateHelpRequest();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createHelpRequest({
      type: HelpRequestType.TERMINAL_CASHBACK_SETUP,
      title: "Terminal Cashback Access Request",
      description: message
    }, {
      onSuccess: () => {
        toast.success("Request sent! Support will contact you shortly.");
        onOpenChange(false);
        setMessage("");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to send request. Please try again.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Request Terminal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="font-bold text-slate-500 text-[10px] uppercase tracking-widest ml-1">Business Details</Label>
            <Textarea
              placeholder="Tell us about your business and why you'd like to use terminal cashback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[140px] rounded-2xl bg-slate-50 border-none p-5 focus:ring-2 focus:ring-orange-500 font-medium"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-[2] h-12 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-orange-100" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ManageRewardsDialog({ config, open, onOpenChange }: { config: TerminalConfig; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mutate: updateConfig, isPending } = useUpdateTerminalConfig();
  const [ranges, setRanges] = useState(config.ranges || []);

  useEffect(() => {
    if (open && config) {
      setRanges(config.ranges || []);
    }
  }, [open, config]);

  const handleAdd = () => {
    setRanges([
      ...ranges,
      // @ts-ignore
      {
        id: crypto.randomUUID(),
        minSpend: 0,
        maxSpend: 0,
        rewardValue: 0,
        isActive: true
      }
    ]);
  };

  const handleRemove = (id: string) => {
    setRanges(ranges.filter(r => (r.id || '') !== id));
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newRanges = [...ranges];
    // @ts-ignore
    newRanges[index] = { ...newRanges[index], [field]: value };
    setRanges(newRanges);
  };

  const handleSave = () => {
    if (!config) return;
    updateConfig({
      userId: config.userId,
      data: { ranges }
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight uppercase leading-none">Rewards Config</DialogTitle>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-14">Set your tier-based cashback rates</p>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {ranges.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
              <Plus className="h-8 w-8 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold italic text-xs">No reward tiers defined</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ranges.map((range, idx) => (
                <div key={range.id || idx} className="grid grid-cols-12 gap-3 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min Spend</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">£</span>
                      <Input
                        type="number"
                        min={0}
                        value={range.minSpend}
                        onChange={(e) => handleChange(idx, 'minSpend', parseFloat(e.target.value))}
                        className="bg-white border-slate-100 rounded-xl h-9 pl-7 font-bold text-xs"
                      />
                    </div>
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Spend</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">£</span>
                      <Input
                        type="number"
                        min={0}
                        value={range.maxSpend}
                        onChange={(e) => handleChange(idx, 'maxSpend', parseFloat(e.target.value))}
                        className="bg-white border-slate-100 rounded-xl h-9 pl-7 font-bold text-xs"
                      />
                    </div>
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cashback</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300 font-bold text-xs">£</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={range.rewardValue}
                        onChange={(e) => handleChange(idx, 'rewardValue', parseFloat(e.target.value))}
                        className="bg-white border-slate-100 rounded-xl h-9 pl-7 font-bold text-xs text-green-600"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center pb-2">
                    <div className="flex flex-col items-center gap-1">
                      <Checkbox
                        id={`active-${range.id || idx}`}
                        checked={range.isActive}
                        onCheckedChange={(checked) => handleChange(idx, 'isActive', !!checked)}
                        className="rounded-md h-5 w-5 data-[state=checked]:bg-emerald-500 border-slate-200"
                      />
                      <Label htmlFor={`active-${range.id || idx}`} className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Live</Label>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end pb-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleRemove(range.id || '')}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full h-12 border-2 border-dashed border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 text-slate-300 hover:text-orange-500 font-bold text-sm gap-2 rounded-xl transition-all" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> ADD NEW TIER
          </Button>
        </div>

        <div className="p-8 bg-slate-50 flex gap-3">
          <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-[2] h-12 bg-slate-900 hover:bg-black rounded-xl font-bold text-sm uppercase tracking-tight shadow-xl shadow-slate-200 text-white" onClick={handleSave} disabled={isPending}>
            {isPending ? "Syncing..." : "Update Logic"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Shared Components ---

function TerminalShareButton({ terminalId, isLoading }: { terminalId?: string; isLoading?: boolean }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && terminalId) {
      setUrl(`${window.location.origin}/claim/${terminalId}`);
    }
  }, [terminalId]);

  const downloadQRCode = () => {
    const canvas = document.getElementById("terminal-qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `terminal-qr-${terminalId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("Terminal QR Exported");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Terminal Link Copied");
  };

  if (isLoading) {
    return <Button variant="outline" size="sm" disabled className="animate-pulse h-9 rounded-lg">Loading...</Button>;
  }

  if (!terminalId) {
    return (
      <Button variant="outline" size="sm" disabled className="opacity-50 h-9 rounded-lg bg-slate-50 text-slate-400 font-bold border-none px-4">
        Offline
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 bg-slate-900 hover:bg-black text-white shadow-sm rounded-lg font-bold h-9 px-4 text-xs uppercase tracking-wider">
          <QrCode className="h-3.5 w-3.5 text-orange-400" />
          Share QR
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] rounded-2xl shadow-2xl p-0 overflow-hidden border-none" align="end">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 h-12 rounded-none">
            <TabsTrigger value="qr" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600">Scan Code</TabsTrigger>
            <TabsTrigger value="link" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900">Direct Link</TabsTrigger>
          </TabsList>
          <TabsContent value="qr" className="flex flex-col items-center gap-6 p-8 bg-white">
            <div className="bg-white p-4 rounded-2xl border shadow-inner">
              <QRCode
                value={url}
                size={140}
                id="terminal-qr-code"
                logoImage="/favicon.ico"
                logoWidth={36}
                removeQrCodeBehindLogo
                eyeRadius={8}
              />
            </div>
            <Button onClick={downloadQRCode} className="w-full h-10 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-xs uppercase tracking-widest" variant="default">
              Save PNG
            </Button>
          </TabsContent>
          <TabsContent value="link" className="space-y-6 p-8 bg-white">
            <div className="space-y-3">
              <Label className="text-slate-400 font-bold text-[9px] uppercase tracking-widest ml-1">Terminal Redirect URL</Label>
              <div className="flex items-center gap-2">
                <Input value={url} readOnly className="h-10 pl-4 bg-slate-50 border-none rounded-xl text-[10px] font-bold text-blue-600" />
                <Button size="icon" variant="outline" onClick={copyLink} className="h-10 w-10 shrink-0 rounded-xl bg-white border-slate-100 hover:bg-slate-50 shadow-sm">
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              </div>
            </div>
            <Button variant="secondary" className="w-full h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-slate-900 hover:bg-black text-white border-none shadow-lg" asChild>
              <Link href={url || "#"} target="_blank">
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Preview
              </Link>
            </Button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

function ClaimDetailsDialog({ claimId, onClose }: { claimId: string | null; onClose: () => void }) {
  const { data: claim, isLoading } = useGetTerminalClaimDetails(claimId);

  return (
    <Dialog open={!!claimId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Receipt className="h-16 w-16 rotate-12" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-orange-400" />
              <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">Merchant</span>
            </div>
            <DialogTitle className="font-bold text-xl tracking-tight">
              {claim?.ownerName || claim?.ownerId || 'Business Name'}
            </DialogTitle>
          </div>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-white">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Querying database...</p>
          </div>
        ) : claim ? (
          <div className="p-8 space-y-8 bg-white">
            <div className="grid grid-cols-2 gap-y-8 gap-x-6">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Status</Label>
                <div className="pt-1">
                  <Badge variant="secondary" className={`rounded-md px-2 py-0 h-5 text-[9px] font-bold uppercase tracking-wider border-none ${claim.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                      claim.status === "REJECTED" ? "bg-rose-50 text-rose-600" :
                        "bg-amber-50 text-amber-600"
                    }`}>
                    {claim.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <Label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Cashback</Label>
                <p className="text-2xl font-bold text-emerald-500 pt-0.5 tracking-tight">£{Number(claim.amount).toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Spent</Label>
                <p className="text-base font-bold text-slate-900 tracking-tight">£{Number(claim.spendAmount).toFixed(2)}</p>
              </div>

              <div className="space-y-1 text-right">
                <Label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Submitted</Label>
                <p className="text-xs font-medium text-slate-600 pt-1">{new Date(claim.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {claim.proofUrl && (
              <div className="space-y-3 pt-2">
                <Label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic ml-1">Receipt Image</Label>
                <div className="relative h-[260px] w-full bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner">
                  <img src={claim.proofUrl} alt="Receipt Verification" unoptimized className="absolute inset-0 w-full h-full object-contain p-4" />
                </div>
              </div>
            )}

            <Button onClick={onClose} className="w-full h-14 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-black text-white border-none shadow-none uppercase tracking-widest transition-all">
              Close Record
            </Button>
          </div>
        ) : (
          <div className="p-20 text-center text-rose-500 font-bold bg-white text-xs">ERROR RETRIEVING DATA</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function mapTerminalClaimToUI(apiClaim: TerminalClaim): ClaimUI {
  const spendAmount = Number(apiClaim.spendAmount) || 0;
  const amount = Number(apiClaim.amount) || 0;

  let customerName = "Guest User";
  let customerEmail = undefined;
  let customerImage = undefined;

  if (apiClaim.user) {
    customerName = apiClaim.user.name || `${apiClaim.user.firstName} ${apiClaim.user.lastName}`.trim() || apiClaim.user.email || "Unknown User";
    customerEmail = apiClaim.user.email;
    customerImage = apiClaim.user.profilePictureUrl;
  }

  return {
    id: apiClaim.id,
    customerName,
    customerEmail,
    customerImage,
    amount,
    spendAmount,
    status: apiClaim.status,
    date: apiClaim.submittedAt,
    proofUrl: apiClaim.proofUrl,
    terminalName: apiClaim.ownerName || apiClaim.ownerId,
  };
}
