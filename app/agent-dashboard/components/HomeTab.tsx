
import Link from 'next/link';
import { quizData } from '@/app/quiz/quiz-data';

export default function HomeTab({ quizScore }: { quizScore: number | null }) {
  return (
    <>
      {/* A. Greeting & Status */}
      <div className="rounded-lg border p-8">
        <h1 className="text-4xl font-bold">Welcome, Agent!</h1>
        <p className="text-muted-foreground text-xl mt-2">
          Here is your SOP: <Link href="#" className="text-primary hover:underline">How to deliver good work</Link>
        </p>
        <div className="mt-8">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-xl">Certification Badge:</span>
            {quizScore ? (
              <span className="text-green-500 text-xl">
                Quiz Score: {quizScore}/{quizData.length}
              </span>
            ) : (
              <span className="text-red-500 text-xl">Not yet certified</span>
            )}
          </div>
          <div className="mt-6">
            <p className="text-xl font-medium">Progress to Account Manager</p>
            <div className="w-full bg-muted-foreground/20 rounded-full h-4 mt-2">
              <div className="bg-primary h-4 rounded-full w-[75%]"></div>
            </div>
            <div className="text-lg text-muted-foreground flex justify-between mt-2">
              <span>Tasks: 50/100</span>
              <span>Avg Rating: 4.8/5.0</span>
              {quizScore && <span>Quiz Score: {quizScore}/{quizData.length}</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
