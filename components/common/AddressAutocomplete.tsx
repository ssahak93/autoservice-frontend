'use client';

import { MapPin, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';

import { geocodingService } from '@/lib/services/geocoding.service';
import { getCurrentLocale } from '@/lib/utils/i18n';

export interface AddressSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  debounceMs?: number; // Default: 300ms
  minLength?: number; // Minimum characters before searching (default: 3)
  countryCode?: string; // Default: 'am'
}

/**
 * AddressAutocomplete Component
 *
 * Provides address autocomplete using Nominatim (OpenStreetMap)
 * Free, no API key required
 * Rate limit: 1 request per second (handled by debounce)
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  disabled = false,
  className = '',
  debounceMs = 300,
  minLength = 3,
  countryCode = 'am',
}: AddressAutocompleteProps) {
  const t = useTranslations('common');
  const locale = getCurrentLocale();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search addresses with debounce
  const searchAddresses = useCallback(
    async (query: string) => {
      if (!query || query.length < minLength) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the search
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          const results = await geocodingService.searchAddresses(
            query,
            countryCode,
            5, // Limit to 5 suggestions
            locale
          );
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Address search error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [countryCode, locale, debounceMs, minLength]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    searchAddresses(newValue);
  };

  // Handle suggestion select
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder || t('enterAddress', { defaultValue: 'Enter address...' })}
          disabled={disabled}
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MapPin className="h-5 w-5 text-neutral-400" />
        </div>
        {isLoading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                  <span className="flex-1">{suggestion.displayName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= minLength && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500 shadow-lg">
          {t('noAddressFound', { defaultValue: 'No addresses found' })}
        </div>
      )}
    </div>
  );
}
