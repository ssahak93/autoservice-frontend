import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AutoServiceProfileContent } from '@/components/auto-service/AutoServiceProfileContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('myService');

  return {
    title: t('title', { defaultValue: 'My Service Profile' }),
    description: t('description', { defaultValue: 'Manage your auto service profile' }),
  };
}

export default function MyServicePage() {
  return <AutoServiceProfileContent />;
}
