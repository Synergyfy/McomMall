"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/service/store/store";
import { UserRole } from "@/service/auth/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowRight, HelpCircle, Store, Banknote, ShieldCheck, Plus, Trash2, Settings } from "lucide-react";

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

// --- Mock Data ---
const MOCK_CLAIMS: Claim[] = [
  {
    id: "c1",
    customerName: "Sarah T.",
    amount: 1.50,
    spendRange: "£6 - £15",
    status: 'PENDING',
    date: "2023-10-27T10:30:00",
    proofUrl: "/placeholder-receipt.jpg", // Needs a real placeholder or handled gracefully
    terminalName: "Bean There Coffee"
  },
  {
    id: "c2",
    customerName: "Mike R.",
    amount: 0.50,
    spendRange: "£1 - £5",
    status: 'APPROVED',
    date: "2023-10-26T14:15:00",
    proofUrl: "/placeholder-receipt.jpg",
    terminalName: "Bean There Coffee"
  },
  {
    id: "c3",
    customerName: "Jenny L.",
    amount: 3.00,
    spendRange: "£16 - £30",
    status: 'REJECTED',
    date: "2023-10-25T09:00:00",
    proofUrl: "/placeholder-receipt.jpg",
    terminalName: "Bean There Coffee"
  }
];

export default function TerminalCashbackPage() {
  const { userRole, userId } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  const { data: config, isLoading: isConfigLoading } = useGetTerminalConfig(userId || undefined);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Terminal Cashback</h2>
          <p className="text-muted-foreground">
            {userRole === UserRole.OWNER
              ? "Manage and approve cashback claims from your terminal."
              : "Track your cashback claims from store visits."}
          </p>
        </div>
        {userRole === UserRole.OWNER && config && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowRewardsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Rewards
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 max-w-3xl mx-auto px-4">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <Banknote className="w-10 h-10 text-orange-600" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Unlock the Power of Terminal Cashback</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          You don't have access to create a terminal cashback yet. Bridge the gap between offline sales and digital loyalty.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full text-left">
        <Card className="border-orange-100 bg-orange-50/50">
          <CardHeader>
            <Store className="w-8 h-8 text-orange-600 mb-2" />
            <CardTitle className="text-lg">What is it?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Terminal Cashback allows you to reward your in-store customers, whether they pay by cash, card, or POS. No integration required.
          </CardContent>
        </Card>
        <Card className="border-orange-100 bg-orange-50/50">
          <CardHeader>
            <ShieldCheck className="w-8 h-8 text-orange-600 mb-2" />
            <CardTitle className="text-lg">Why use it?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Build loyalty, encourage repeat visits, and collect customer data even for walk-ins. Turn anonymous shoppers into loyal fans.
          </CardContent>
        </Card>
        <Card className="border-orange-100 bg-orange-50/50">
          <CardHeader>
            <HelpCircle className="w-8 h-8 text-orange-600 mb-2" />
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            1. Customer buys in-store.<br />
            2. Scans your QR code.<br />
            3. Uploads receipt.<br />
            4. You verify & reward.
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-500">
          Ready to reward your offline customers?
        </p>
        <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white gap-2" onClick={() => setShowRequestDialog(true)}>
          Request Terminal Access <ArrowRight className="w-4 h-4" />
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Terminal Cashback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tell us why you're interested</Label>
            <Textarea
              placeholder="I would like to reward my walk-in customers..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
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
  // Queries
  const { data: statsData } = useGetTerminalStats();
  const { data: pendingData, isLoading: isPendingLoading } = useGetTerminalClaims({ status: 'PENDING' });
  const { data: approvedData } = useGetTerminalClaims({ status: 'APPROVED' });
  const { data: rejectedData } = useGetTerminalClaims({ status: 'REJECTED' });

  const { mutate: updateStatus } = useUpdateClaimStatus();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  if (isConfigLoading) {
    return <div className="p-8 text-center">Checking terminal configuration...</div>;
  }

  if (!config) {
    return <TerminalOnboarding />;
  }

  // Stats
  const stats = statsData || { pendingCount: 0, approvedCount: 0, totalEarned: 0 };

  // Pending Claims
  const pendingClaims = (pendingData?.data || []).map(mapTerminalClaimToUI);

  // History Claims - For now let's just fetch APPROVED ones as "History" to be safe with the API, 
  // or we could try to fetch all and filter. Let's try fetching "APPROVED" for now.

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
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.approvedCount}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Given</CardTitle>
            <div className="h-4 w-4 font-bold text-muted-foreground">£</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{stats.totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Cashback distributed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingClaims.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingClaims.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              {isPendingLoading ? "Loading..." : "No pending claims. All caught up!"}
            </Card>
          ) : (
            <div className="grid gap-4">
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

        <TabsContent value="history" className="mt-4">
          {historyClaims.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No history found.
            </Card>
          ) : (
            <div className="grid gap-4">
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Proof of Purchase</DialogTitle>
          </DialogHeader>
          <div className="relative h-[50vh] w-full bg-gray-100 rounded-md overflow-hidden">
            {selectedProof && (
              <Image
                src={selectedProof}
                alt="Proof"
                fill
                className="object-contain"
                unoptimized // for placeholder
              />
            )}
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

  if (isLoading) return <div>Loading claims...</div>;
  if (error) return <div>Error loading claims.</div>;

  const claims = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {claims.length === 0 ? (
          <p className="text-muted-foreground">No cashback claims found.</p>
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

  const handleRemove = (index: number) => {
    const newRanges = [...ranges];
    newRanges.splice(index, 1);
    setRanges(newRanges);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Cashback Rewards</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
          {ranges.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No rewards configured yet. Add your first range below.</p>
            </div>
          )}

          {ranges.map((range, idx) => (
            <div key={range.id || idx} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg bg-gray-50/50">
              <div className="col-span-3">
                <Label className="text-xs font-semibold mb-1 block">Min Spend (£)</Label>
                <Input
                  type="number"
                  min={0}
                  value={range.minSpend}
                  onChange={(e) => handleChange(idx, 'minSpend', parseFloat(e.target.value))}
                  className="h-8 bg-white"
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs font-semibold mb-1 block">Max Spend (£)</Label>
                <Input
                  type="number"
                  min={0}
                  value={range.maxSpend}
                  onChange={(e) => handleChange(idx, 'maxSpend', parseFloat(e.target.value))}
                  className="h-8 bg-white"
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs font-semibold mb-1 block">Reward (£)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={range.rewardValue}
                  onChange={(e) => handleChange(idx, 'rewardValue', parseFloat(e.target.value))}
                  className="h-8 bg-white"
                />
              </div>
              <div className="col-span-2 flex items-center justify-center pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`active-${range.id || idx}`}
                    checked={range.isActive}
                    onCheckedChange={(checked) => handleChange(idx, 'isActive', !!checked)}
                  />
                  <Label htmlFor={`active-${range.id || idx}`} className="text-xs cursor-pointer select-none">Active</Label>
                </div>
              </div>
              <div className="col-span-1 flex justify-end pb-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemove(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full border-dashed gap-2 py-6 text-muted-foreground hover:text-primary" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> Add Reward Range
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending} className="bg-orange-600 hover:bg-orange-700">
            {isPending ? "Saving..." : "Save Changes"}
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
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
            claim.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
            {claim.status === 'APPROVED' && <Check className="w-6 h-6" />}
            {claim.status === 'REJECTED' && <X className="w-6 h-6" />}
            {claim.status === 'PENDING' && <Clock className="w-6 h-6" />}
          </div>

          <div>
            <h4 className="font-semibold">
              {isBusiness ? claim.customerName : claim.terminalName}
            </h4>
            <p className="text-sm text-muted-foreground">
              {new Date(claim.date).toLocaleDateString()} at {new Date(claim.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{claim.spendRange}</Badge>
              <Badge className={
                claim.status === 'APPROVED' ? 'bg-green-600' :
                  claim.status === 'REJECTED' ? 'bg-red-600' :
                    'bg-yellow-600'
              }>
                {claim.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-sm text-muted-foreground">Cashback</p>
            <p className="text-xl font-bold text-green-600">+£{claim.amount.toFixed(2)}</p>
          </div>

          {isBusiness ? (
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={onViewProof}>
                <Eye className="w-4 h-4 mr-2" /> Proof
              </Button>
              {claim.status === 'PENDING' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onReject}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              Details
            </Button>
          )}
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
    return <Button variant="outline" disabled>Loading Terminal...</Button>;
  }

  if (!terminalId) {
    return (
      <Button variant="outline" disabled title="No active listing found">
        <QrCode className="h-4 w-4 mr-2" />
        No Active Terminal
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="h-4 w-4" />
          Share Terminal
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>
          <TabsContent value="qr" className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-2 rounded-lg border">
              <QRCode
                value={url}
                size={200}
                id="terminal-qr-code"
                logoImage="/favicon.ico"
                logoWidth={40}
                removeQrCodeBehindLogo
              />
            </div>
            <Button onClick={downloadQRCode} className="w-full" variant="secondary">
              <Download className="mr-2 h-4 w-4" /> Download QR
            </Button>
          </TabsContent>
          <TabsContent value="link" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Terminal Link</Label>
              <div className="flex items-center gap-2">
                <Input value={url} readOnly className="h-9 text-xs" />
                <Button size="icon" variant="outline" onClick={copyLink} className="h-9 w-9 shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href={url || "#"} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-4">Loading details...</div>
        ) : claim ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={
                claim.status === "APPROVED" ? "bg-green-600 w-fit" :
                  claim.status === "REJECTED" ? "bg-red-600 w-fit" :
                    "bg-yellow-600 w-fit"
              }>
                {claim.status}
              </Badge>

              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold text-green-600">�{claim.amount.toFixed(2)}</span>

              <span className="text-muted-foreground">Spend Amount:</span>
              <span>�{claim.spendAmount.toFixed(2)}</span>

              <span className="text-muted-foreground">Owner:</span>
              <span>{claim.ownerName || claim.ownerId}</span>

              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(claim.submittedAt).toLocaleString()}</span>

              {claim.reviewedAt && (
                <>
                  <span className="text-muted-foreground">Reviewed:</span>
                  <span>{new Date(claim.reviewedAt).toLocaleString()}</span>
                </>
              )}
            </div>

            {claim.proofUrl && (
              <div className="space-y-2">
                <Label>Proof of Purchase</Label>
                <div className="relative h-[50vh] w-full bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={claim.proofUrl}
                    alt="Proof"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {claim.meta?.gps && (
              <div className="text-xs text-muted-foreground">
                Location: {claim.meta.gps.lat}, {claim.meta.gps.lng}
              </div>
            )}
          </div>
        ) : (
          <div>Failed to load details.</div>
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

