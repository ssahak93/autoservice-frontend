import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { MessagesManagementContent } from '@/components/dashboard/messages/MessagesManagementContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard.messages');

  return {
    title: t('title', { defaultValue: 'Messages' }),
    description: t('description', { defaultValue: 'Manage your service messages' }),
  };
}

export default function DashboardMessagesPage() {
  return <MessagesManagementContent />;
}
