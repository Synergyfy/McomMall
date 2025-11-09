'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { CheckCircle, Circle } from 'lucide-react';
import { quizData } from '../quiz-data';

export default function Quiz() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const questionId = Number(params.questionId);
  const score = searchParams.get('score') || 0;

  const { question, options, correctAnswer } = quizData[questionId - 1];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextClick = () => {
    const newScore = selectedAnswer === correctAnswer ? Number(score) + 1 : Number(score);
    if (questionId < quizData.length) {
      router.push(`/quiz/${questionId + 1}?score=${newScore}`);
    } else {
      router.push(`/quismatic?score=${newScore}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4">
          <div className="bg-yellow-500 text-black text-center py-4 px-8 rounded-lg shadow-md">
            <h1 className="text-xl font-bold">{question}</h1>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === option
                  ? 'bg-yellow-100 border-yellow-500'
                  : 'bg-white border-gray-300 hover:bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold mr-4">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="flex-grow text-left">{option}</span>
              {selectedAnswer === option ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNextClick}
            disabled={selectedAnswer !== correctAnswer}
            className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {questionId < quizData.length ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}
