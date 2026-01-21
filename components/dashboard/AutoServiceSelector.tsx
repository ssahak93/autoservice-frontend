'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { ServiceAvatar } from '@/components/auto-service/ServiceAvatar';
import { useAuth } from '@/hooks/useAuth';
import { autoServicesService } from '@/lib/services/auto-services.service';
import { cn } from '@/lib/utils/cn';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

export function AutoServiceSelector() {
  const t = useTranslations('dashboard');
  const tCreate = useTranslations('myService.create');
  const { user } = useAuth();
  const {
    selectedAutoServiceId,
    availableAutoServices,
    setSelectedAutoServiceId,
    setAvailableAutoServices,
  } = useAutoServiceStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available auto services from backend
  const { data: availableServices = [] } = useQuery({
    queryKey: ['availableAutoServices'],
    queryFn: () => autoServicesService.getAvailableAutoServices(),
    enabled: !!user,
  });

  // Initialize available auto services
  useEffect(() => {
    if (availableServices.length > 0) {
      // Map services to match AutoServiceOption type, ensuring role is correctly typed
      const mappedServices = availableServices.map((service) => ({
        id: service.id,
        name: service.name,
        role: (service.role === 'owner' || service.role === 'manager' || service.role === 'employee'
          ? service.role
          : 'employee') as 'owner' | 'manager' | 'employee',
        serviceType: service.serviceType,
        companyName: service.companyName ?? undefined,
        firstName: service.firstName ?? undefined,
        lastName: service.lastName ?? undefined,
        avatarFile: service.avatarFile
          ? {
              fileUrl: service.avatarFile.fileUrl,
            }
          : undefined,
        hasProfile: service.hasProfile,
        isVerified: service.isVerified,
      }));
      setAvailableAutoServices(mappedServices);
    } else if (!user) {
      setAvailableAutoServices([]);
    }
  }, [availableServices, user, setAvailableAutoServices]);

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

  // Don't show selector if user has only one or no auto services
  if (availableAutoServices.length <= 1) {
    return null;
  }

  const selectedService = availableAutoServices.find((s) => s.id === selectedAutoServiceId);

  // Helper to get service type translation
  const getServiceTypeLabel = (serviceType?: 'individual' | 'company') => {
    if (!serviceType) return '';
    return serviceType === 'company'
      ? tCreate('company', { defaultValue: 'Company' })
      : tCreate('individual', { defaultValue: 'Individual' });
  };

  const handleSelect = (serviceId: string) => {
    setSelectedAutoServiceId(serviceId);
    setIsOpen(false);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('selectAutoService', { defaultValue: 'Select Auto Service' })}
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
            {selectedService && (
              <div className="flex-shrink-0 origin-left scale-75">
                <ServiceAvatar
                  avatarFile={selectedService.avatarFile}
                  name={selectedService.name}
                  isVerified={selectedService.isVerified}
                  size="sm"
                  variant="primary"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-gray-900 dark:text-white">
                  {selectedService?.name ||
                    t('selectAutoService', { defaultValue: 'Select Auto Service' })}
                </span>
                {selectedService && (
                  <span
                    className={cn(
                      'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                      selectedService.role === 'owner'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : selectedService.role === 'manager'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    )}
                  >
                    {selectedService.role === 'owner'
                      ? t('role.owner', { defaultValue: 'Owner' })
                      : selectedService.role === 'manager'
                        ? t('role.manager', { defaultValue: 'Manager' })
                        : t('role.employee', { defaultValue: 'Employee' })}
                  </span>
                )}
              </div>
              {selectedService && (
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {getServiceTypeLabel(selectedService.serviceType)}
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
            aria-label={t('selectAutoService', { defaultValue: 'Select Auto Service' })}
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {availableAutoServices.map((service) => {
                const isSelected = service.id === selectedAutoServiceId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelect(service.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      'hover:bg-gray-50 dark:hover:bg-gray-700',
                      isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <ServiceAvatar
                      avatarFile={service.avatarFile}
                      name={service.name}
                      isVerified={service.isVerified}
                      size="sm"
                      variant="primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </span>
                        <span
                          className={cn(
                            'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                            service.role === 'owner'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : service.role === 'manager'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          )}
                        >
                          {service.role === 'owner'
                            ? t('role.owner', { defaultValue: 'Owner' })
                            : service.role === 'manager'
                              ? t('role.manager', { defaultValue: 'Manager' })
                              : t('role.employee', { defaultValue: 'Employee' })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {getServiceTypeLabel(service.serviceType)}
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
