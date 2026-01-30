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
import { Check, X, Eye, Clock, ExternalLink, Copy, Download, QrCode } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCode } from "react-qrcode-logo";

// --- Types ---
type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  const { userRole } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);

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
        {userRole === UserRole.OWNER && (
           <TerminalShareButton terminalId="BEANTHERE01" />
        )}
      </div>

      {userRole === UserRole.OWNER ? <BusinessDashboard /> : <CustomerDashboard />}
    </div>
  );
}

// --- Business Dashboard Component ---
function BusinessDashboard() {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const pendingClaims = claims.filter(c => c.status === 'PENDING');
  const historyClaims = claims.filter(c => c.status !== 'PENDING');

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: action } : c));
    toast.success(`Claim ${action === 'APPROVED' ? 'Approved' : 'Rejected'}`);
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
            <div className="text-2xl font-bold">{pendingClaims.length}</div>
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
              {claims.filter(c => c.status === 'APPROVED').length}
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
              £{claims.filter(c => c.status === 'APPROVED').reduce((acc, c) => acc + c.amount, 0).toFixed(2)}
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
              No pending claims. All caught up!
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
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Proof of Purchase</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-md overflow-hidden">
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
  // In real app, filter claims by current user ID
  const myClaims = MOCK_CLAIMS; 

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {myClaims.map(claim => (
           <ClaimCard key={claim.id} claim={claim} isBusiness={false} />
        ))}
      </div>
    </div>
  );
}

// --- Shared Components ---

function ClaimCard({ 
  claim, 
  isBusiness, 
  onViewProof, 
  onApprove, 
  onReject 
}: { 
  claim: Claim; 
  isBusiness: boolean; 
  onViewProof?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            claim.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
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
              {new Date(claim.date).toLocaleDateString()} at {new Date(claim.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
           
           {isBusiness && (
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
           )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Terminal Share Button ---
function TerminalShareButton({ terminalId }: { terminalId: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
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