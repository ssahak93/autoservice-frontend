'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader2, TrendingUp, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect, useRef } from 'react';

import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { searchSuggestionsService } from '@/lib/services/search-suggestions.service';

interface SearchBarEnhancedProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  showSuggestions?: boolean;
}

interface SearchSuggestion {
  query: string;
  count?: number;
  type: 'popular' | 'recent' | 'suggestion';
}

/**
 * Enhanced SearchBar Component with Autocomplete
 *
 * Features:
 * - Debounced search
 * - Search suggestions
 * - Popular searches
 * - Recent searches
 * - Keyboard navigation
 */
export function SearchBarEnhanced({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder,
  showSuggestions = true,
}: SearchBarEnhancedProps) {
  const t = useTranslations('services');
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedValue = useDebounce(localValue, 300);
  const isTypingRef = useRef(false);
  const previousValueRef = useRef(value);
  const lastSearchedValueRef = useRef<string>(value); // Track last value that triggered search
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch search suggestions when user types
  const { data: suggestions = [] } = useQuery({
    queryKey: ['searchSuggestions', debouncedValue],
    queryFn: async () => {
      if (!debouncedValue || debouncedValue.length < 2) {
        // Return popular searches if query is too short
        return searchSuggestionsService.getPopularSearches(5);
      }
      return searchSuggestionsService.getSuggestions(debouncedValue, 8);
    },
    enabled: showSuggestions && isFocused,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Sync with external value (from URL or parent component)
  useEffect(() => {
    // Always sync when value changes from external source (e.g., URL parameter)
    // Only skip if user is currently typing
    if (!isTypingRef.current) {
      if (previousValueRef.current !== value) {
        setLocalValue(value);
        previousValueRef.current = value;
        // Update lastSearchedValueRef when value changes from external source
        lastSearchedValueRef.current = value;
      }
    } else {
      // If user was typing but value changed externally, update after a delay
      const timeoutId = setTimeout(() => {
        if (previousValueRef.current !== value) {
          isTypingRef.current = false;
          setLocalValue(value);
          previousValueRef.current = value;
          lastSearchedValueRef.current = value;
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [value]);

  // Trigger search on debounced value change
  // IMPORTANT: Only call onSearch when debounced value actually changes
  // This prevents multiple requests for each character typed
  useEffect(() => {
    // CRITICAL: Prevent infinite loop - only search if:
    // 1. Debounced value is different from last searched value
    // 2. User is not actively typing
    // 3. Debounced value is different from current URL value
    const shouldSearch =
      debouncedValue !== lastSearchedValueRef.current &&
      !isTypingRef.current &&
      debouncedValue !== value;

    if (shouldSearch && debouncedValue.length >= 2) {
      lastSearchedValueRef.current = debouncedValue;
      onSearch(debouncedValue);
    } else if (debouncedValue === '' && value !== '' && lastSearchedValueRef.current !== '') {
      // Clear search if debounced value is empty
      lastSearchedValueRef.current = '';
      onSearch('');
    }

    // Sync lastSearchedValueRef when value changes from external source (URL)
    if (value !== lastSearchedValueRef.current && !isTypingRef.current) {
      lastSearchedValueRef.current = value;
    }
  }, [debouncedValue, onSearch, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      isTypingRef.current = true;
      setLocalValue(newValue);
      onChange(newValue);
      setSelectedIndex(-1);
      // Reset flag after user stops typing
      setTimeout(() => {
        isTypingRef.current = false;
      }, 300);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    isTypingRef.current = false;
    setLocalValue('');
    onChange('');
    onSearch('');
    setSelectedIndex(-1);
  }, [onChange, onSearch]);

  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      isTypingRef.current = false;
      setLocalValue(suggestion.query);
      onChange(suggestion.query);
      onSearch(suggestion.query);
      setIsFocused(false);
      setSelectedIndex(-1);
    },
    [onChange, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          } else {
            onSearch(localValue);
            setIsFocused(false);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [showSuggestions, suggestions, selectedIndex, handleSelectSuggestion, onSearch, localValue]
  );

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const displaySuggestions = showSuggestions && isFocused && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder || t('searchPlaceholder')}
          className="w-full pl-10 pr-10"
          aria-label={t('searchPlaceholder')}
          aria-autocomplete="list"
          aria-expanded={displaySuggestions}
          aria-controls="search-suggestions"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary-600" />
        )}
        {!isLoading && localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label={t('clearSearch', { defaultValue: 'Clear search' })}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {displaySuggestions && (
        <div
          id="search-suggestions"
          ref={suggestionsRef}
          className="absolute z-50 mt-2 w-full rounded-lg border border-neutral-200 bg-white shadow-lg"
          role="listbox"
        >
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.query}-${index}`}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {suggestion.type === 'popular' && (
                  <TrendingUp className="h-4 w-4 flex-shrink-0 text-primary-600" />
                )}
                {suggestion.type === 'recent' && (
                  <Clock className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                )}
                {suggestion.type === 'suggestion' && (
                  <Search className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                )}
                <span className="flex-1 truncate">{suggestion.query}</span>
                {suggestion.count !== undefined && (
                  <span className="text-xs text-neutral-500">{suggestion.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
