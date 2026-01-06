import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { DashboardContent } from '@/components/dashboard/DashboardContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');

  return {
    title: t('title', { defaultValue: 'Dashboard' }),
    description: t('description', { defaultValue: 'Auto service management dashboard' }),
  };
}

export default function DashboardPage() {
  return <DashboardContent />;
}
