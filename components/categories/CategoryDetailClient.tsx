'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/services/categories.service';

interface CategoryDetailClientProps {
  category: Category;
  locale: string;
}

// Smart grouping by service name patterns
function groupServices(serviceTypes: Category['serviceTypes']) {
  if (!serviceTypes || serviceTypes.length === 0) return [];

  const groups: Record<string, typeof serviceTypes> = {};
  const ungrouped: typeof serviceTypes = [];

  // Group keywords
  const groupKeywords: Record<string, string[]> = {
    repair: ['repair', 'overhaul', 'fix', 'restore', 'rebuild'],
    maintenance: ['maintenance', 'service', 'change', 'replacement', 'inspection'],
    diagnostics: ['diagnostics', 'diagnosis', 'scan', 'test', 'check'],
    installation: ['installation', 'install', 'mount', 'fit'],
    cleaning: ['cleaning', 'clean', 'wash', 'detail'],
  };

  serviceTypes.forEach((service) => {
    const name = service.name.toLowerCase();
    let grouped = false;

    // Try to match service name to a group
    for (const [groupName, keywords] of Object.entries(groupKeywords)) {
      if (keywords.some((keyword) => name.includes(keyword))) {
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(service);
        grouped = true;
        break;
      }
    }

    if (!grouped) {
      ungrouped.push(service);
    }
  });

  // Convert to array format
  const result: Array<{ name: string; services: typeof serviceTypes }> = [];

  // Add grouped services
  Object.entries(groups).forEach(([groupName, services]) => {
    if (services.length > 0) {
      result.push({
        name: groupName.charAt(0).toUpperCase() + groupName.slice(1),
        services,
      });
    }
  });

  // Add ungrouped services if any
  if (ungrouped.length > 0) {
    result.push({
      name: 'Other',
      services: ungrouped,
    });
  }

  // If no groups found or all ungrouped, return flat structure
  if (result.length === 0 || (result.length === 1 && result[0].name === 'Other')) {
    return null; // Return null to show flat view
  }

  return result;
}

export function CategoryDetailClient({ category, locale }: CategoryDetailClientProps) {
  const t = useTranslations('serviceCategories');

  const getServiceTypeName = (serviceType: { name: string; nameHy: string; nameRu: string }) => {
    if (locale === 'hy') return serviceType.nameHy;
    if (locale === 'ru') return serviceType.nameRu;
    return serviceType.name;
  };

  // Group services (only if we have enough services to warrant grouping)
  const serviceTypes = useMemo(() => category.serviceTypes || [], [category.serviceTypes]);
  const groupedServices = useMemo(() => {
    if (serviceTypes.length < 6) {
      return null; // Don't group if few services
    }
    return groupServices(serviceTypes);
  }, [serviceTypes]);

  if (serviceTypes.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Wrench className="mb-4 h-12 w-12 text-neutral-400" />
        <p className="text-neutral-600">
          {t('noServices', { defaultValue: 'No services available in this category' })}
        </p>
      </div>
    );
  }

  // Flat view (if few services or no groups found)
  if (!groupedServices) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceTypes.map((serviceType, index) => (
            <Link
              key={serviceType.id}
              href={`/services?serviceTypes=${serviceType.id}&category=${category.code}`}
            >
              <motion.div
                className="glass-light group relative overflow-hidden rounded-xl p-6 transition-all hover:scale-105 hover:shadow-lg"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                      {getServiceTypeName(serviceType)}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600">
                      {t('findProviders', { defaultValue: 'Find providers' })}
                    </p>
                  </div>
                  <ArrowRight className="ml-4 h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Link to browse all services */}
        <div className="mt-8 text-center">
          <Link
            href={`/services?category=${category.code}`}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            {t('browseAllServices', { defaultValue: 'Browse all services in this category' })}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Grouped view
  return (
    <div className="space-y-8">
      {groupedServices.map((group, groupIndex) => (
        <div key={group.name} className="space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary-600" />
            <h2 className="font-display text-xl font-semibold text-neutral-900">{group.name}</h2>
            <span className="text-sm text-neutral-500">({group.services.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.services.map((serviceType, index) => (
              <Link
                key={serviceType.id}
                href={`/services?serviceTypes=${serviceType.id}&category=${category.code}`}
              >
                <motion.div
                  className="glass-light group relative overflow-hidden rounded-xl p-6 transition-all hover:scale-105 hover:shadow-lg"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: groupIndex * 0.1 + index * 0.05,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                        {getServiceTypeName(serviceType)}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-600">
                        {t('findProviders', { defaultValue: 'Find providers' })}
                      </p>
                    </div>
                    <ArrowRight className="ml-4 h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Link to browse all services */}
      <div className="mt-8 text-center">
        <Link
          href={`/services?category=${category.code}`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          {t('browseAllServices', { defaultValue: 'Browse all services in this category' })}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
