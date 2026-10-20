import {
  ActiveTimerResponse,
  ActivityTimerType,
} from '@/service/activity-timer/types';

/**
 * Local-only simulation of the business Activity Timer.
 *
 * The real activity-timer backend module was decommissioned, but the business
 * dashboard still needs the onboarding checklist UI. Everything below is
 * persisted in localStorage so the demo survives refreshes:
 *
 *   mcom_activity_timer_mock_v1
 *
 * Clear that key to restart the simulated trial.
 */

const STORAGE_KEY = 'mcom_activity_timer_mock_v1';
const DAY_MS = 24 * 60 * 60 * 1000;

const TRIAL_DURATION_MS = 14 * DAY_MS;
const GENERAL_DURATION_MS = 7 * DAY_MS;

type MockTaskTimer = 'TRIAL' | 'GENERAL';

interface MockTaskDefinition {
  key: string;
  title: string;
  description: string;
  url: string;
  timer: MockTaskTimer;
}

interface MockActivityState {
  startedAt: number;
  trialExpiresAt: number;
  generalExpiresAt: number;
  completedKeys: string[];
  isPaused: boolean;
  pausedAt: number | null;
}

export const BUSINESS_ACTIVITY_TASKS: MockTaskDefinition[] = [
  {
    key: 'CREATE_BUSINESS',
    title: 'Create your business profile',
    description:
      'Add your business details so customers can find and verify you.',
    url: '/dashboard/add-listing',
    timer: 'TRIAL',
  },
  {
    key: 'ADD_PRODUCT_SERVICE',
    title: 'Add a product or service',
    description:
      'List your first product or service on MCOM Mall to start selling.',
    url: '/dashboard/product',
    timer: 'TRIAL',
  },
  {
    key: 'CREATE_PROMOTION',
    title: 'Launch a promotion',
    description:
      'Create a promotion to attract nearby customers to your business.',
    url: '/dashboard/promotions/new',
    timer: 'TRIAL',
  },
  {
    key: 'CREATE_COUPON',
    title: 'Create your first coupon',
    description: 'Set up a coupon to drive repeat visits and loyalty.',
    url: '/dashboard/coupons/new',
    timer: 'TRIAL',
  },
  {
    key: 'OTHER',
    title: 'Complete your business profile',
    description:
      'Add your logo, opening hours, and contact details to build trust.',
    url: '/dashboard/my-profile',
    timer: 'TRIAL',
  },
  {
    key: 'LIST_BARTER_OFFER',
    title: 'List a barter offer',
    description:
      'Swap goods or services with another business in your local mall.',
    url: '/dashboard/loyalty/offers',
    timer: 'GENERAL',
  },
  {
    key: 'CONNECT_BUSINESS',
    title: 'Connect with a partner business',
    description:
      'Build a partnership that puts your business in front of new customers.',
    url: '/dashboard/marketing/my-partners',
    timer: 'GENERAL',
  },
];

// Mock quota data so the existing "locked task" UI still works without the
// capability API. Keep usage low so the demo tasks are actionable.
export const MOCK_CAPABILITY_CONFIG = {
  quotas: {
    maxListings: 5,
    maxProducts: 10,
    maxCouponTemplates: 5,
  },
};

export const MOCK_CAPABILITY_USAGE = {
  currentListings: 0,
  currentProducts: 0,
  currentCoupons: 0,
};

function createInitialState(): MockActivityState {
  const now = Date.now();
  return {
    startedAt: now,
    trialExpiresAt: now + TRIAL_DURATION_MS,
    generalExpiresAt: now + GENERAL_DURATION_MS,
    completedKeys: [],
    isPaused: false,
    pausedAt: null,
  };
}

function readState(): MockActivityState {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialState();
      writeState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<MockActivityState>;
    if (
      typeof parsed.startedAt !== 'number' ||
      typeof parsed.trialExpiresAt !== 'number' ||
      typeof parsed.generalExpiresAt !== 'number'
    ) {
      const initial = createInitialState();
      writeState(initial);
      return initial;
    }

    return {
      startedAt: parsed.startedAt,
      trialExpiresAt: parsed.trialExpiresAt,
      generalExpiresAt: parsed.generalExpiresAt,
      completedKeys: Array.isArray(parsed.completedKeys)
        ? parsed.completedKeys
        : [],
      isPaused: Boolean(parsed.isPaused),
      pausedAt: typeof parsed.pausedAt === 'number' ? parsed.pausedAt : null,
    };
  } catch {
    const initial = createInitialState();
    writeState(initial);
    return initial;
  }
}

function writeState(state: MockActivityState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode / quota). The UI will simply
    // fall back to a fresh simulated state on the next read.
  }
}

function remainingUntil(expiresAt: number, state: MockActivityState) {
  const reference = state.isPaused && state.pausedAt ? state.pausedAt : Date.now();
  return Math.max(0, expiresAt - reference);
}

function toTaskResponse(
  state: MockActivityState,
  type: MockTaskTimer,
) {
  return BUSINESS_ACTIVITY_TASKS.filter((task) => task.timer === type).map(
    (task) => ({
      key: task.key,
      title: task.title,
      description: task.description,
      url: task.url,
      isCompleted: state.completedKeys.includes(task.key),
    }),
  );
}

export function getMockActivityTimers(): ActiveTimerResponse[] {
  const state = readState();

  const trialTimer: ActiveTimerResponse = {
    id: 'mock-trial-timer',
    type: ActivityTimerType.TRIAL,
    name: 'Trial Checklist',
    description: 'Complete these tasks to activate your full membership.',
    remainingTime: remainingUntil(state.trialExpiresAt, state),
    expiresAt: new Date(state.trialExpiresAt).toISOString(),
    completedAt: null,
    isPaused: state.isPaused,
    tasks: toTaskResponse(state, 'TRIAL'),
  };

  const generalTimer: ActiveTimerResponse = {
    id: 'mock-general-timer',
    type: ActivityTimerType.GENERAL,
    name: 'Business Growth Tasks',
    description: 'Keep growing your business on MCOM Mall.',
    remainingTime: remainingUntil(state.generalExpiresAt, state),
    expiresAt: new Date(state.generalExpiresAt).toISOString(),
    completedAt: null,
    isPaused: state.isPaused,
    tasks: toTaskResponse(state, 'GENERAL'),
  };

  return [trialTimer, generalTimer];
}

export function completeMockTask(key: string) {
  const state = readState();
  if (!state.completedKeys.includes(key)) {
    state.completedKeys = [...state.completedKeys, key];
    writeState(state);
  }
}

export function pauseMockActivityTimer() {
  const state = readState();
  if (state.isPaused) return;

  state.isPaused = true;
  state.pausedAt = Date.now();
  writeState(state);
}

export function resumeMockActivityTimer() {
  const state = readState();
  if (!state.isPaused || !state.pausedAt) return;

  // Shift both deadlines forward by the pause duration, matching the old
  // trial-pause behaviour.
  const pausedFor = Date.now() - state.pausedAt;
  state.trialExpiresAt += pausedFor;
  state.generalExpiresAt += pausedFor;
  state.isPaused = false;
  state.pausedAt = null;
  writeState(state);
}

export function resetMockActivityTimer() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export const MOCK_ACTIVITY_TIMER_STORAGE_KEY = STORAGE_KEY;
