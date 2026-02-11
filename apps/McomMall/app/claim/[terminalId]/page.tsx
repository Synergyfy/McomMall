"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Upload, Camera, Check, AlertCircle, Loader2, Wallet, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTerminalClaim, useGetTerminalConfig } from "@/service/terminal-cashback/hook";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload";
import Cropper, { Area } from "react-easy-crop";
import { useAuth } from "@/service/auth/hook";
import { AuthModal } from "@/components/AuthModal";

// Utility for cropping image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], "cropped-receipt.jpg", { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg");
  });
}

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
  const { user } = useAuth();
  const { mutateAsync: createClaim } = useCreateTerminalClaim();
  const { data: config, isLoading: isConfigLoading } = useGetTerminalConfig(terminalId);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Cropping State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // Derived business data from config or fallback to mock
  const business = config ? {
    id: config.userId,
    name: config.userName,
    ranges: config.ranges?.map(r => ({
      id: r.id,
      min: r.minSpend,
      max: r.maxSpend,
      reward: r.rewardValue
    })) || []
  } : MOCK_BUSINESS;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const imageUrl = URL.createObjectURL(selectedFile);
      setCropImage(imageUrl);
      setShowCropper(true);
    }
  };

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropConfirm = async () => {
    if (cropImage && croppedAreaPixels) {
      try {
        const croppedFile = await getCroppedImg(cropImage, croppedAreaPixels);
        setFile(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
        setShowCropper(false);
        setCropImage(null);
      } catch (e) {
        console.error(e);
        toast.error("Failed to crop image");
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setSelectedRange("");
    setTermsAccepted(false);
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please upload a receipt");
      return;
    }

    if (!selectedRange) {
      toast.error("Please select a purchase amount range");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms to continue");
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Get Geolocation (Optional but recommended)
      let gps: { lat: number; lng: number } | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        gps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (e) {
        console.warn("GPS not available", e);
      }

      // 2. Upload File
      setIsUploading(true);
      let proofUrl = "";
      try {
        const uploadRes = await uploadFile(file);
        proofUrl = uploadRes.secure_url;
      } catch (err) {
        console.error("Upload failed", err);
        toast.error("Failed to upload receipt image.");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);

      // 3. Prepare Payload
      const range = business.ranges.find(r => r.id === selectedRange);
      if (!range) throw new Error("Invalid range selected");

      // 4. Submit Claim
      await createClaim({
        ownerId: terminalId,
        amount: range.reward,
        spendAmount: range.min,
        proofUrl: proofUrl,
        meta: {
          gps,
          description: `Claim for ${business.name} - Range £${range.min}-£${range.max}`
        }
      });

      toast.success("Claim Submitted Successfully!");
      setStep(3);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

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

      {/* 2. How it works section (Progress Tracker) */}
      <div className="w-full max-w-md mb-10 relative">
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200" />
        <div className="relative flex justify-between px-4">
          {[
            { icon: Camera, label: "Snap" },
            { icon: Check, label: "Select" },
            { icon: Wallet, label: "Earn" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center z-10 shadow-sm relative">
                  <item.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm z-20">
                  {idx + 1}
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
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
              {file && <Badge className="bg-green-500 text-white"><Check className="w-3 h-3 mr-1" /> Ready</Badge>}
            </div>

            <div className={`group border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${previewUrl ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/30'
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
                      <Camera className="w-5 h-5" /> Tap to Retake
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
            {business.ranges.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No active rewards found</p>
                <p className="text-xs text-gray-400">This terminal hasn't set up any cashback ranges yet.</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Step 3: Terms & Agreement */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                className="mt-1 border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                I agree to MCOM's <Link href="/terms-and-conditions" className="underline text-orange-500 hover:text-orange-600" target="_blank">terms</Link>. I understand that fraudulent attempts will result in account suspension and only one receipt is allowed per claim.
              </Label>
            </div>
          </div>

        </CardContent>

        <CardFooter className="pt-2 pb-8">
          <Button
            className="w-full h-14 text-lg font-bold shadow-lg shadow-orange-200 bg-orange-500 hover:bg-orange-600 transition-all active:scale-[0.98] text-white"
            onClick={handleSubmit}
            disabled={!file || !termsAccepted || isSubmitting}
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

      {/* Cropping Dialog */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="p-4 bg-white">
            <DialogTitle>Crop Your Receipt</DialogTitle>
          </DialogHeader>
          <div className="relative h-[400px] w-full bg-gray-900">
            {cropImage && (
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5} // Adjust aspect ratio as needed for receipts
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <DialogFooter className="p-4 bg-white flex flex-row gap-2 sm:justify-between items-center">
            <div className="flex-1">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowCropper(false);
                setCropImage(null);
              }}>
                Cancel
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleCropConfirm}>
                Apply Crop
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleSubmit(); // Retry submission after login
        }}
      />
    </div>
  );
}
