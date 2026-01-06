'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { autoServicesService } from '@/lib/services/auto-services.service';
import { cn } from '@/lib/utils/cn';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

export function AutoServiceSelector() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const {
    selectedAutoServiceId,
    availableAutoServices,
    setSelectedAutoServiceId,
    setAvailableAutoServices,
  } = useAutoServiceStore();

  // Fetch available auto services from backend
  const { data: availableServices = [] } = useQuery({
    queryKey: ['availableAutoServices'],
    queryFn: () => autoServicesService.getAvailableAutoServices(),
    enabled: !!user,
  });

  // Initialize available auto services
  useEffect(() => {
    if (availableServices.length > 0) {
      setAvailableAutoServices(availableServices);
    } else if (!user) {
      setAvailableAutoServices([]);
    }
  }, [availableServices, user, setAvailableAutoServices]);

  // Don't show selector if user has only one or no auto services
  if (availableAutoServices.length <= 1) {
    return null;
  }

  const selectedService = availableAutoServices.find((s) => s.id === selectedAutoServiceId);

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('selectAutoService', { defaultValue: 'Select Auto Service' })}
      </label>
      <div className="flex flex-wrap gap-2">
        {availableAutoServices.map((service) => {
          const isSelected = service.id === selectedAutoServiceId;
          return (
            <button
              key={service.id}
              onClick={() => setSelectedAutoServiceId(service.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                'border-2',
                isSelected
                  ? 'border-primary-600 bg-primary-100 text-primary-700 dark:border-primary-500 dark:bg-primary-900 dark:text-primary-300'
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              )}
            >
              <div className="flex items-center gap-2">
                {service.avatarFile && (
                  <img
                    src={service.avatarFile.fileUrl}
                    alt={service.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span>{service.name}</span>
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-xs',
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
            </button>
          );
        })}
      </div>
      {selectedService && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t('selectedService', {
            defaultValue: 'Currently managing: {{name}}',
            name: selectedService.name,
          })}
        </p>
      )}
    </div>
  );
}
