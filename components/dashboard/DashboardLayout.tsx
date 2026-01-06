'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

import { AutoServiceSelector } from './AutoServiceSelector';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations('dashboard');
  const { user } = useAuth();

  // Check if user owns an auto service
  const isServiceOwner = user?.autoService !== null && user?.autoService !== undefined;

  const navItems = [
    {
      href: '/dashboard',
      label: t('nav.overview', { defaultValue: 'Overview' }),
      icon: '📊',
    },
    {
      href: '/dashboard/visits',
      label: t('nav.visits', { defaultValue: 'Visits' }),
      icon: '📅',
    },
    {
      href: '/dashboard/messages',
      label: t('nav.messages', { defaultValue: 'Messages' }),
      icon: '💬',
    },
    {
      href: '/dashboard/team',
      label: t('nav.team', { defaultValue: 'Team' }),
      icon: '👥',
    },
    {
      href: '/dashboard/analytics',
      label: t('nav.analytics', { defaultValue: 'Analytics' }),
      icon: '📈',
    },
    {
      href: '/my-service',
      label: t('nav.myService', { defaultValue: 'My Service' }),
      icon: '🔧',
    },
    {
      href: '/dashboard/settings',
      label: t('nav.settings', { defaultValue: 'Settings' }),
      icon: '⚙️',
    },
  ];

  return (
    <ProtectedRoute>
      {isServiceOwner ? (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar */}
          <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('nav.dashboard', { defaultValue: 'Dashboard' })}
              </h2>
            </div>
            <div className="px-4 pb-4">
              <AutoServiceSelector />
            </div>
            <nav className="space-y-2 px-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                      isActive
                        ? 'bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            {t('notServiceOwner.title', { defaultValue: 'Auto Service Required' })}
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            {t('notServiceOwner.message', {
              defaultValue: 'You need to own an auto service to access the dashboard.',
            })}
          </p>
          <Link
            href="/services"
            className="inline-block rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
          >
            {t('notServiceOwner.browseServices', { defaultValue: 'Browse Services' })}
          </Link>
        </div>
      )}
    </ProtectedRoute>
  );
}
