'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { quizData } from '../quiz/quiz-data';

function ScoreDisplay() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score');

  useEffect(() => {
    if (score !== null) {
      localStorage.setItem('quizScore', score);
      // Clear the progress so the user starts a new quiz next time
      localStorage.removeItem('quizProgress');
    }
  }, [score]);

  return (
    <p className="mb-6 text-2xl text-gray-600">
      Your score is: <span className="font-bold text-orange-600">{score}</span> out of {quizData.length}
    </p>
  );
}

export default function QuismaticPage() {
  const router = useRouter();

  const handleRestart = () => {
    router.push('/quiz/0');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">Quiz Complete!</h1>
        <Suspense fallback={<div>Loading score...</div>}>
          <ScoreDisplay />
        </Suspense>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/agent')}
            className="rounded-lg bg-gray-300 px-8 py-3 font-semibold text-gray-800 shadow-lg transition-transform hover:scale-105 hover:bg-gray-400"
          >
            Return to Dashboard
          </button>
          <button
            onClick={handleRestart}
            className="rounded-lg bg-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
