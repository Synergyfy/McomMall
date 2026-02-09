export interface ActivityTimerTask {
  key: string;
  url: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface ActivityTimerPause {
  pausedAt: string;
  resumedAt: string | null;
}

export type ActivityTimerType = 'TRIAL' | 'GENERAL';

export interface ActivityTimer {
  id: string;
  type: ActivityTimerType;
  name: string;
  description: string;
  remainingTime: number;
  tasks: ActivityTimerTask[];
  isPaused: boolean;
  pauses: ActivityTimerPause[];
  expiresAt: string;
  completedAt: string | null;
}
