'use client';

import { motion } from 'framer-motion';
import { MapPin, Star, Verified } from 'lucide-react';
import Image from 'next/image';

import { Link } from '@/i18n/routing';
import type { AutoService } from '@/types';

interface ServiceCardProps {
  service: AutoService;
  index?: number;
}

export function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const name = service.companyName || `${service.firstName} ${service.lastName}`;
  const rating = service.averageRating || 0;
  const reviewsCount = service.totalReviews || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-light overflow-hidden rounded-xl transition-shadow hover:shadow-xl"
    >
      <Link href={`/services/${service.id}`} aria-label={`View details for ${name}`}>
        <div className="relative h-48 w-full overflow-hidden">
          {service.avatarFile?.fileUrl ? (
            <Image
              src={service.avatarFile.fileUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400">
              <span className="text-4xl font-bold text-white" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {service.isVerified && (
            <div className="absolute right-2 top-2 rounded-full bg-success-500 p-1" aria-label="Verified service">
              <Verified className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-2 font-display text-lg font-semibold text-neutral-900">{name}</h3>

          {service.description && (
            <p className="mb-3 line-clamp-2 text-sm text-neutral-600">{service.description}</p>
          )}

          <div className="mb-3 flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{service.city}</span>
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning-400 text-warning-400" aria-hidden="true" />
                <span className="font-medium" aria-label={`Rating: ${rating} out of 5`}>
                  {rating.toFixed(1)}
                </span>
                <span className="text-neutral-500" aria-label={`${reviewsCount} reviews`}>
                  ({reviewsCount})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {service.specialization && (
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                {service.specialization}
              </span>
            )}
            <span className="text-sm font-medium text-primary-600">View Details →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
