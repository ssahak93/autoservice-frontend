import { Home, Search, AlertCircle } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { GoBackButton } from '@/components/common/GoBackButton';
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
    description: t('notFoundDescription', {
      defaultValue: 'The page you are looking for does not exist or has been moved.',
    }),
  };
}

export default async function NotFound({ params }: NotFoundProps) {
  await getLocaleFromParams(params);
  const t = await getTranslations('errors');
  const tNav = await getTranslations('navigation');
  const tCommon = await getTranslations('common');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
      <div className="glass-light w-full max-w-2xl rounded-2xl p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-error-100">
            <AlertCircle className="h-10 w-10 text-error-600" aria-hidden="true" />
          </div>
          <h1 className="mb-2 font-display text-6xl font-bold text-primary-600 sm:text-8xl">404</h1>
          <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
            {t('notFound', { defaultValue: 'Page Not Found' })}
          </h2>
          <p className="mx-auto max-w-md text-base text-neutral-600 sm:text-lg">
            {t('notFoundDescription', {
              defaultValue: 'The page you are looking for does not exist or has been moved.',
            })}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                {tNav('home', { defaultValue: 'Home' })}
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                {tNav('services', { defaultValue: 'Services' })}
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <GoBackButton label={tCommon('back', { defaultValue: 'Go Back' })} />
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-neutral-50 p-4 text-center text-sm text-neutral-600">
          <p>
            {t('notFoundHelp', {
              defaultValue: 'If you believe this is an error, please contact support.',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
