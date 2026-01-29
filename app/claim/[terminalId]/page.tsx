"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Upload, Camera, Check, AlertCircle, Loader2, Wallet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload";

// Mock Data for the Terminal/Business
const MOCK_BUSINESS = {
  id: "BEANTHERE01",
  name: "Bean There Coffee",
  logo: "/placeholder-logo.png", // specific placeholder or default
  ranges: [
    { id: "r1", min: 1, max: 5, reward: 0.50 },
    { id: "r2", min: 6, max: 15, reward: 1.50 },
    { id: "r3", min: 16, max: 30, reward: 3.00 },
    { id: "r4", min: 31, max: 1000, reward: 5.00 },
  ],
};

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const terminalId = params.terminalId as string;

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, fetch business details using terminalId
  const business = MOCK_BUSINESS; 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setSelectedRange("");
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!file || !selectedRange) {
      toast.error("Please complete all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      setIsUploading(true);
      let proofUrl = "";
      try {
         const uploadRes = await uploadFile(file);
         proofUrl = uploadRes.secure_url;
      } catch (err) {
         console.error("Upload failed, using mock url for demo", err);
         proofUrl = previewUrl || ""; 
      }
      setIsUploading(false);

      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Claim Submitted Successfully!");
      setStep(3); 
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Great Job!</h1>
            <p className="text-gray-500 text-lg">
              Your claim for <span className="font-semibold text-gray-900">{business.name}</span> has been submitted.
            </p>
          </div>
          
          <Card className="bg-blue-50 border-blue-100 text-left">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <Clock className="w-4 h-4" /> What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Marco will review your receipt image to verify the transaction.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Once approved, your cashback will be added to your MCOM Wallet.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  You'll get a notification immediately.
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 shadow-md" onClick={() => router.push('/dashboard')}>
              Go to My Wallet
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={resetForm}>
              Submit Another Receipt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 pb-20 px-4 text-gray-900">
      
      {/* 1. Header & Branding */}
      <div className="mb-8 text-center space-y-2">
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-3 py-1">
          MCOM CASHBACK PARTNER
        </Badge>
        <h1 className="text-4xl font-black tracking-tight">{business.name}</h1>
        <p className="text-gray-500 font-medium">Earn rewards on every visit</p>
      </div>

      {/* 2. How it works section (Customer Onboarding) */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-8">
        {[
          { icon: Camera, label: "Snap" },
          { icon: Check, label: "Select" },
          { icon: Wallet, label: "Earn" }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <item.icon className="w-5 h-5 text-orange-500 mb-1" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>

      <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Claim Your Cashback</CardTitle>
          <CardDescription>Follow the steps below to submit your receipt.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          
          {/* Step 1: Proof Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold uppercase tracking-widest text-gray-400">Step 1: Upload Receipt</Label>
              {file && <Badge className="bg-green-500 text-white"><Check className="w-3 h-3 mr-1"/> Ready</Badge>}
            </div>
            
            <div className={`group border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
              previewUrl ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/30'
            }`}>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-inner">
                  <Image 
                    src={previewUrl} 
                    alt="Receipt Preview" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full font-bold">
                      <Camera className="w-5 h-5"/> Tap to Retake
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">Take a photo of your receipt</p>
                  <p className="text-xs text-gray-400 mt-1">Make sure the date and total are visible</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Amount Range */}
          <div className="space-y-4">
            <Label className="text-sm font-bold uppercase tracking-widest text-gray-400">Step 2: Select Spend Range</Label>
            <RadioGroup value={selectedRange} onValueChange={setSelectedRange} className="grid gap-3">
              {business.ranges.map((range) => (
                <div key={range.id}>
                  <RadioGroupItem value={range.id} id={range.id} className="peer sr-only" />
                  <Label
                    htmlFor={range.id}
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-100 bg-white p-4 hover:border-orange-200 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50/50 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex w-full justify-between items-center text-gray-900">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-gray-400 uppercase">Purchase Amount</span>
                        <span className="font-bold text-lg">
                          £{range.min.toFixed(0)} - {range.max >= 1000 ? "No Limit" : `£${range.max.toFixed(0)}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-orange-400 uppercase">Your Reward</span>
                        <span className="font-black text-orange-600 text-xl">
                          £{range.reward.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

        </CardContent>
        
        <CardFooter className="pt-2 pb-8">
          <Button 
            className="w-full h-14 text-lg font-bold shadow-lg shadow-orange-200 bg-orange-500 hover:bg-orange-600 transition-all active:scale-[0.98] text-white" 
            onClick={handleSubmit} 
            disabled={!file || !selectedRange || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isUploading ? "Processing Receipt..." : "Sending Claim..."}
              </>
            ) : (
              "Complete My Claim"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* 3. Help/Info Footer */}
      <p className="mt-8 text-sm text-gray-400 max-w-xs text-center leading-relaxed">
        By submitting, you agree to MCOM's terms. One receipt per claim. Fraudulent attempts will result in account suspension.
      </p>
    </div>
  );
}