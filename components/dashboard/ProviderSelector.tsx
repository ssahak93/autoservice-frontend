'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { ServiceAvatar } from '@/components/provider/ServiceAvatar';
import { useAuth } from '@/hooks/useAuth';
import { providersService } from '@/lib/services/providers.service';
import { cn } from '@/lib/utils/cn';
import { getAvatarUrl } from '@/lib/utils/file';
import { useProviderStore } from '@/stores/providerStore';

export function ProviderSelector() {
  const t = useTranslations('dashboard');
  const tCreate = useTranslations('myService.create');
  const { user } = useAuth();
  const { selectedProviderId, availableProviders, setSelectedProviderId, setAvailableProviders } =
    useProviderStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available providers from backend
  const { data: providersData = [] } = useQuery({
    queryKey: ['availableProviders'],
    queryFn: () => providersService.getAvailableProviders(),
    enabled: !!user,
  });

  // Initialize available providers
  useEffect(() => {
    if (providersData.length > 0) {
      // Map providers to match ProviderOption type, ensuring role is correctly typed
      const mappedProviders = providersData.map((provider) => ({
        id: provider.id,
        name: provider.name,
        role: (provider.role === 'owner' ||
        provider.role === 'manager' ||
        provider.role === 'employee'
          ? provider.role
          : 'employee') as 'owner' | 'manager' | 'employee',
        serviceType: provider.serviceType,
        companyName: provider.companyName ?? undefined,
        firstName: provider.firstName ?? undefined,
        lastName: provider.lastName ?? undefined,
        avatarFile: (() => {
          const avatarUrl = getAvatarUrl(provider);
          return avatarUrl ? { fileUrl: avatarUrl } : undefined;
        })(),
        hasProfile: provider.hasBranch,
        isApproved: provider.isApproved,
      }));
      setAvailableProviders(mappedProviders);
    } else if (!user) {
      setAvailableProviders([]);
    }
  }, [providersData, user, setAvailableProviders]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Don't show selector if user has only one or no providers
  if (availableProviders.length <= 1) {
    return null;
  }

  const selectedProvider = availableProviders.find((p) => p.id === selectedProviderId);

  // Helper to get service type translation
  const getServiceTypeLabel = (serviceType?: 'individual' | 'company') => {
    if (!serviceType) return '';
    return serviceType === 'company'
      ? tCreate('company', { defaultValue: 'Company' })
      : tCreate('individual', { defaultValue: 'Individual' });
  };

  const handleSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    setIsOpen(false);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('selectProvider', { defaultValue: 'Select Provider' })}
      </label>
      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border-2 bg-white px-4 py-3 text-left transition-all',
            'hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isOpen
              ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-2'
              : 'border-gray-300 dark:border-gray-600',
            'dark:bg-gray-800 dark:hover:border-primary-500'
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {selectedProvider && (
              <div className="flex-shrink-0 origin-left scale-75">
                <ServiceAvatar
                  avatarFile={selectedProvider.avatarFile}
                  name={selectedProvider.name}
                  isApproved={selectedProvider.isApproved}
                  size="sm"
                  variant="primary"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-gray-900 dark:text-white">
                  {selectedProvider?.name ||
                    t('selectProvider', { defaultValue: 'Select Provider' })}
                </span>
                {selectedProvider && (
                  <span
                    className={cn(
                      'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                      selectedProvider.role === 'owner'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : selectedProvider.role === 'manager'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    )}
                  >
                    {selectedProvider.role === 'owner'
                      ? t('role.owner', { defaultValue: 'Owner' })
                      : selectedProvider.role === 'manager'
                        ? t('role.manager', { defaultValue: 'Manager' })
                        : t('role.employee', { defaultValue: 'Employee' })}
                  </span>
                )}
              </div>
              {selectedProvider && (
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {getServiceTypeLabel(selectedProvider.serviceType)}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'ml-2 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800"
            role="listbox"
            aria-label={t('selectProvider', { defaultValue: 'Select Provider' })}
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {availableProviders.map((provider) => {
                const isSelected = provider.id === selectedProviderId;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleSelect(provider.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      'hover:bg-gray-50 dark:hover:bg-gray-700',
                      isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <ServiceAvatar
                      avatarFile={provider.avatarFile}
                      name={provider.name}
                      isApproved={provider.isApproved}
                      size="sm"
                      variant="primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {provider.name}
                        </span>
                        <span
                          className={cn(
                            'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                            provider.role === 'owner'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : provider.role === 'manager'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          )}
                        >
                          {provider.role === 'owner'
                            ? t('role.owner', { defaultValue: 'Owner' })
                            : provider.role === 'manager'
                              ? t('role.manager', { defaultValue: 'Manager' })
                              : t('role.employee', { defaultValue: 'Employee' })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {getServiceTypeLabel(provider.serviceType)}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Legacy export
