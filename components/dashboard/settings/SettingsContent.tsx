'use client';

import { Settings, Bell, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { NotificationSettings } from './NotificationSettings';
import { SecuritySettings } from './SecuritySettings';
import { ServiceSettings } from './ServiceSettings';

type SettingsTab = 'service' | 'notifications' | 'security';

export function SettingsContent() {
  const t = useTranslations('dashboard.settings');
  const [activeTab, setActiveTab] = useState<SettingsTab>('service');

  const tabs = [
    {
      id: 'service' as SettingsTab,
      label: t('tabs.service', { defaultValue: 'Service' }),
      icon: Settings,
    },
    {
      id: 'notifications' as SettingsTab,
      label: t('tabs.notifications', { defaultValue: 'Notifications' }),
      icon: Bell,
    },
    {
      id: 'security' as SettingsTab,
      label: t('tabs.security', { defaultValue: 'Security' }),
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Settings' })}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('description', { defaultValue: 'Manage your service settings and preferences' })}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {activeTab === 'service' && <ServiceSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  );
}
