'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, ClipboardList, LogOut } from 'lucide-react';
import { cn } from '@/components/ui';

interface SidebarProps {
  role: 'consultant' | 'client' | undefined;
  organisationId: string | null | undefined;
}

export function Sidebar({ role, organisationId }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const navItems = [];

  if (role === 'consultant') {
    navItems.push({ name: 'Portfolio', href: '/dashboard/portfolio', icon: LayoutDashboard });
    // Consultants can verify orgs via portfolio, but maybe a shortcut to "My Org" isn't relevant unless they have one.
    // Spec says: "Portfolio" (consultant only).
  }

  if (role === 'client' && organisationId) {
    navItems.push({ name: 'My Organisation', href: `/dashboard/org/${organisationId}`, icon: Building2 });
  }

  // "Actions" link
  // For client: link to their org actions anchor or a specific page if we made one.
  // Prompt asked for "Actions" nav item.
  // I will link to a simple actions list page I'll create.
  navItems.push({ name: 'Actions', href: '/dashboard/actions', icon: ClipboardList });

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
          const isActive = pathname === item.href || (item.href !== '/dashboard/portfolio' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive
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
      <div className="p-4 border-t border-gray-700">
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
