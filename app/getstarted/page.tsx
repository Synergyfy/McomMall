import Image from "next/image";
import Link from "next/link";

export default function GetStartedPage() {
  return (
    // Main container that takes up the full screen
    <main className="relative flex min-h-screen flex-col items-center justify-center text-white">
      {/* 1. Background Image */}
      {/* This div acts as the background. We use an Next.js Image component for optimization. */}
      <Image
        src="/getstartedpage/getstartedimage.jpg" //  image path
        alt="Background"
        layout="fill"
        objectFit="cover" // This is like 'background-size: cover'
        quality={80}
        className="-z-10" // Puts the image behind the content
      />

      {/* 2. Dark Overlay */}
      {/* This makes the white text more readable on top of the image. */}
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />

      {/* 3. Content Container */}
      {/* This holds all the centered content. */}
      <div className="z-20 flex w-full max-w-md flex-col items-center px-8 text-center">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-4xl font-bold">
          Lets Make living life easier.
        </h1>

        {/* Sign Up Button */}
        <Link
          href="/registerpage" // <-- Link to the actual registration form
          className="mb-4 w-full max-w-sm rounded-lg bg-white py-3 text-lg font-semibold text-gray-900 transition-transform hover:scale-105"
        >
          Sign Up
        </Link>

        {/* Sign In Link */}
        <p className="mb-8 text-gray-200">
          I already have an account.{" "}
          <Link href="/signin" className="font-semibold text-white underline">
            Sign in
          </Link>
        </p>

        {/* Policy Text */}
        <p className="max-w-xs text-xs text-gray-300">
          By proceeding to use CozaConnect, you agree to our{" "}
          <Link href="/terms" className="underline">
            terms of use
          </Link>{" "}
          and acknowledge that you have read our{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
