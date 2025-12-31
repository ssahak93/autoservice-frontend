/**
 * Animation utilities with prefers-reduced-motion support
 */

export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation variants that respect prefers-reduced-motion
 */
export const getAnimationVariants = () => {
  const reduceMotion = shouldReduceMotion();

  return {
    fadeIn: {
      initial: { opacity: reduceMotion ? 1 : 0 },
      animate: { opacity: 1 },
      exit: { opacity: reduceMotion ? 1 : 0 },
    },
    slideUp: {
      initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
    },
    scaleIn: {
      initial: { opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.95 },
    },
    modal: {
      initial: {
        opacity: reduceMotion ? 1 : 0,
        scale: reduceMotion ? 1 : 0.95,
        y: reduceMotion ? 0 : 20,
      },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: {
        opacity: reduceMotion ? 1 : 0,
        scale: reduceMotion ? 1 : 0.95,
        y: reduceMotion ? 0 : 20,
      },
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
