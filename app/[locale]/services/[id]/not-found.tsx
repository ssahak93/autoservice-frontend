import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Link, routing } from '@/i18n/routing';

interface ServiceNotFoundProps {
  params?: Promise<{ locale?: string; id?: string }> | { locale?: string; id?: string };
}

async function getLocaleFromParams(
  params?: Promise<{ locale?: string; id?: string }> | { locale?: string; id?: string }
): Promise<string> {
  if (!params) {
    return routing.defaultLocale;
  }

  try {
    // Check if params is a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    if (
      resolvedParams?.locale &&
      typeof resolvedParams.locale === 'string' &&
      routing.locales.includes(resolvedParams.locale as (typeof routing.locales)[number])
    ) {
      return resolvedParams.locale;
    }
  } catch {
    // Use default locale if params resolution fails
  }

  return routing.defaultLocale;
}

export async function generateMetadata({ params }: ServiceNotFoundProps): Promise<Metadata> {
  // Get locale from params if available, otherwise use default locale
  await getLocaleFromParams(params);
  const t = await getTranslations('services');
  return {
    title: `${t('notFound', { defaultValue: 'Service Not Found' })} - Auto Service Connect`,
  };
}

export default async function ServiceNotFound({ params }: ServiceNotFoundProps) {
  // Get locale from params if available, otherwise use default locale
  // In Next.js App Router, not-found.tsx may not receive params, so we handle it gracefully
  await getLocaleFromParams(params);

  const t = await getTranslations('services');
  const tNav = await getTranslations('navigation');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 font-display text-4xl font-bold text-neutral-900 sm:text-5xl">
          {t('notFound', { defaultValue: 'Service Not Found' })}
        </h1>
        <p className="mb-8 text-lg text-neutral-600">
          {t('notFoundDescription', {
            defaultValue: 'The service you are looking for does not exist or has been removed.',
          })}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/services">
            <Button size="lg">{t('browseServices', { defaultValue: 'Browse Services' })}</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              {tNav('home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
