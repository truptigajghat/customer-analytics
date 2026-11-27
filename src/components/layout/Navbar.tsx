import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CheckCheck,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
} from 'lucide-react';
import { MOCK_CUSTOMERS } from '../../data/mockCustomers';
import { useAppContext } from '../../hooks/useAppContext';
import { getCustomers } from '../../services/customerService';
import type { DateRangeOption } from '../../types/analytics';
import type { Customer } from '../../types/customer';
import { NAV_ITEMS } from './Sidebar';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '12m', label: 'Last 12 Months' },
];

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    dateRange,
    setDateRange,
    profile,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentNav =
    NAV_ITEMS.find((n) =>
      n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
    ) || NAV_ITEMS[0];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [liveMatches, setLiveMatches] = useState<Customer[]>([]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveMatches([]);
      return;
    }
    let isCancelled = false;
    const timer = setTimeout(() => {
      getCustomers({ filters: { search: q }, pageSize: 6 })
        .then((res) => {
          if (!isCancelled && res.items) {
            setLiveMatches(res.items);
          }
        })
        .catch(() => {
          if (!isCancelled) setLiveMatches([]);
        });
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const searchMatches = useMemo(() => {
    if (liveMatches.length > 0) return liveMatches;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return MOCK_CUSTOMERS.filter(
      (c) =>
        c.customerID.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery, liveMatches]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (customerID: string) => {
    setSearchQuery('');
    setSearchFocused(false);
    navigate(`/prediction?customerId=${encodeURIComponent(customerID)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-4 backdrop-blur-sm sm:px-6">
      {/* Left: Mobile Toggle + Breadcrumb & Page Title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] lg:hidden"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span>ChurnIQ</span>
            <span aria-hidden="true">/</span>
            <span className="truncate text-[var(--text-secondary)]">
              {currentNav.label}
            </span>
          </div>
          <h1 className="truncate text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-[17px]">
            {currentNav.label}
          </h1>
        </div>
      </div>

      {/* Right: Search, Date Range, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Global Customer Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchFocused(true);
            }}
            placeholder="Jump to customer ID or name..."
            aria-label="Quick search customers"
            className="h-9 w-56 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] pr-3 pl-8 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:w-64 focus:border-[var(--accent-primary)] focus:outline-none transition-all duration-150"
          />

          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute right-0 mt-1.5 w-80 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-xl">
              {searchMatches.length === 0 ? (
                <div className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                  No matching customers in sample directory.
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {searchMatches.map((c) => (
                    <li key={c.customerID}>
                      <button
                        type="button"
                        onClick={() => handleSelectCustomer(c.customerID)}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition-colors hover:bg-[var(--bg-elevated)]"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)] truncate">
                            {c.name}
                          </p>
                          <p className="font-mono-num text-[11px] text-[var(--text-muted)]">
                            {c.customerID} · {c.segment}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-[var(--accent-primary)] whitespace-nowrap">
                          Inspect
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Date Range Selector */}
        <div className="relative hidden sm:flex items-center">
          <Calendar
            className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <select
            aria-label="Select date range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
            className="h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] pr-3 pl-8 text-xs font-medium text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Toggle notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="font-mono-num absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Retention Alerts
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-primary)] hover:underline"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <ul className="divide-y divide-[var(--border-subtle)] max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.customerID) {
                          setNotifOpen(false);
                          navigate(
                            `/prediction?customerId=${encodeURIComponent(n.customerID)}`
                          );
                        }
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-[var(--bg-elevated)] ${
                        n.read ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          {n.title}
                        </p>
                        <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {n.detail}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-label="Open user profile menu"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)]"
          >
            {!imgError && profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-6 w-6 rounded-md object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-primary)]/20 text-[10px] font-semibold text-[var(--accent-primary)]">
                {profile.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="hidden max-w-[110px] truncate sm:inline">
              {profile.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-xl">
              <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {profile.name}
                </p>
                <p className="truncate text-[11px] text-[var(--text-muted)]">
                  {profile.email}
                </p>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                  <span>
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Workspace Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
