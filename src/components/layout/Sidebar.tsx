import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  PieChart,
  Settings,
  X,
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/analytics', label: 'Customer Analytics', icon: BarChart3 },
  { to: '/segmentation', label: 'Customer Segmentation', icon: PieChart },
  { to: '/prediction', label: 'Churn Prediction', icon: BrainCircuit },
  { to: '/models', label: 'Model Performance', icon: Activity },
  { to: '/insights', label: 'Business Insights', icon: Lightbulb },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { profile } = useAppContext();
  const [imgError, setImgError] = useState(false);

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderBrand = (isMobile = false) => (
    <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-4">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-4.5 w-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12h4l3-7 4 14 3-7h4" />
          </svg>
        </div>
        {(!collapsed || isMobile) && (
          <span className="font-display text-[17px] font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
            ChurnIQ
          </span>
        )}
      </div>

      {isMobile ? (
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] lg:inline-flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );

  const renderNav = (isMobile = false) => (
    <nav aria-label="Primary Sidebar Navigation" className="flex-1 space-y-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={isMobile ? onCloseMobile : undefined}
            title={collapsed && !isMobile ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--accent-primary)]/12 text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    isActive
                      ? 'text-[var(--accent-primary)]'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                  }`}
                  aria-hidden="true"
                />
                {(!collapsed || isMobile) && (
                  <span className="truncate">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const renderProfile = (isMobile = false) => (
    <div className="border-t border-[var(--border-subtle)] p-3">
      <NavLink
        to="/settings"
        onClick={isMobile ? onCloseMobile : undefined}
        className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--bg-elevated)] ${
          collapsed && !isMobile ? 'justify-center' : ''
        }`}
      >
        {!imgError && profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-9 w-9 shrink-0 rounded-lg object-cover border border-[var(--border-subtle)]"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)]/20 text-xs font-semibold text-[var(--accent-primary)]">
            {initials}
          </div>
        )}

        {(!collapsed || isMobile) && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
              {profile.name}
            </p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              {profile.role}
            </p>
          </div>
        )}
      </NavLink>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[256px]'
        }`}
      >
        {renderBrand(false)}
        {renderNav(false)}
        {renderProfile(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-[264px] max-w-[85vw] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            {renderBrand(true)}
            {renderNav(true)}
            {renderProfile(true)}
          </aside>
        </div>
      )}
    </>
  );
}
