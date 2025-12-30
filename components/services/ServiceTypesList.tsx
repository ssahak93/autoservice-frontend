'use client';

import { Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ServiceType {
  id: string;
  name: string;
  category?: string;
}

interface ServiceTypesListProps {
  services?: ServiceType[];
}

export function ServiceTypesList({ services = [] }: ServiceTypesListProps) {
  const t = useTranslations('services');

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
        <Wrench className="h-6 w-6" />
        <span>{t('servicesOffered')}</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => (
          <span
            key={service.id}
            className="rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700"
          >
            {service.name}
          </span>
        ))}
      </div>
    </div>
  );
}
