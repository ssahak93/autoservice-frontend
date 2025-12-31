'use client';

import { Search, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect, useRef } from 'react';

import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * SearchBar Component
 *
 * Single Responsibility: Only handles search input UI and debouncing
 * Open/Closed: Can be extended with autocomplete without modifying core logic
 */
export function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder,
}: SearchBarProps) {
  const t = useTranslations('services');
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);
  const isTypingRef = useRef(false);

  // Sync with external value only if we're not currently typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  // Trigger search on debounced value change
  useEffect(() => {
    if (debouncedValue !== value) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch, value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      isTypingRef.current = true;
      setLocalValue(newValue);
      onChange(newValue);
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
  }, [onChange, onSearch]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder || t('searchPlaceholder')}
          className="w-full pl-10 pr-10"
          aria-label={t('searchPlaceholder')}
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
    </div>
  );
}
