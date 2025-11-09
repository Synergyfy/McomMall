'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ScoreDisplay() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score') || 0;

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 text-center">
      <h1 className="text-3xl font-bold">Quismatic Quiz</h1>
      <p className="mt-4 text-lg">Your final score is:</p>
      <p className="mt-4 text-5xl font-bold text-yellow-500">{score} / 3</p>
    </div>
  );
}

export default function QuismaticPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ScoreDisplay />
      </Suspense>
    </div>
  );
}
