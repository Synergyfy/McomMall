"use client";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-emerald-950 text-white p-6 md:p-12">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-lime-300">{title}</h1>
        <p className="text-stone-400 mt-4 text-xl">Coming Soon</p>
      </div>
    </div>
  );
}
