import { Suspense } from 'react';
import Quiz from './quiz';

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Quiz />
    </Suspense>
  );
}
