'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';

export function CreateServiceBanner() {
  const t = useTranslations('myService.create');
  const { user } = useAuth();
  const dismissedKey = 'createServiceBannerDismissed';
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check sessionStorage only after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const wasDismissed = sessionStorage.getItem(dismissedKey) === 'true';
      setIsDismissed(wasDismissed);
    }
  }, []);

  // Check if user owns any auto service
  const isServiceOwner = user?.autoServices && user.autoServices.length > 0;

  // Don't show if user already has a service or banner is dismissed
  if (isServiceOwner || isDismissed) {
    return null;
  }

  // During SSR and before mount, return null to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(dismissedKey, 'true');
    }
  };

  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 shadow-xl"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white" />
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        aria-label={t('banner.dismiss', { defaultValue: 'Dismiss' })}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">
              {t('banner.title', { defaultValue: 'Start Your Auto Service Journey' })}
            </h3>
            <p className="mt-1 text-sm text-white/90 sm:text-base">
              {t('banner.description', {
                defaultValue:
                  'Create your auto service profile and start accepting bookings from customers.',
              })}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <span className="text-primary-200">✓</span>
                {t('banner.benefit1', { defaultValue: 'Manage bookings and visits' })}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-200">✓</span>
                {t('banner.benefit2', { defaultValue: 'Build your service profile' })}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-200">✓</span>
                {t('banner.benefit3', { defaultValue: 'Connect with customers' })}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link href="/my-service">
            <Button
              variant="secondary"
              className="group w-full bg-white text-primary-600 transition-all hover:bg-white/95 hover:shadow-lg sm:w-auto"
            >
              <span>{t('banner.cta', { defaultValue: 'Create Service' })}</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
