import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { AuthLogoutHandler } from '@/components/auth/AuthLogoutHandler';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SkipLink } from '@/components/common/SkipLink';
import { Footer } from '@/components/layout/Footer';
import { GlobalChat } from '@/components/layout/GlobalChat';
import { Header } from '@/components/layout/Header';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { Toast } from '@/components/ui/Toast';
import { routing } from '@/i18n/routing';

import { Providers } from '../providers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ErrorBoundary>
        <Providers>
          <ServiceWorkerRegistration>
            <AuthLogoutHandler />
            <OrganizationSchema />
            <SkipLink />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <Footer />
              <GlobalChat />
              <Toast />
            </div>
          </ServiceWorkerRegistration>
        </Providers>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
