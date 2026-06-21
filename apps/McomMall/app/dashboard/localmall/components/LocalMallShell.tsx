'use client';

import { FC, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LocalMallHeader } from './shared/LocalMallHeader';
import { LocalMallBottomNav, LocalMallTab } from './shared/LocalMallBottomNav';

interface LocalMallShellProps {
  businessName: string;
  boroughName: string;
  activeTab: LocalMallTab;
  onTabChange: (tab: LocalMallTab) => void;
  screenStack: string[];
  onBack: () => void;
  onNotificationsClick: () => void;
  onSearchClick: () => void;
  onStatusClick: () => void;
  children: ReactNode;
}

export const LocalMallShell: FC<LocalMallShellProps> = ({
  businessName,
  boroughName,
  activeTab,
  onTabChange,
  screenStack,
  onBack,
  onNotificationsClick,
  onSearchClick,
  onStatusClick,
  children,
}) => {
  const canGoBack = true;
  const currentView = screenStack[screenStack.length - 1];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-80px)] w-full max-w-5xl mx-auto bg-gray-50/50 rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
      {/* Contextual Header */}
      <LocalMallHeader
        businessName={businessName}
        boroughName={boroughName}
        canGoBack={canGoBack}
        onBack={onBack}
        unreadNotifications={3}
        onNotificationsClick={onNotificationsClick}
        onSearchClick={onSearchClick}
        onStatusClick={onStatusClick}
      />

      {/* Screen Viewport with Slide Transition */}
      <main className="flex-1 w-full overflow-y-auto px-4 py-6 md:px-8 pb-24 sm:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full h-full flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Custom Bottom Tab Navigation */}
      <LocalMallBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};
