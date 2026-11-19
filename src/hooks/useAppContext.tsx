import React, { createContext, useContext, useEffect, useState } from 'react';
import { setSimulationConfig } from '../services/api';
import type { DateRangeOption } from '../types/analytics';

export type ThemeMode = 'dark' | 'light';

export interface UserProfileSettings {
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl: string;
}

export interface NotificationPrefs {
  churnSpikeAlerts: boolean;
  highRiskDigest: boolean;
  weeklyExecutiveReport: boolean;
  modelDriftNotice: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
  customerID?: string;
}

export interface DashboardPrefs {
  defaultDateRange: DateRangeOption;
  rowsPerPage: number;
  compactTables: boolean;
  simulatedLatencyMs: number;
}

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  dateRange: DateRangeOption;
  setDateRange: (range: DateRangeOption) => void;
  profile: UserProfileSettings;
  updateProfile: (partial: Partial<UserProfileSettings>) => void;
  notificationPrefs: NotificationPrefs;
  updateNotificationPrefs: (partial: Partial<NotificationPrefs>) => void;
  dashboardPrefs: DashboardPrefs;
  updateDashboardPrefs: (partial: Partial<DashboardPrefs>) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const DEFAULT_PROFILE: UserProfileSettings = {
  name: 'Priya Sharma',
  email: 'p.sharma@churniq.io',
  role: 'VP of Customer Retention',
  organization: 'Northstar Telecom Group',
  avatarUrl: '/src/assets/images/avatar_executive_user_1794981760752.jpg',
};

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'High-risk support escalation',
    detail: 'CUST-7590 (Elena Vance) logged 4th ticket in 30 days.',
    timestamp: '18m ago',
    read: false,
    customerID: 'CUST-7590',
  },
  {
    id: 'notif-2',
    title: 'Billing retry alert',
    detail: 'CUST-9305 (Arthur Pendelton) electronic check retry pending.',
    timestamp: '1h ago',
    read: false,
    customerID: 'CUST-9305',
  },
  {
    id: 'notif-3',
    title: 'At-Risk cohort threshold',
    detail: 'Month-to-month Fiber segment churn rose +1.4% in sample cohort.',
    timestamp: '3h ago',
    read: true,
  },
];

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('churniq-theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPrefs>({
    defaultDateRange: '12m',
    rowsPerPage: 10,
    compactTables: false,
    simulatedLatencyMs: 120,
  });

  const [dateRange, setDateRange] = useState<DateRangeOption>('12m');
  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_PROFILE);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    churnSpikeAlerts: true,
    highRiskDigest: true,
    weeklyExecutiveReport: true,
    modelDriftNotice: false,
  });
  const [notifications, setNotifications] =
    useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('churniq-theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const setTheme = (next: ThemeMode) => setThemeState(next);
  const toggleTheme = () =>
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const updateProfile = (partial: Partial<UserProfileSettings>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const updateNotificationPrefs = (partial: Partial<NotificationPrefs>) => {
    setNotificationPrefs((prev) => ({ ...prev, ...partial }));
  };

  const updateDashboardPrefs = (partial: Partial<DashboardPrefs>) => {
    setDashboardPrefs((prev) => {
      const next = { ...prev, ...partial };
      if (partial.simulatedLatencyMs !== undefined) {
        setSimulationConfig({ simulateLatencyMs: partial.simulatedLatencyMs });
      }
      if (partial.defaultDateRange !== undefined) {
        setDateRange(partial.defaultDateRange);
      }
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        dateRange,
        setDateRange,
        profile,
        updateProfile,
        notificationPrefs,
        updateNotificationPrefs,
        dashboardPrefs,
        updateDashboardPrefs,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}
