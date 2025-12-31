import { useState, useCallback } from 'react';

interface GeolocationState {
  isEnabled: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number; // Accuracy in meters
  error: string | null;
  isLoading: boolean;
  isHighAccuracy?: boolean; // Whether GPS was used (accuracy < 100m)
}

interface UseGeolocationReturn {
  state: GeolocationState;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
}

/**
 * Custom hook for geolocation management
 *
 * Single Responsibility: Only handles geolocation logic
 * Dependency Inversion: Depends on browser API abstraction (navigator.geolocation)
 */
export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    isEnabled: false,
    error: null,
    isLoading: false,
  });

  const enable = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Options for more accurate geolocation
    const options: PositionOptions = {
      enableHighAccuracy: true, // Use GPS if available for better accuracy
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0, // Don't use cached position, always get fresh
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Determine if high accuracy (GPS) was used
        // GPS typically has accuracy < 100m, IP geolocation > 1000m
        const isHighAccuracy = accuracy !== null && accuracy !== undefined && accuracy < 100;

        // Log coordinates for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('[Geolocation] Position obtained:', {
            latitude,
            longitude,
            accuracy: accuracy ? `${accuracy.toFixed(2)}m` : 'unknown',
            isHighAccuracy,
            warning: !isHighAccuracy
              ? 'Low accuracy - using IP geolocation instead of GPS'
              : undefined,
            timestamp: new Date(position.timestamp).toISOString(),
          });

          // Warn user if accuracy is low (only in development)
          if (!isHighAccuracy && accuracy && accuracy > 1000) {
            // eslint-disable-next-line no-console
            console.warn(
              `[Geolocation] Low accuracy detected: ${accuracy.toFixed(2)}m. ` +
                `This may affect search results. Consider using GPS for better accuracy.`
            );
          }
        }

        setState({
          isEnabled: true,
          latitude,
          longitude,
          accuracy: accuracy || undefined,
          isHighAccuracy,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timeout';
        }

        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('[Geolocation] Error:', errorMessage, error);
        }

        setState({
          isEnabled: false,
          error: errorMessage,
          isLoading: false,
        });
      },
      options
    );
  }, []);

  const disable = useCallback(() => {
    setState({
      isEnabled: false,
      latitude: undefined,
      longitude: undefined,
      accuracy: undefined,
      isHighAccuracy: undefined,
      error: null,
      isLoading: false,
    });
  }, []);

  const toggle = useCallback(() => {
    if (state.isEnabled) {
      disable();
    } else {
      enable();
    }
  }, [state.isEnabled, enable, disable]);

  return {
    state,
    enable,
    disable,
    toggle,
  };
}
