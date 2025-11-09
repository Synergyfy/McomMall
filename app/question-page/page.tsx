'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle } from 'lucide-react';

const options = [
  { id: 'A', text: 'Cycling' },
  { id: 'B', text: 'Athletic' },
  { id: 'C', text: 'Baseball' },
  { id: 'D', text: 'Soccer' },
];

const correctAnswer = 'Cycling';

export default function QuestionnairePage() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const router = useRouter();

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextClick = () => {
    if (selectedAnswer === correctAnswer) {
      router.push('/quismatic');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4">
          <div className="bg-yellow-500 text-black text-center py-4 px-8 rounded-lg shadow-md">
            <h1 className="text-xl font-bold">Which Olympic sport takes place in a velodrome?</h1>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(option.text)}
              className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === option.text
                  ? 'bg-yellow-100 border-yellow-500'
                  : 'bg-white border-gray-300 hover:bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold mr-4">
                {option.id}
              </div>
              <span className="flex-grow text-left">{option.text}</span>
              {selectedAnswer === option.text ? (
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
