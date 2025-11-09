'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { quizData } from '../quiz/quiz-data';

export default function QuismaticPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const score = searchParams.get('score');

  const handleRestart = () => {
    router.push('/quiz/0');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">Quiz Complete!</h1>
        <p className="mb-6 text-2xl text-gray-600">
          Your score is: <span className="font-bold text-orange-600">{score}</span> out of {quizData.length}
        </p>
        <button
          onClick={handleRestart}
          className="rounded-lg bg-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
