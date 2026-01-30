import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SupportChatContent } from '@/components/support/SupportChatContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('support');

  return {
    title: t('title', { defaultValue: 'Support Chat' }),
    description: t('description', { defaultValue: 'Get help from our support team' }),
  };
}

export default function SupportPage() {
  return <SupportChatContent />;
}
