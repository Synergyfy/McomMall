"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function ExhibitorSignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormValues> = (data) => {
    console.log(data);
    // Handle signup logic here
    router.push("/exhibitor/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-emerald-950 text-white">
      <div className="grid md:grid-cols-2 gap-0 max-w-6xl w-full">
        {/* Left side: Image */}
        <div className="relative hidden md:block">
          <Image
            src="https://source.unsplash.com/random/800x1200/?business,event,modern"
            alt="Exhibitor Signup"
            layout="fill"
            objectFit="cover"
            className="rounded-l-lg"
          />
          <div className="absolute inset-0 bg-emerald-800/60 rounded-l-lg"></div>
          <div className="relative p-12 flex flex-col justify-end h-full text-white">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Join MCOM's Virtual Exhibition
            </h1>
            <p className="text-lg text-stone-200">
              Showcase your products to a global audience. Sign up to become an exhibitor today.
            </p>
          </div>
        </div>

        {/* Right side: Form */}
        <div className="w-full p-8 md:p-12 bg-emerald-900 rounded-lg md:rounded-l-none">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-lime-300">Exhibitor Sign Up</h2>
            <p className="text-stone-400">Create your account to get started</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Your Company Inc."
                {...register("businessName")}
                className="bg-emerald-800 border-lime-700/50 text-white"
              />
              {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="bg-emerald-800 border-lime-700/50 text-white"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="bg-emerald-800 border-lime-700/50 text-white"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="bg-emerald-800 border-lime-700/50 text-white"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600 font-bold text-lg py-3"
            >
              Create Account
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <p>
              Already have an account?{" "}
              <Link href="/signin" className="font-medium text-lime-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
