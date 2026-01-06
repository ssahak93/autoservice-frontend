import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { VisitsManagementContent } from '@/components/dashboard/visits/VisitsManagementContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard.visits');

  return {
    title: t('title', { defaultValue: 'Visit Management' }),
    description: t('description', { defaultValue: 'Manage your service visits' }),
  };
}

export default function VisitsManagementPage() {
  return <VisitsManagementContent />;
}
