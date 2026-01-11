'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerRegistrationProps {
  children?: React.ReactNode;
}

/**
 * ServiceWorkerRegistration Component
 *
 * Registers and manages the service worker for PWA functionality.
 * Handles updates and provides user feedback when a new version is available.
 */
export function ServiceWorkerRegistration({ children }: ServiceWorkerRegistrationProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering client-side content after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register service worker in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates immediately
        await registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          setIsInstalling(true);

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available
                setUpdateAvailable(true);
                setIsInstalling(false);
              } else {
                // Service worker installed for the first time
                setIsInstalling(false);
              }
            }
          });
        });

        // Check for updates periodically (every hour)
        setInterval(
          () => {
            if (registration) {
              registration.update();
            }
          },
          60 * 60 * 1000
        );
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Listen for controller changes (when a new service worker takes control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page to get the new service worker
      window.location.reload();
    });

    // Cleanup
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        // Tell the waiting service worker to skip waiting and activate
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setUpdateAvailable(false);
        // The controllerchange event will trigger a reload
      }
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  };

  return (
    <>
      {children}
      {/* Update notification - only render after mount to prevent hydration mismatch */}
      {isMounted && updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border-2 border-primary-500 bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:w-96 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New version available
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Click to update the app</p>
            </div>
            <button
              onClick={handleUpdate}
              className="ml-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              Update
            </button>
          </div>
        </div>
      )}
      {/* Installing notification - only render after mount to prevent hydration mismatch */}
      {isMounted && isInstalling && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border-2 border-blue-500 bg-blue-50 p-4 shadow-lg sm:left-auto sm:right-4 sm:w-96 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Installing update...
          </p>
        </div>
      )}
    </>
  );
}
