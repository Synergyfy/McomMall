"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/service/store/store";
import { UserRole } from "@/service/auth/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, Eye, Clock, ExternalLink, Copy, Download, QrCode } from "lucide-react";
import Image from "next/image";
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
import { ArrowRight, HelpCircle, Store, Banknote, ShieldCheck, Plus, Trash2, Settings, Calendar, User, UserCheck } from "lucide-react";

// --- Types ---
interface Claim {
  id: string;
  customerName: string;
  amount: number;
  spendRange: string;
  status: ClaimStatus;
  date: string;
  proofUrl: string;
  terminalName?: string; // For customer view
}

export const TerminalCashback = () => {
  const { userRole, userId } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  const { data: config, isLoading: isConfigLoading } = useGetTerminalConfig(userId || undefined);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading Terminal Module...</div>;

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-orange-600" />
            Terminal Management
          </h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {userRole === UserRole.OWNER
              ? "Oversee and validate incoming cashback requests."
              : "Monitor your store visit cashback progress."}
          </p>
        </div>
        {userRole === UserRole.OWNER && config && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRewardsDialog(true)} className="shadow-sm bg-white">
              <Settings className="h-4 w-4 mr-2 text-slate-500" />
              Rewards
            </Button>
            <TerminalShareButton terminalId={userId as string} />
          </div>
        )}
      </div>

      {userRole === UserRole.OWNER ? (
        <BusinessDashboard config={config} isConfigLoading={isConfigLoading} />
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

// --- Terminal Onboarding Component ---
function TerminalOnboarding() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-10 max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto rotate-3 shadow-orange-100 shadow-xl">
          <Banknote className="w-10 h-10 text-orange-600 -rotate-3" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Activate Your Store Terminal</h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
          Reward your walk-in customers and bridge the gap between offline sales and digital loyalty.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[
          { icon: Store, title: "Universal", text: "Reward in-store customers regardless of how they pay." },
          { icon: ShieldCheck, title: "Insight", text: "Collect valuable data and build relationships with walk-ins." },
          { icon: HelpCircle, title: "Simple Flow", text: "Scan, Upload, Verify. A frictionless experience for all." }
        ].map((item, i) => (
          <Card key={i} className="border-none bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-6">
              <item.icon className="w-8 h-8 text-orange-600 mb-3" />
              <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.text}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white gap-3 px-8 h-14 text-lg font-bold rounded-full shadow-lg shadow-orange-200" onClick={() => setShowRequestDialog(true)}>
          Request Early Access <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Request Access</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="font-semibold text-slate-700">Tell us about your store</Label>
            <Textarea
              placeholder="Example: I run a coffee shop and want to reward my regulars who pay with cash..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] rounded-xl resize-none focus:ring-orange-500 border-slate-200"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-[2] h-12 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Business Dashboard Component ---
function BusinessDashboard({ config, isConfigLoading }: { config: any; isConfigLoading: boolean }) {
  const { data: statsData } = useGetTerminalStats();
  const { data: pendingData, isLoading: isPendingLoading } = useGetTerminalClaims({ status: 'PENDING' });
  const { data: approvedData } = useGetTerminalClaims({ status: 'APPROVED' });
  const { data: rejectedData } = useGetTerminalClaims({ status: 'REJECTED' });

  const { mutate: updateStatus } = useUpdateClaimStatus();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  if (isConfigLoading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Syncing configuration...</div>;
  }

  if (!config) {
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
      onSuccess: () => toast.success(`Claim ${action === 'APPROVED' ? 'Approved' : 'Rejected'}`)
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Pending", value: stats.pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved", value: stats.approvedCount, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
          { label: "Volume", value: `£${stats.totalEarned.toFixed(2)}`, icon: Banknote, color: "text-blue-600", bg: "bg-blue-50" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="h-11 p-1 bg-slate-100 rounded-lg w-fit">
            <TabsTrigger value="pending" className="px-6 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Pending <Badge variant="secondary" className="ml-2 bg-slate-200">{pendingClaims.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="px-6 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
          </TabsList>
          
          <div className="text-xs text-slate-400 font-medium">
            Last synced: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <TabsContent value="pending" className="mt-0">
          {pendingClaims.length === 0 ? (
            <Card className="p-12 text-center bg-slate-50/50 border-dashed border-2">
              <div className="max-w-[200px] mx-auto opacity-40 mb-4">
                <Smartphone className="h-16 w-16 mx-auto mb-2" />
              </div>
              <p className="text-slate-500 font-medium">{isPendingLoading ? "Fetching claims..." : "No claims waiting for review."}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingClaims.map(claim => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  isBusiness
                  onViewProof={() => setSelectedProof(claim.proofUrl)}
                  onApprove={() => handleAction(claim.id, 'APPROVED')}
                  onReject={() => handleAction(claim.id, 'REJECTED')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          {historyClaims.length === 0 ? (
            <Card className="p-12 text-center bg-slate-50/50 border-dashed border-2 text-slate-500 font-medium">
              No historical claims found.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyClaims.map(claim => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  isBusiness
                  onViewProof={() => setSelectedProof(claim.proofUrl)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-50 border-b">
            <DialogTitle className="font-bold flex items-center gap-2 text-slate-900">
              <Eye className="h-5 w-5 text-blue-600" />
              Receipt Verification
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[65vh] w-full bg-slate-900">
            {selectedProof && (
              <Image
                src={selectedProof}
                alt="Receipt Proof"
                fill
                className="object-contain p-4"
                unoptimized
              />
            )}
          </div>
          <div className="p-4 bg-white flex justify-end">
            <Button onClick={() => setSelectedProof(null)} className="rounded-xl px-8 h-12 font-bold">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Customer Dashboard Component ---
function CustomerDashboard() {
  const { data, isLoading, error } = useGetTerminalClaims();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Fetching your claims...</div>;
  if (error) return <div className="p-12 text-center text-red-500 font-medium bg-red-50 rounded-xl border border-red-100">Unable to load claims. Please try again.</div>;

  const claims = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {claims.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Smartphone className="h-8 w-8 text-slate-300" />
             </div>
             <p className="text-slate-400 font-medium">You haven't made any claims yet.</p>
             <p className="text-slate-500 text-sm">Scan a store QR code to start earning cashback!</p>
          </div>
        ) : (
          claims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={mapTerminalClaimToUI(claim)}
              isBusiness={false}
              onViewDetails={() => setSelectedClaimId(claim.id)}
            />
          ))
        )}
      </div>

      <ClaimDetailsDialog
        claimId={selectedClaimId}
        onClose={() => setSelectedClaimId(null)}
      />
    </div>
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
      <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <DialogTitle className="font-bold text-xl">Reward Structure</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {ranges.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Plus className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Define your first reward tier.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ranges.map((range, idx) => (
                <div key={range.id || idx} className="grid grid-cols-12 gap-4 items-end bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-colors">
                  <div className="col-span-3">
                    <Label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-tight">Min (£)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={range.minSpend}
                      onChange={(e) => handleChange(idx, 'minSpend', parseFloat(e.target.value))}
                      className="h-10 bg-slate-50 border-none rounded-lg focus:ring-orange-500 font-medium"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-tight">Max (£)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={range.maxSpend}
                      onChange={(e) => handleChange(idx, 'maxSpend', parseFloat(e.target.value))}
                      className="h-10 bg-slate-50 border-none rounded-lg focus:ring-orange-500 font-medium"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-tight">Cashback (£)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={range.rewardValue}
                      onChange={(e) => handleChange(idx, 'rewardValue', parseFloat(e.target.value))}
                      className="h-10 bg-slate-50 border-none rounded-lg focus:ring-orange-500 font-bold text-green-600"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`active-${range.id || idx}`}
                        checked={range.isActive}
                        onCheckedChange={(checked) => handleChange(idx, 'isActive', !!checked)}
                        className="rounded-md h-5 w-5 data-[state=checked]:bg-green-600"
                      />
                      <Label htmlFor={`active-${range.id || idx}`} className="text-xs font-bold text-slate-600 cursor-pointer">Live</Label>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleRemove(range.id || '')}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full h-14 border-dashed border-2 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-600 font-bold gap-2 rounded-2xl" onClick={handleAdd}>
            <Plus className="w-5 h-5" /> New Reward Range
          </Button>
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <Button variant="ghost" className="h-12 px-6 rounded-xl font-medium" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button className="h-12 px-10 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100" onClick={handleSave} disabled={isPending}>
            {isPending ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Shared Components ---

function ClaimCard({
  claim,
  isBusiness,
  onViewProof,
  onApprove,
  onReject,
  onViewDetails
}: {
  claim: Claim;
  isBusiness: boolean;
  onViewProof?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}) {
  const isPending = claim.status === 'PENDING';
  const isApproved = claim.status === 'APPROVED';
  const isRejected = claim.status === 'REJECTED';

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className={`h-1 w-full ${isApproved ? 'bg-green-500' : isRejected ? 'bg-red-500' : 'bg-amber-500'}`} />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${
               isApproved ? 'bg-green-50 text-green-600' : 
               isRejected ? 'bg-red-50 text-red-600' : 
               'bg-amber-50 text-amber-600'
             }`}>
               {isApproved && <Check className="w-6 h-6" />}
               {isRejected && <X className="w-6 h-6" />}
               {isPending && <Clock className="w-6 h-6" />}
             </div>
             <div className="space-y-0.5">
               <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[140px] sm:max-w-none">
                 {isBusiness ? claim.customerName : claim.terminalName}
               </h4>
               <div className="flex items-center text-xs text-slate-500 gap-1.5 font-medium">
                 <Calendar className="h-3 w-3" />
                 {new Date(claim.date).toLocaleDateString()} at {new Date(claim.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rewards</p>
             <p className={`text-xl font-black ${isRejected ? 'text-slate-300 line-through' : 'text-green-600'}`}>
               +£{claim.amount.toFixed(2)}
             </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-slate-50/50 border-slate-200 text-slate-600 rounded-lg px-2 py-0.5 text-[10px] font-bold">
              Spent {claim.spendRange}
            </Badge>
            <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tight ${
              isApproved ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
              isRejected ? 'bg-red-100 text-red-700 hover:bg-red-100' : 
              'bg-amber-100 text-amber-700 hover:bg-amber-100'
            }`}>
              {claim.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1.5">
            {isBusiness ? (
               <>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={onViewProof} title="View Proof">
                   <Eye className="w-4 h-4" />
                 </Button>
                 {isPending && (
                   <div className="flex items-center gap-1 ml-1">
                      <Button size="icon" className="h-8 w-8 rounded-lg bg-green-600 hover:bg-green-700 shadow-sm" onClick={onApprove} title="Approve">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg shadow-sm" onClick={onReject} title="Reject">
                        <X className="w-4 h-4" />
                      </Button>
                   </div>
                 )}
               </>
            ) : (
               <Button variant="outline" size="sm" className="h-8 rounded-lg text-[11px] font-bold px-3 border-slate-200" onClick={onViewDetails}>
                 Details
               </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Terminal Share Button ---
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
      downloadLink.download = `terminal-${terminalId}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("QR Code downloaded");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return <Button variant="outline" size="sm" disabled className="animate-pulse">Loading...</Button>;
  }

  if (!terminalId) {
    return (
      <Button variant="outline" size="sm" disabled title="No active listing found" className="opacity-50">
        <QrCode className="h-4 w-4 mr-2" />
        No Terminal
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-sm rounded-lg font-bold">
          <QrCode className="h-4 w-4" />
          Share Terminal
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[340px] rounded-2xl shadow-2xl p-0 overflow-hidden border-none" align="end">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-none">
            <TabsTrigger value="qr" className="rounded-none font-bold data-[state=active]:bg-white">QR Code</TabsTrigger>
            <TabsTrigger value="link" className="rounded-none font-bold data-[state=active]:bg-white">Direct Link</TabsTrigger>
          </TabsList>
          <TabsContent value="qr" className="flex flex-col items-center gap-6 p-8">
            <div className="bg-white p-4 rounded-3xl border shadow-inner">
              <QRCode
                value={url}
                size={180}
                id="terminal-qr-code"
                logoImage="/favicon.ico"
                logoWidth={40}
                removeQrCodeBehindLogo
                eyeRadius={10}
              />
            </div>
            <div className="space-y-3 w-full">
               <Button onClick={downloadQRCode} className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold" variant="default">
                 <Download className="mr-2 h-4 w-4" /> Save Image
               </Button>
               <p className="text-[10px] text-center text-slate-400 font-medium">Customers can scan this to claim rewards instantly.</p>
            </div>
          </TabsContent>
          <TabsContent value="link" className="space-y-6 p-8">
            <div className="space-y-3">
              <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Shareable URL</Label>
              <div className="flex items-center gap-2">
                <Input value={url} readOnly className="h-12 bg-slate-50 border-none rounded-xl text-xs font-medium text-blue-600" />
                <Button size="icon" variant="outline" onClick={copyLink} className="h-12 w-12 shrink-0 rounded-xl bg-white border-slate-200">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="secondary" className="w-full h-12 rounded-xl font-bold bg-slate-100 text-slate-900 border-none" asChild>
              <Link href={url || "#"} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview Page
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
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <DialogTitle className="font-black text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-400" />
            Claim Information
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
             <p className="text-slate-500 font-medium">Fetching details...</p>
          </div>
        ) : claim ? (
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</Label>
                <div className="pt-1">
                  <Badge className={`rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-tight ${
                    claim.status === "APPROVED" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                    claim.status === "REJECTED" ? "bg-red-100 text-red-700 hover:bg-red-100" :
                    "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }`}>
                    {claim.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rewards</Label>
                <p className="text-xl font-black text-green-600 pt-0.5">£{claim.amount.toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purchase Value</Label>
                <p className="text-sm font-bold text-slate-900">£{claim.spendAmount.toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merchant/Owner</Label>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 truncate">
                  <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{claim.ownerName || claim.ownerId}</span>
                </div>
              </div>

              <div className="col-span-2 space-y-1 pt-2 border-t border-slate-50">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission Time</Label>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(claim.submittedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {claim.proofUrl && (
              <div className="space-y-3 pt-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   Receipt Preview
                   <span className="text-[9px] lowercase bg-slate-100 px-1.5 rounded font-medium text-slate-500 tracking-normal">Verified</span>
                </Label>
                <div className="relative h-[240px] w-full bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 p-2">
                  <Image
                    src={claim.proofUrl}
                    alt="Receipt Proof"
                    fill
                    className="object-contain rounded-xl"
                    unoptimized
                  />
                </div>
              </div>
            )}
            
            <Button onClick={onClose} className="w-full h-12 rounded-xl font-bold bg-slate-100 text-slate-900 hover:bg-slate-200 border-none shadow-none">
              Close Details
            </Button>
          </div>
        ) : (
          <div className="p-12 text-center text-red-500 font-medium">Failed to load claim details.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function mapTerminalClaimToUI(apiClaim: TerminalClaim): Claim {
  const spendAmount = Number(apiClaim.spendAmount) || 0;
  const amount = Number(apiClaim.amount) || 0;

  let customerName = apiClaim.userId;
  if (apiClaim.user) {
    const name = apiClaim.user.name || `${apiClaim.user.firstName} ${apiClaim.user.lastName}`.trim();
    if (name) {
      customerName = name;
      if (apiClaim.user.email) customerName += ` (${apiClaim.user.email})`;
    } else if (apiClaim.user.email) {
      customerName = apiClaim.user.email;
    }
  }

  return {
    id: apiClaim.id,
    customerName: customerName,
    amount: amount,
    spendRange: `£${spendAmount.toFixed(2)}`,
    status: apiClaim.status,
    date: apiClaim.submittedAt,
    proofUrl: apiClaim.proofUrl,
    terminalName: apiClaim.ownerName || apiClaim.ownerId,
  };
}