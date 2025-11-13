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
import HomeTab from './components/HomeTab';
import AvailableTasksTab from './components/AvailableTasksTab';
import ActiveTasksTab from './components/ActiveTasksTab';
import CompletedTasksTab from './components/CompletedTasksTab';
import EarningsTab from './components/EarningsTab';
import TrainingTab from './components/TrainingTab';
import SupportTab from './components/SupportTab';

export default function AgentDashboard() {
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
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
    <div className="min-h-screen w-full pt-7 mt-12">
      {/* Left Navigation */}
      <div className="hidden border-r bg-muted/40 md:block fixed h-full w-[220px] lg:w-[280px]">
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
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'home' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <Home className="h-6 w-6" />
                Home
              </button>
              <button
                onClick={() => setActiveTab('available-tasks')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'available-tasks' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <Briefcase className="h-6 w-6" />
                Available Tasks
              </button>
              <button
                onClick={() => setActiveTab('active-tasks')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'active-tasks' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <Clock className="h-6 w-6" />
                Active Tasks
              </button>
              <button
                onClick={() => setActiveTab('completed-tasks')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'completed-tasks' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <CheckCircle className="h-6 w-6" />
                Completed Tasks
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'earnings' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <DollarSign className="h-6 w-6" />
                Earnings & Payouts
              </button>
              <button
                onClick={() => setActiveTab('training')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'training' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <Award className="h-6 w-6" />
                Training
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'profile' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <User className="h-6 w-6" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'settings' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <Settings className="h-6 w-6" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:text-primary ${
                  activeTab === 'support' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <HelpCircle className="h-6 w-6" />
                Help & Support
              </button>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:ml-[220px] lg:ml-[280px]">
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
          {activeTab === 'home' && <HomeTab quizScore={quizScore} />}
          {activeTab === 'available-tasks' && <AvailableTasksTab />}
          {activeTab === 'active-tasks' && <ActiveTasksTab />}
          {activeTab === 'completed-tasks' && <CompletedTasksTab />}
          {activeTab === 'earnings' && <EarningsTab />}
          {activeTab === 'training' && <TrainingTab />}
          {activeTab === 'support' && <SupportTab />}
        </main>
      </div>
    </div>
  );
}
