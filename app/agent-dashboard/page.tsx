'use client';
import {
  Bell,
  Home,
  Package2,
  Settings,
  CheckCircle,
  Clock,
  HelpCircle,
  Briefcase,
  DollarSign,
  Award,
  User,
} from 'lucide-react';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { quizData } from '@/app/quiz/quiz-data';

export default function AgentDashboard() {
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const score = localStorage.getItem('quizScore');
    const scoreNum = score ? parseInt(score, 10) : null;
    setQuizScore(scoreNum);
    setIsLoading(false);

    const fromQuiz = searchParams.get('fromQuiz');
    if (fromQuiz && scoreNum !== null && scoreNum >= 2) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Clean the URL
        router.replace('/agent-dashboard', undefined);
      }, 5000); // Hide after 5 seconds
    }
  }, [searchParams, router]);

  const handleStartQuiz = () => {
    localStorage.removeItem('quizProgress');
    localStorage.removeItem('quizScore');
    router.push('/quiz/0');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const hasPassedQuiz = quizScore !== null && quizScore >= 2;

  if (!hasPassedQuiz) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-muted/40">
        <div className="rounded-lg border bg-background p-10 text-center shadow-lg max-w-lg">
          <h1 className="text-5xl font-bold">Welcome, Agent!</h1>
          <p className="text-muted-foreground mt-6 text-xl">
            To unlock your dashboard and start accepting tasks, you must pass the certification quiz.
          </p>
          <p className="mt-4 text-lg">You need to score at least 2 out of {quizData.length} to pass.</p>
          {quizScore !== null && (
            <p className="text-red-500 font-bold mt-6 text-2xl">
              Your last score was {quizScore}/{quizData.length}. Please try again.
            </p>
          )}
          <button
            onClick={handleStartQuiz}
            className="mt-10 bg-primary text-primary-foreground px-10 py-5 rounded-md text-2xl font-semibold hover:bg-primary/90 transition-colors"
          >
            {quizScore === null ? 'Start Certification Quiz' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] pt-7 mt-12">
      {/* Left Navigation */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-4">
          <div className="flex h-20 items-center border-b px-6 lg:h-[80px] lg:px-8">
            <Link href="/" className="flex items-center gap-3 font-semibold text-2xl">
              <Package2 className="h-7 w-7" />
              <span className="">Agent Dashboard</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-4 text-2xl font-medium lg:px-6">
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg bg-muted px-4 py-3 text-primary transition-all hover:text-primary w-full text-left"
              >
                <Home className="h-6 w-6" />
                Home
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <Briefcase className="h-6 w-6" />
                Available Tasks
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <Clock className="h-6 w-6" />
                Active Tasks
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <CheckCircle className="h-6 w-6" />
                Completed Tasks
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <DollarSign className="h-6 w-6" />
                Earnings & Payouts
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <Award className="h-6 w-6" />
                Training
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <User className="h-6 w-6" />
                Profile
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <Settings className="h-6 w-6" />
                Settings
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <HelpCircle className="h-6 w-6" />
                Help & Support
              </button>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Top Header */}
        <header className="flex h-20 items-center gap-6 border-b bg-muted/40 px-6 lg:h-[80px] lg:px-8">
          <div className="w-full flex-1">
            {/* Mobile menu button can be added here */}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xl">
              <p className="font-semibold">Today&apos;s Earnings: --</p>
              <p className="text-lg text-muted-foreground">Monthly Earnings: --</p>
            </div>
            <Bell className="h-7 w-7" />
            <User className="h-8 w-8 rounded-full" />
            <span className="text-xl font-semibold">Agent</span>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex flex-1 flex-col gap-8 p-8 pt-24 lg:gap-10 lg:p-10 lg:pt-24">
          {showSuccessMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p className="font-bold text-2xl">You Passed! Welcome to the Dashboard!</p>
              <p className="text-lg">You can now start accepting tasks and earning.</p>
            </div>
          )}

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

          {/* B. Available Tasks panel */}
          <div className="rounded-lg border p-8">
            <h2 className="text-3xl font-semibold">Available Tasks</h2>
            {/* Filtering options */}
            <div className="flex gap-6 my-8">
              <input type="text" placeholder="Filter by skill" className="border px-4 py-3 rounded-md text-xl"/>
              <input type="text" placeholder="Filter by pay" className="border px-4 py-3 rounded-md text-xl"/>
              <input type="date" className="border px-4 py-3 rounded-md text-xl"/>
            </div>
            {/* Task list */}
            <div className="space-y-8">
              {/* Task card */}
              <div className="border p-6 rounded-md">
                <h3 className="font-semibold text-2xl">Task Title</h3>
                <p className="text-xl text-muted-foreground mt-2">Brief description of the task...</p>
                <div className="flex justify-between items-center mt-6">
                  <span className="font-bold text-2xl">$50</span>
                  <span className="text-lg">Deadline: 2024-12-01</span>
                  <span className="text-lg bg-primary/10 text-primary px-4 py-2 rounded-full">Required Skill</span>
                  <button className="bg-primary text-white px-5 py-3 rounded-md text-xl">Apply</button>
                </div>
              </div>
            </div>
          </div>

          {/* C. Active Tasks */}
          <div className="rounded-lg border p-8">
            <h2 className="text-3xl font-semibold">Active Tasks</h2>
            <div className="space-y-8 mt-8">
              {/* Active task card */}
              <div className="border p-6 rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-2xl">Active Task Title</h3>
                  <span className="text-lg text-muted-foreground">Due: 2024-11-15</span>
                </div>
                <p className="text-xl text-muted-foreground mt-2">Brief description of the active task...</p>
                <div className="mt-6">
                  <p className="text-lg font-medium">Progress</p>
                  <div className="w-full bg-muted-foreground/20 rounded-full h-4 mt-2">
                    <div className="bg-green-500 h-4 rounded-full w-[45%]"></div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button className="bg-secondary text-secondary-foreground px-5 py-3 rounded-md text-xl">View Details</button>
                  <button className="bg-primary text-white px-5 py-3 rounded-md text-xl">Submit Work</button>
                </div>
              </div>
            </div>
          </div>

          {/* D. Completed Tasks & History */}
          <div className="rounded-lg border p-8">
            <h2 className="text-3xl font-semibold">Completed Tasks & History</h2>
            <div className="space-y-8 mt-8">
              {/* Completed task card */}
              <div className="border p-6 rounded-md bg-muted/20">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-2xl">Completed Task Title</h3>
                  <span className="text-lg text-green-500 font-bold">Approved</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-2xl">Earned: $75</span>
                  <span className="text-lg text-muted-foreground">Completed on: 2024-10-20</span>
                </div>
              </div>
            </div>
          </div>

          {/* E. Earnings and Payouts */}
          <div className="rounded-lg border p-8">
            <h2 className="text-3xl font-semibold">Earnings & Payouts</h2>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="border p-6 rounded-md">
                <h3 className="text-2xl font-semibold">Pending Balance</h3>
                <p className="text-4xl font-bold mt-4">$125.00</p>
              </div>
              <div className="border p-6 rounded-md">
                <h3 className="text-2xl font-semibold">Last Payout</h3>
                <p className="text-4xl font-bold mt-4">$500.00</p>
                <p className="text-muted-foreground text-lg">on 2024-10-25</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="bg-primary text-white px-8 py-4 rounded-md text-xl">Request Payout</button>
            </div>
          </div>

          {/* F. Training and Upskills */}
           <div className="rounded-lg border p-8">
            <h2 className="text-3xl font-semibold">Training and Upskills</h2>
            <div className="space-y-6 mt-8">
              <div className="border p-6 rounded-md flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-2xl">Advanced SOP Training</h3>
                  <p className="text-muted-foreground text-lg">Complete this to unlock higher-paying tasks.</p>
                </div>
                <button className="bg-secondary text-secondary-foreground px-5 py-3 rounded-md text-xl">Start Now</button>
              </div>
            </div>
          </div>

          {/* G. Support and Disputes */}
           <div className="rounded-lg border p-8">
            <h2 className="text-3xl font-semibold">Support and Disputes</h2>
            <div className="mt-8">
              <p className="text-xl">Have an issue with a task or payment? Our support team is here to help.</p>
              <button className="mt-6 bg-destructive text-destructive-foreground px-8 py-4 rounded-md text-xl">Open a Support Ticket</button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
