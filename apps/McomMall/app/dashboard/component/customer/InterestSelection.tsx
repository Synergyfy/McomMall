'use client';

import React, { useState } from 'react';
import { 
  Shirt as FashionIcon, 
  Utensils as DiningIcon, 
  Dumbbell as FitnessIcon, 
  Laptop as ElectronicsIcon, 
  BookOpen as BooksIcon, 
  Tv as EntertainmentIcon, 
  HeartHandshake as HealthIcon, 
  Coffee as CafeIcon,
  CheckCircle2 as CheckIcon
} from 'lucide-react';

interface InterestItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INTERESTS: InterestItem[] = [
  { id: 'fashion', label: 'Fashion', icon: FashionIcon },
  { id: 'dining', label: 'Dining', icon: DiningIcon },
  { id: 'fitness', label: 'Fitness', icon: FitnessIcon },
  { id: 'electronics', label: 'Electronics', icon: ElectronicsIcon },
  { id: 'books', label: 'Books', icon: BooksIcon },
  { id: 'entertainment', label: 'Entertainment', icon: EntertainmentIcon },
  { id: 'health', label: 'Health & Beauty', icon: HealthIcon },
  { id: 'cafe', label: 'Cafe', icon: CafeIcon }
];

interface InterestSelectionProps {
  onBackToHome: () => void;
}

export const InterestSelection: React.FC<InterestSelectionProps> = ({ onBackToHome }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // Save to localStorage or mock API without using useEffect
    window.setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('customerInterests', JSON.stringify(selectedIds));
      }
      setSaveStatus('saved');
      
      window.setTimeout(() => {
        onBackToHome();
      }, 1000);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-6 max-w-lg mx-auto bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Pick Your Interests</h2>
        <p className="text-xs text-slate-400 font-semibold max-w-[85%] mx-auto">
          Select your favorite categories to customize your personalized local offers and experience feed.
        </p>
      </div>

      {saveStatus === 'saved' ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <CheckIcon className="w-16 h-16 text-emerald-500 animate-bounce" />
          <h3 className="text-base font-bold text-slate-800">Interests Saved Successfully!</h3>
          <p className="text-xs text-slate-400 font-semibold">Customizing your feed now...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {INTERESTS.map((item) => {
              const Icon = item.icon;
              const isActive = selectedIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 active:scale-95 group interest-card ${
                    isActive 
                      ? 'bg-[#fcd400] border-[#fcd400] text-[#6e5c00]' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white/40' : 'bg-slate-50 group-hover:bg-slate-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#6e5c00]' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-xs font-bold label-text transition-colors`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-50 shrink-0">
            <button
              onClick={onBackToHome}
              className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all active:scale-95"
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="flex-grow flex items-center justify-center py-3 text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 rounded-xl shadow-md shadow-orange-500/10 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Interests'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
