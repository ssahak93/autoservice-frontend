import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { TeamManagementContent } from '@/components/dashboard/team/TeamManagementContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard.team');

  return {
    title: t('title', { defaultValue: 'Team Management' }),
    description: t('description', { defaultValue: 'Manage your team members' }),
  };
}

export default function DashboardTeamPage() {
  return <TeamManagementContent />;
}
