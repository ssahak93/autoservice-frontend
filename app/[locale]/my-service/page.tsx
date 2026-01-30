import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { MyServicePage } from '@/components/auto-service/MyServicePage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('myService');

  return {
    title: t('title', { defaultValue: 'My Service Profile' }),
    description: t('description', { defaultValue: 'Manage your auto service profile' }),
  };
}

export default function Page() {
  return <MyServicePage />;
}
