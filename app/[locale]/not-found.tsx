import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Link, routing } from '@/i18n/routing';

interface NotFoundProps {
  params?: Promise<{ locale?: string }> | { locale?: string };
}

/**
 * Безопасное извлечение locale из params
 */
async function getLocaleFromParams(
  params?: Promise<{ locale?: string }> | { locale?: string }
): Promise<string> {
  if (!params) {
    return routing.defaultLocale;
  }

  try {
    // Проверяем, является ли params Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    if (
      resolvedParams?.locale &&
      typeof resolvedParams.locale === 'string' &&
      routing.locales.includes(resolvedParams.locale as (typeof routing.locales)[number])
    ) {
      return resolvedParams.locale;
    }
  } catch {
    // Используем дефолтную локаль, если params не удалось разрешить
  }

  return routing.defaultLocale;
}

export async function generateMetadata({ params }: NotFoundProps): Promise<Metadata> {
  await getLocaleFromParams(params);
  const t = await getTranslations('errors');
  return {
    title: `${t('notFound', { defaultValue: 'Page Not Found' })} - Auto Service Connect`,
  };
}

export default async function NotFound({ params }: NotFoundProps) {
  await getLocaleFromParams(params);
  const t = await getTranslations('errors');
  const tNav = await getTranslations('navigation');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="mb-2 font-display text-6xl font-bold text-primary-600 sm:text-8xl">404</h1>
          <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
            {t('notFound', { defaultValue: 'Page Not Found' })}
          </h2>
        </div>
        <p className="mb-8 max-w-md text-lg text-neutral-600">
          {t('notFoundDescription', {
            defaultValue: 'The page you are looking for does not exist or has been moved.',
          })}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg">{tNav('home')}</Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" size="lg">
              {tNav('services')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
