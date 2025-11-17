"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Building, Contact, Wand2 } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const boothSetupSchema = z.object({
  // Step 1
  boothName: z.string().min(3, "Booth name is required"),
  shortDescription: z.string().max(150, "Max 150 characters").optional(),
  fullDescription: z.string().max(1000, "Max 1000 characters").optional(),

  // Step 2 (placeholders for file uploads)
  logo: z.any().optional(),
  banner: z.any().optional(),

  // Step 3
  contactPerson: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Invalid email"),
  contactPhone: z.string().optional(),
});

type BoothFormValues = z.infer<typeof boothSetupSchema>;

const steps = [
  { id: 1, title: "Booth Details", icon: Building },
  { id: 2, title: "Branding", icon: Wand2 },
  { id: 3, title: "Contact Info", icon: Contact },
];

export default function BoothSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, formState: { errors }, trigger } = useForm<BoothFormValues>({
    resolver: zodResolver(boothSetupSchema),
  });

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = await trigger(["boothName", "shortDescription", "fullDescription"]);
    if (currentStep === 2) isValid = true; // No validation for file uploads in this basic version
    if (currentStep === 3) isValid = await trigger(["contactPerson", "contactEmail"]);

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit: SubmitHandler<BoothFormValues> = (data) => {
    console.log("Form submitted:", data);
    router.push("/exhibitor/dashboard");
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-white p-6 md:p-12">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-lime-300">Booth Setup Wizard</h1>
          <p className="text-stone-400 mt-2">
            Follow the steps to create an engaging virtual booth for the exhibition.
          </p>
        </header>

        {/* Stepper Navigation */}
        <div className="flex justify-between items-center mb-12 relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-lime-800/50 transform -translate-y-1/2"></div>
            <div className="absolute left-0 top-1/2 h-0.5 bg-pink-500 transform -translate-y-1/2 transition-all duration-500" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
            {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id ? 'bg-pink-500 border-pink-400' : 'bg-emerald-900 border-lime-700'}`}>
                    <step.icon className="w-6 h-6" />
                </div>
                <p className={`mt-2 font-semibold ${currentStep >= step.id ? 'text-lime-300' : 'text-stone-400'}`}>{step.title}</p>
            </div>
          ))}
        </div>

        <Card className="bg-emerald-900 border-lime-700/50">
          <CardHeader>
            <CardTitle className="text-2xl text-lime-300">{steps.find(s => s.id === currentStep)?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Booth Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="boothName">Booth Name / Business Name</Label>
                    <Input id="boothName" {...register("boothName")} className="bg-emerald-800 border-lime-700/50" />
                    {errors.boothName && <p className="text-red-500 text-sm mt-1">{errors.boothName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Short Description (Tagline)</Label>
                    <Input id="shortDescription" {...register("shortDescription")} className="bg-emerald-800 border-lime-700/50" />
                    {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="fullDescription">Full Description</Label>
                    <Textarea id="fullDescription" rows={5} {...register("fullDescription")} className="bg-emerald-800 border-lime-700/50" />
                    {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Branding */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center p-8 border-2 border-dashed border-lime-700/50 rounded-lg">
                      <Upload className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                      <Label htmlFor="logo" className="font-bold text-lg">Upload Your Logo</Label>
                      <p className="text-sm text-stone-400 mt-1">PNG or JPG, min 500x500 px</p>
                      <Input id="logo" type="file" {...register("logo")} className="mt-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"/>
                  </div>
                  <div className="text-center p-8 border-2 border-dashed border-lime-700/50 rounded-lg">
                      <Upload className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                      <Label htmlFor="banner" className="font-bold text-lg">Upload a Banner Image</Label>
                      <p className="text-sm text-stone-400 mt-1">1200x400 px recommended</p>
                      <Input id="banner" type="file" {...register("banner")} className="mt-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"/>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person Name</Label>
                    <Input id="contactPerson" {...register("contactPerson")} className="bg-emerald-800 border-lime-700/50" />
                    {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" {...register("contactEmail")} className="bg-emerald-800 border-lime-700/50" />
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                    <Input id="contactPhone" type="tel" {...register("contactPhone")} className="bg-emerald-800 border-lime-700/50" />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" className="text-white border-pink-400 hover:bg-pink-500" onClick={handleBack}>
                    Back
                  </Button>
                ) : <div></div>}

                {currentStep < steps.length ? (
                  <Button type="button" className="bg-pink-500 hover:bg-pink-600" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="bg-lime-500 hover:bg-lime-600">
                    Finish & Submit for Approval
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
