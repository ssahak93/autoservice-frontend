'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreateServiceBanner } from '@/components/auto-service/CreateServiceBanner';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';
import { visitsService } from '@/lib/services/visits.service';
import { cn } from '@/lib/utils/cn';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

import { AutoServiceSelector } from './AutoServiceSelector';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();

  // Check if user owns an auto service
  const isServiceOwner = user?.autoServices && user.autoServices.length > 0;

  // Prefetch dashboard data on mount
  useEffect(() => {
    if (isServiceOwner && selectedAutoServiceId) {
      // Prefetch statistics
      queryClient.prefetchQuery({
        queryKey: ['dashboard', 'statistics', undefined, selectedAutoServiceId],
        queryFn: () =>
          visitsService.getAutoServiceStatistics({
            autoServiceId: selectedAutoServiceId,
          }),
        staleTime: 10 * 60 * 1000,
      });

      // Prefetch recent visits
      queryClient.prefetchQuery({
        queryKey: ['dashboard', 'visits', { page: 1, limit: 10 }, selectedAutoServiceId],
        queryFn: () =>
          visitsService.getAutoServiceList({
            page: 1,
            limit: 10,
            autoServiceId: selectedAutoServiceId,
          }),
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [isServiceOwner, selectedAutoServiceId, queryClient]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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
          {/* Mobile Header */}
          <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('nav.dashboard', { defaultValue: 'Dashboard' })}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <aside
                className={cn(
                  'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:transform-none dark:border-gray-700 dark:bg-gray-800',
                  isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                )}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 lg:border-b-0 lg:p-6 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 lg:block dark:text-white">
                      {t('nav.dashboard', { defaultValue: 'Dashboard' })}
                    </h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-700"
                      aria-label="Close menu"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="overflow-y-auto px-4 pb-4">
                    <div className="py-4">
                      <AutoServiceSelector />
                    </div>
                    <nav
                      className="space-y-2"
                      aria-label={t('nav.main', { defaultValue: 'Main navigation' })}
                    >
                      {navItems.map((item) => {
                        const isActive =
                          pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            onMouseEnter={() => {
                              // Prefetch data on hover for better UX
                              if (item.href === '/dashboard' && selectedAutoServiceId) {
                                queryClient.prefetchQuery({
                                  queryKey: [
                                    'dashboard',
                                    'statistics',
                                    undefined,
                                    selectedAutoServiceId,
                                  ],
                                  queryFn: () =>
                                    visitsService.getAutoServiceStatistics({
                                      autoServiceId: selectedAutoServiceId,
                                    }),
                                });
                              }
                            }}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                              'flex touch-manipulation items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                              isActive
                                ? 'bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                                : 'text-gray-700 active:bg-gray-100 dark:text-gray-300 dark:active:bg-gray-700'
                            )}
                          >
                            <span className="text-xl" aria-hidden="true">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </aside>
            </>
          )}

          {/* Desktop Sidebar */}
          <aside
            className="hidden w-64 border-r border-gray-200 bg-white lg:block dark:border-gray-700 dark:bg-gray-800"
            aria-label={t('nav.sidebar', { defaultValue: 'Dashboard navigation' })}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('nav.dashboard', { defaultValue: 'Dashboard' })}
              </h2>
            </div>
            <div className="px-4 pb-4">
              <AutoServiceSelector />
            </div>
            <nav
              className="space-y-2 px-4"
              aria-label={t('nav.main', { defaultValue: 'Main navigation' })}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => {
                      // Prefetch data on hover for better UX
                      if (item.href === '/dashboard' && selectedAutoServiceId) {
                        queryClient.prefetchQuery({
                          queryKey: ['dashboard', 'statistics', undefined, selectedAutoServiceId],
                          queryFn: () =>
                            visitsService.getAutoServiceStatistics({
                              autoServiceId: selectedAutoServiceId,
                            }),
                        });
                      }
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                      isActive
                        ? 'bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex flex-1 flex-col overflow-hidden pt-14 lg:pt-0">{children}</main>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div suppressHydrationWarning>
            <CreateServiceBanner />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
