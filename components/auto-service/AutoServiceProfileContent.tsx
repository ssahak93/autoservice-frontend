'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import { useUIStore } from '@/stores/uiStore';

import { AvailabilityCalendar } from './AvailabilityCalendar';
import { PhotoGallery } from './PhotoGallery';
import { ProfileEditor } from './ProfileEditor';
import { ServiceInfo } from './ServiceInfo';

export function AutoServiceProfileContent() {
  const t = useTranslations('myService');
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'profile' | 'availability' | 'photos'>(
    'info'
  );

  // Check if user owns an auto service
  const isServiceOwner = user?.autoService !== null && user?.autoService !== undefined;

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['autoServiceProfile'],
    queryFn: () => autoServiceProfileService.getProfile(),
    enabled: isServiceOwner,
  });

  const publishMutation = useMutation({
    mutationFn: (isPublished: boolean) => autoServiceProfileService.publishProfile(isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] });
      showToast(
        profile?.isPublished
          ? t('unpublishSuccess', { defaultValue: 'Profile unpublished successfully' })
          : t('publishSuccess', { defaultValue: 'Profile published successfully' }),
        'success'
      );
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('publishError', { defaultValue: 'Failed to update publish status' }),
        'error'
      );
    },
  });

  if (!isServiceOwner) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            {t('notServiceOwner.title', { defaultValue: 'Auto Service Required' })}
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            {t('notServiceOwner.message', {
              defaultValue: 'You need to own an auto service to manage your profile.',
            })}
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {t('loadError', { defaultValue: 'Failed to load profile. Please try again.' })}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'info' as const, label: t('tabs.info', { defaultValue: 'Service Info' }), icon: 'ℹ️' },
    { id: 'profile' as const, label: t('tabs.profile', { defaultValue: 'Profile' }), icon: '📝' },
    {
      id: 'availability' as const,
      label: t('tabs.availability', { defaultValue: 'Availability' }),
      icon: '📅',
    },
    { id: 'photos' as const, label: t('tabs.photos', { defaultValue: 'Photos' }), icon: '📷' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title', { defaultValue: 'My Service Profile' })}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('description', { defaultValue: 'Manage your auto service profile and settings' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('completeness', { defaultValue: 'Profile Completeness' })}
              </p>
              <p className="text-2xl font-bold text-primary-600">{profile.profileCompleteness}%</p>
            </div>
            <Button
              variant={profile.isPublished ? 'outline' : 'primary'}
              onClick={() => publishMutation.mutate(!profile.isPublished)}
              isLoading={publishMutation.isPending}
            >
              {profile.isPublished
                ? t('unpublish', { defaultValue: 'Unpublish' })
                : t('publish', { defaultValue: 'Publish Profile' })}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="glass-light rounded-xl p-6">
        {activeTab === 'info' && <ServiceInfo profile={profile} />}
        {activeTab === 'profile' && <ProfileEditor profile={profile} />}
        {activeTab === 'availability' && <AvailabilityCalendar profile={profile} />}
        {activeTab === 'photos' && <PhotoGallery profile={profile} />}
      </div>
    </div>
  );
}
