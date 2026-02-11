'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Car, ChevronDown, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

import { Link } from '@/i18n/routing';
import { getAnimationVariants } from '@/lib/utils/animations';

interface UserMenuProps {
  userName?: string;
  onLogout: () => void;
}

/**
 * UserMenu Component
 *
 * Single Responsibility: Only handles user menu dropdown with all account-related items
 * Combines: My Visits, My Vehicles, Notifications, Profile, and Logout
 */
export function UserMenu({ userName, onLogout }: UserMenuProps) {
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

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={t('myAccount', { defaultValue: 'My Account' })}
        aria-expanded={isOpen}
      >
        <span className="text-sm text-neutral-600">
          {userName || t('user', { defaultValue: 'User' })}
        </span>
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
              transition={variants.fadeIn.transition}
              className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5"
            >
              <div className="py-1">
                {/* User Name (Header) */}
                {userName && (
                  <div className="border-b border-neutral-200 px-4 py-2">
                    <p className="text-sm font-medium text-neutral-900">{userName}</p>
                  </div>
                )}

                {/* My Visits */}
                <Link
                  href="/visits"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  {t('myVisits')}
                </Link>

                {/* My Vehicles */}
                <Link
                  href="/profile/vehicles"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Car className="h-4 w-4 text-neutral-500" />
                  {t('myVehicles', { defaultValue: 'My Vehicles' })}
                </Link>

                {/* Notifications */}
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Bell className="h-4 w-4 text-neutral-500" />
                  {t('notifications', { defaultValue: 'Notifications' })}
                </Link>

                {/* Divider */}
                <div className="my-1 border-t border-neutral-200" />

                {/* Profile Link */}
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <User className="h-4 w-4 text-neutral-500" />
                  {t('profile')}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <LogOut className="h-4 w-4 text-neutral-500" />
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
