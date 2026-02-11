'use client';

import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';

export function Footer() {
  const tNav = useTranslations('navigation');
  const tFooter = useTranslations('footer');
  const { isAuthenticated, user } = useAuth();

  // Check if user owns an auto service
  const isServiceOwner = user?.autoServices && user.autoServices.length > 0;

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="mb-4 font-display text-xl font-bold text-primary-600 dark:text-primary-400">
              {tFooter('appName')}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {tFooter('appDescription')}
            </p>
          </div>

          {/* Navigation Section */}
          <div>
            <h4 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {tFooter('navigation')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/services"
                  className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  {tNav('services')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  {tNav('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  {tNav('help', { defaultValue: 'Help & FAQ' })}
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  {tNav('support', { defaultValue: 'Support' })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Section */}
          <div>
            <h4 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {tFooter('account')}
            </h4>
            <ul className="space-y-3 text-sm">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                    >
                      {tNav('profile')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/visits"
                      className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                    >
                      {tNav('myVisits')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile/vehicles"
                      className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                    >
                      {tNav('myVehicles', { defaultValue: 'My Vehicles' })}
                    </Link>
                  </li>
                  {isServiceOwner && (
                    <li>
                      <Link
                        href="/dashboard"
                        className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                      >
                        {tNav('dashboard')}
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/auth/login"
                      className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                    >
                      {tNav('login')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/register"
                      className="text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                    >
                      {tNav('signUp')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {tFooter('legal')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {tFooter('privacyPolicy')}
                </span>
              </li>
              <li>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {tFooter('termsOfService')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-600 sm:mt-12 sm:pt-8 sm:text-sm dark:border-neutral-800 dark:text-neutral-400">
          <p>
            &copy; {new Date().getFullYear()} {tFooter('appName')}. {tFooter('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
