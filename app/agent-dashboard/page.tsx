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
import { useRouter } from 'next/navigation';
import { quizData } from '@/app/quiz/quiz-data';

export default function AgentDashboard() {
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const score = localStorage.getItem('quizScore');
    setQuizScore(score ? parseInt(score, 10) : null);
    setIsLoading(false);
  }, []);

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
        <div className="rounded-lg border bg-background p-8 text-center shadow-lg max-w-md">
          <h1 className="text-3xl font-bold">Welcome, Agent!</h1>
          <p className="text-muted-foreground mt-2">
            To unlock your dashboard and start accepting tasks, you must pass the certification quiz.
          </p>
          <p className="mt-1">You need to score at least 2 out of {quizData.length} to pass.</p>
          {quizScore !== null && (
            <p className="text-red-500 font-bold mt-3 text-lg">
              Your last score was {quizScore}/{quizData.length}. Please try again.
            </p>
          )}
          <button
            onClick={handleStartQuiz}
            className="mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {quizScore === null ? 'Start Certification Quiz' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Left Navigation */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Agent Dashboard</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-base font-medium lg:px-4">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Briefcase className="h-4 w-4" />
                Available Tasks
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Clock className="h-4 w-4" />
                Active Tasks
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <CheckCircle className="h-4 w-4" />
                Completed Tasks
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <DollarSign className="h-4 w-4" />
                Earnings & Payouts
              </Link>
              <button
                onClick={handleStartQuiz}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full text-left"
              >
                <Award className="h-4 w-4" />
                Training
              </button>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Top Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            {/* Mobile menu button can be added here */}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-semibold">Today&apos;s Earnings: --</p>
              <p className="text-xs text-muted-foreground">Monthly Earnings: --</p>
            </div>
            <Bell className="h-5 w-5" />
            <User className="h-6 w-6 rounded-full" />
            <span className="text-sm font-semibold">Agent</span>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-6 lg:gap-6 lg:p-6 lg:pt-8">
          {/* A. Greeting & Status */}
          <div className="rounded-lg border p-4">
            <h1 className="text-2xl font-bold">Welcome, Agent!</h1>
            <p className="text-muted-foreground">
              Here is your SOP: <Link href="#" className="text-primary hover:underline">How to deliver good work</Link>
            </p>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Certification Badge:</span>
                {quizScore ? (
                  <span className="text-green-500">
                    Quiz Score: {quizScore}/{quizData.length}
                  </span>
                ) : (
                  <span className="text-red-500">Not yet certified</span>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Progress to Account Manager</p>
                <div className="w-full bg-muted-foreground/20 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full w-[75%]"></div>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Tasks: 50/100</span>
                  <span>Avg Rating: 4.8/5.0</span>
                  {quizScore && <span>Quiz Score: {quizScore}/{quizData.length}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* B. Available Tasks panel */}
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Available Tasks</h2>
            {/* Filtering options */}
            <div className="flex gap-2 my-4">
              <input type="text" placeholder="Filter by skill" className="border px-2 py-1 rounded-md"/>
              <input type="text" placeholder="Filter by pay" className="border px-2 py-1 rounded-md"/>
              <input type="date" className="border px-2 py-1 rounded-md"/>
            </div>
            {/* Task list */}
            <div className="space-y-4">
              {/* Task card */}
              <div className="border p-4 rounded-md">
                <h3 className="font-semibold">Task Title</h3>
                <p className="text-sm text-muted-foreground">Brief description of the task...</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold">$50</span>
                  <span className="text-xs">Deadline: 2024-12-01</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Required Skill</span>
                  <button className="bg-primary text-white px-3 py-1 rounded-md text-sm">Apply</button>
                </div>
              </div>
              {/* More task cards... */}
            </div>
          </div>

          {/* C. Active Tasks panel */}
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Active Tasks</h2>
            {/* Active task card */}
            <div className="border p-4 rounded-md mt-4">
              <h3 className="font-semibold">Active Task Title</h3>
              <p className="text-sm text-muted-foreground">Client: Client Name</p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs border px-2 py-1 rounded-md">Attachments</button>
                <button className="text-xs border px-2 py-1 rounded-md">Messages</button>
              </div>
              <div className="mt-4">
                <p className="font-semibold">Internal Checklist</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Quality control check 1</li>
                  <li>Quality control check 2</li>
                </ul>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm">Due: 2024-11-20</span>
                <div>
                  <button className="text-xs border px-2 py-1 rounded-md mr-2">Request Extension</button>
                  <button className="bg-primary text-white px-3 py-1 rounded-md text-sm">Submit Work</button>
                </div>
              </div>
            </div>
          </div>

          {/* D. Completed Tasks & History */}
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Completed Tasks & History</h2>
            <div className="border p-4 rounded-md mt-4">
              <h3 className="font-semibold">Completed Task Title</h3>
              <p className="text-sm text-muted-foreground">Client Feedback: &quot;Great work!&quot;</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">Rating: 5/5</span>
                <span>Earnings: $75</span>
                <button className="text-xs border px-2 py-1 rounded-md">Download Invoice</button>
              </div>
            </div>
          </div>

          {/* E. Earnings & Payouts */}
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Earnings & Payouts</h2>
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-lg font-bold">Current Balance: $500.00</p>
                <p className="text-sm text-muted-foreground">Pending Payouts: $150.00</p>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-md">Request Payout</button>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Payout History</h3>
              {/* History table or list */}
            </div>
          </div>

          {/* F. Training & Upskill */}
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Training & Upskill</h2>
            <div className="mt-4">
              <h3 className="font-semibold">Suggested Modules</h3>
              <p className="text-sm text-muted-foreground">Based on your quiz results and performance.</p>
              <h3 className="font-semibold mt-4">Required Modules to Unlock Account Manager</h3>
              <button onClick={handleStartQuiz} className="text-primary hover:underline">
                Complete the Certification Quiz
              </button>
            </div>
          </div>

          {/* G. Support & Disputes */}
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Support & Disputes</h2>
            <div className="mt-4 flex gap-4">
              <button className="bg-primary text-white px-4 py-2 rounded-md">Message Support</button>
              <form className="flex-1">
                <textarea placeholder="Quick dispute form for client disagreements..." className="w-full border p-2 rounded-md"></textarea>
                <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-md mt-2">Submit Dispute</button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
