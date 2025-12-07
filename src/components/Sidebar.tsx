'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, ClipboardList, LogOut, FileText, Activity, RefreshCw } from 'lucide-react';
import { cn } from '@/components/ui';
import { useState } from 'react';

interface SidebarProps {
  role: 'consultant' | 'client' | undefined;
  organisationId: string | null | undefined;
}

export function Sidebar({ role, organisationId }: SidebarProps) {
  const pathname = usePathname();
  const [resetting, setResetting] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleResetDemo = async () => {
      if (!confirm('Weet je zeker dat je de demo data wilt resetten? Alle wijzigingen gaan verloren.')) return;
      setResetting(true);
      try {
          const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
          if (res.ok) {
              alert('Demo data gereset!');
              window.location.reload();
          } else {
              alert('Reset mislukt');
          }
      } catch (e) {
          console.error(e);
      } finally {
          setResetting(false);
      }
  };

  const navItems = [];

  if (role === 'consultant') {
    navItems.push({ name: 'Executive Dashboard', href: '/dashboard', icon: Activity });
    navItems.push({ name: 'Portfolio', href: '/dashboard/portfolio', icon: LayoutDashboard });
    navItems.push({ name: 'Audit Log', href: '/dashboard/audit-log', icon: FileText });
  }

  if (role === 'client' && organisationId) {
    navItems.push({ name: 'My Organisation', href: `/dashboard/org/${organisationId}`, icon: Building2 });
  }

  navItems.push({ name: 'Actions', href: '/dashboard/actions', icon: ClipboardList });

  const showDemoReset = role === 'consultant' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return (
    <div className="flex flex-col w-64 bg-brand-dark text-white min-h-screen">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <span className="text-xl font-bold tracking-wider text-white">GRC Kompas</span>
      </div>
      <div className="flex-1 px-4 py-6 space-y-2">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            NIS2 Dashboard
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href; // Strict match or sub-path logic? Let's stick to simple logic or improve if needed.
          // Executive dashboard is root /dashboard, so exact match needed or it highlights everywhere.
          const isExact = item.href === '/dashboard';
          const activeClass = isExact
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                activeClass
                  ? "bg-brand-primary text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-700 space-y-2">
        {showDemoReset && (
            <button
                onClick={handleResetDemo}
                disabled={resetting}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-gray-700 rounded-md transition-colors"
            >
                <RefreshCw className={cn("mr-3 h-5 w-5", resetting && "animate-spin")} />
                {resetting ? 'Resetting...' : 'Reset Demo'}
            </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
