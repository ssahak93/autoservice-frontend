'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle, Info, Mail, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

import { Link } from '@/i18n/routing';
import { getAnimationVariants, getTransition } from '@/lib/utils/animations';

/**
 * SupportInfoMenu Component
 *
 * Single Responsibility: Only handles support and info menu dropdown
 */
export function SupportInfoMenu() {
  const t = useTranslations('navigation');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const variants = getAnimationVariants();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={t('support', { defaultValue: 'Support' })}
        aria-expanded={isOpen}
      >
        <span>{t('support', { defaultValue: 'Support' })}</span>
        <ChevronDown
          className={`h-4 w-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Menu */}
            <motion.div
              initial={variants.fadeIn.initial}
              animate={variants.fadeIn.animate}
              exit={variants.fadeIn.exit}
              transition={getTransition()}
              className="absolute left-0 top-full z-20 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5"
            >
              <div className="py-1">
                {/* Support */}
                <Link
                  href="/support"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <MessageCircle className="h-4 w-4 text-neutral-500" />
                  {t('support', { defaultValue: 'Support' })}
                </Link>

                {/* Help/FAQ */}
                <Link
                  href="/help"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <HelpCircle className="h-4 w-4 text-neutral-500" />
                  {t('help', { defaultValue: 'Help & FAQ' })}
                </Link>

                {/* About */}
                <Link
                  href="/about"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Info className="h-4 w-4 text-neutral-500" />
                  {t('about')}
                </Link>

                {/* Contact */}
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Mail className="h-4 w-4 text-neutral-500" />
                  {t('contact')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
