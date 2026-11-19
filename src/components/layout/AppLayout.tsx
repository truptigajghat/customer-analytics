import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
