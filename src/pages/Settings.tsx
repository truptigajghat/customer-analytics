import React, { useState } from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { API_BASE_URL, USE_DEMO_DATA } from '../services/api';
import type { DateRangeOption } from '../types/analytics';

export default function Settings() {
  const {
    theme,
    setTheme,
    profile,
    updateProfile,
    dashboardPrefs,
    updateDashboardPrefs,
    notificationPrefs,
    updateNotificationPrefs,
  } = useAppContext();

  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [roleInput, setRoleInput] = useState(profile.role);
  const [orgInput, setOrgInput] = useState(profile.organization);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput.trim() || profile.name,
      email: emailInput.trim() || profile.email,
      role: roleInput.trim() || profile.role,
      organization: orgInput.trim() || profile.organization,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile Settings */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Profile Settings
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Manage your workspace identity and organization details
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Work Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-role"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Title / Role
              </label>
              <input
                id="profile-role"
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-org"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Organization
              </label>
              <input
                id="profile-org"
                type="text"
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Save Profile Changes
            </button>
            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Profile updated
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Theme Preferences */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Theme Preferences
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Select your preferred interface appearance
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
              theme === 'dark'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="h-4.5 w-4.5 text-[var(--accent-primary)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Dark Charcoal Navy
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Low-glare enterprise analytics theme
                </p>
              </div>
            </div>
            {theme === 'dark' && (
              <Check className="h-4 w-4 text-[var(--accent-primary)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
              theme === 'light'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="h-4.5 w-4.5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Crisp Light Slate
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  High-key daylight workspace
                </p>
              </div>
            </div>
            {theme === 'light' && (
              <Check className="h-4 w-4 text-[var(--accent-primary)]" />
            )}
          </button>
        </div>
      </section>

      {/* Dashboard Preferences */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Dashboard Preferences
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Configure default time windows, table density, and preview latency
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="pref-range"
              className="block text-xs font-medium text-[var(--text-secondary)]"
            >
              Default Date Range
            </label>
            <select
              id="pref-range"
              value={dashboardPrefs.defaultDateRange}
              onChange={(e) =>
                updateDashboardPrefs({
                  defaultDateRange: e.target.value as DateRangeOption,
                })
              }
              className="mt-1.5 h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pref-rows"
              className="block text-xs font-medium text-[var(--text-secondary)]"
            >
              Table Rows Per Page
            </label>
            <select
              id="pref-rows"
              value={dashboardPrefs.rowsPerPage}
              onChange={(e) =>
                updateDashboardPrefs({ rowsPerPage: Number(e.target.value) })
              }
              className="mt-1.5 h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            >
              <option value={8}>8 rows</option>
              <option value={10}>10 rows</option>
              <option value={15}>15 rows</option>
              <option value={25}>25 rows</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pref-latency"
              className="block text-xs font-medium text-[var(--text-secondary)]"
            >
              Simulated Preview Delay
            </label>
            <select
              id="pref-latency"
              value={dashboardPrefs.simulatedLatencyMs}
              onChange={(e) =>
                updateDashboardPrefs({
                  simulatedLatencyMs: Number(e.target.value),
                })
              }
              className="mt-1.5 h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            >
              <option value={0}>Instant (0ms)</option>
              <option value={120}>Default (120ms)</option>
              <option value={500}>Slow Network (500ms)</option>
            </select>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-xs text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            checked={dashboardPrefs.compactTables}
            onChange={(e) =>
              updateDashboardPrefs({ compactTables: e.target.checked })
            }
            className="h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--accent-primary)]"
          />
          Use compact row spacing in customer data tables
        </label>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Notification Preferences
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Choose which retention alerts appear in your workspace feed
          </p>
        </div>

        <div className="mt-4 divide-y divide-[var(--border-subtle)]">
          {[
            {
              key: 'churnSpikeAlerts' as const,
              title: 'Churn Rate Spike Alerts',
              desc: 'Notify when segment churn rate exceeds 7-day rolling baseline by >1.5%',
            },
            {
              key: 'highRiskDigest' as const,
              title: 'High-Risk Customer Escalations',
              desc: 'Daily summary of accounts entering the High Risk tier',
            },
            {
              key: 'weeklyExecutiveReport' as const,
              title: 'Weekly Executive Retention Digest',
              desc: 'Scheduled Monday summary of MRR retention and cohort trends',
            },
            {
              key: 'modelDriftNotice' as const,
              title: 'Model Evaluation Drift Notices',
              desc: 'Alert when FastAPI pipeline reports ROC-AUC shift below threshold',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                aria-label={item.title}
                checked={notificationPrefs[item.key]}
                onChange={(e) =>
                  updateNotificationPrefs({ [item.key]: e.target.checked })
                }
                className="h-4 w-4 shrink-0 rounded accent-[var(--accent-primary)] cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Application Information */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Application & Backend Integration Information
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Frontend configuration prepared for Python FastAPI integration
          </p>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--text-secondary)]">Platform</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              ChurnIQ Frontend
            </dd>
          </div>
          <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--text-secondary)]">Data Adapter Mode</dt>
            <dd className="font-medium text-amber-600 dark:text-amber-400">
              {USE_DEMO_DATA ? 'Sample / Demo Data' : 'Live FastAPI Backend'}
            </dd>
          </div>
          <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--text-secondary)]">Configured API Base URL</dt>
            <dd className="font-mono-num font-medium text-[var(--text-primary)]">
              {API_BASE_URL}
            </dd>
          </div>
          <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--text-secondary)]">Target Backend Stack</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              Python FastAPI (Google Antigravity)
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
