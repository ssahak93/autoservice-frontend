'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';

export function Footer() {
  const tNav = useTranslations('navigation');
  const tFooter = useTranslations('footer');

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold">{tFooter('appName')}</h3>
            <p className="text-sm text-neutral-600">{tFooter('appDescription')}</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">{tFooter('navigation')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services" className="text-neutral-600 hover:text-primary-600">
                  {tNav('services')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-600 hover:text-primary-600">
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-600 hover:text-primary-600">
                  {tNav('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">{tFooter('account')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-neutral-600 hover:text-primary-600">
                  {tNav('login')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-neutral-600 hover:text-primary-600">
                  {tNav('signUp')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">{tFooter('legal')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>{tFooter('privacyPolicy')}</li>
              <li>{tFooter('termsOfService')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-600 sm:mt-8 sm:pt-8 sm:text-sm">
          <p>
            &copy; {new Date().getFullYear()} {tFooter('appName')}. {tFooter('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
