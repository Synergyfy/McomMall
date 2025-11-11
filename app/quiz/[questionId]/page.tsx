'use client';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { quizData } from '../quiz-data';

export default function QuestionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const questionId = parseInt(params.questionId as string, 10);
  const currentQuestion = quizData[questionId];
  const score = parseInt(searchParams.get('score') || '0', 10);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    // Save progress to local storage whenever questionId or score changes
    localStorage.setItem('quizProgress', JSON.stringify({ questionId, score }));
  }, [questionId, score]);

  const handleNext = () => {
    let newScore = score;
    if (selectedAnswer === currentQuestion.correctAnswer) {
      newScore++;
    }

    if (questionId < quizData.length - 1) {
      router.push(`/quiz/${questionId + 1}?score=${newScore}`);
    } else {
      router.push(`/quismatic?score=${newScore}`);
    }
  };

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  return (
    <div className="bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Certification Quiz</h1>
        <button
          onClick={() => router.push('/dashboard/agent')}
          className="rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-400"
        >
          Back to Dashboard
        </button>
      </header>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 rounded-lg bg-yellow-400 p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {currentQuestion.question}
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedAnswer(option)}
              className={`rounded-lg p-4 text-left font-semibold transition-colors ${
                selectedAnswer === option
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-200 hover:bg-yellow-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push('/dashboard/agent')}
            className="rounded-lg bg-gray-300 px-8 py-3 font-semibold text-gray-800 shadow-lg transition-transform hover:scale-105 hover:bg-gray-400"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="rounded-lg bg-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
      </div>
          </div>

  );
}
