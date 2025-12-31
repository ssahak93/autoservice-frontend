/**
 * Animation utilities with prefers-reduced-motion support
 */

export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

import type { Variant } from 'framer-motion';

/**
 * Get animation variants that respect prefers-reduced-motion
 */
export const getAnimationVariants = () => {
  const reduceMotion = shouldReduceMotion();

  return {
    fadeIn: {
      initial: { opacity: reduceMotion ? 1 : 0 } as Variant,
      animate: { opacity: 1 } as Variant,
      exit: { opacity: reduceMotion ? 1 : 0 } as Variant,
    },
    slideUp: {
      initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 } as Variant,
      animate: { opacity: 1, y: 0 } as Variant,
      exit: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 } as Variant,
    },
    scaleIn: {
      initial: { opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.95 } as Variant,
      animate: { opacity: 1, scale: 1 } as Variant,
      exit: { opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.95 } as Variant,
    },
    modal: {
      initial: {
        opacity: reduceMotion ? 1 : 0,
        scale: reduceMotion ? 1 : 0.95,
        y: reduceMotion ? 0 : 20,
      } as Variant,
      animate: { opacity: 1, scale: 1, y: 0 } as Variant,
      exit: {
        opacity: reduceMotion ? 1 : 0,
        scale: reduceMotion ? 1 : 0.95,
        y: reduceMotion ? 0 : 20,
      } as Variant,
    },
  };
};

/**
 * Get transition config that respects prefers-reduced-motion
 */
export const getTransition = (duration: number = 0.3) => {
  const reduceMotion = shouldReduceMotion();
  return {
    duration: reduceMotion ? 0 : duration,
    ease: 'easeOut' as const,
  };
};
