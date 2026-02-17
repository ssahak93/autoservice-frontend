import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SUPPORT_EMAIL } from '@/lib/constants/app.config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');

  return {
    title: t('title', { defaultValue: 'Contact Us' }),
    description: t('description', { defaultValue: 'Get in touch with Auto Service Connect' }),
  };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-neutral-900 sm:text-5xl">
            {t('title', { defaultValue: 'Contact Us' })}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
            {t('subtitle', { defaultValue: 'We would love to hear from you' })}
          </p>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="glass-light rounded-2xl p-8">
              <h2 className="mb-6 font-display text-2xl font-semibold text-neutral-900">
                {t('info.title', { defaultValue: 'Get in Touch' })}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {t('info.email.title', { defaultValue: 'Email' })}
                  </h3>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-600 hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {t('info.phone.title', { defaultValue: 'Phone' })}
                  </h3>
                  <a href="tel:+37412345678" className="text-primary-600 hover:underline">
                    {t('info.phone.value', { defaultValue: '+374 12 345 678' })}
                  </a>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {t('info.address.title', { defaultValue: 'Address' })}
                  </h3>
                  <p className="text-neutral-700">
                    {t('info.address.value', {
                      defaultValue: 'Yerevan, Armenia',
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {t('info.hours.title', { defaultValue: 'Business Hours' })}
                  </h3>
                  <p className="text-neutral-700">
                    {t('info.hours.value', {
                      defaultValue: 'Monday - Friday: 9:00 AM - 6:00 PM',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form or Additional Info */}
            <div className="glass-light rounded-2xl p-8">
              <h2 className="mb-6 font-display text-2xl font-semibold text-neutral-900">
                {t('form.title', { defaultValue: 'Send us a Message' })}
              </h2>
              <p className="mb-6 text-neutral-700">
                {t('form.description', {
                  defaultValue:
                    'For support inquiries, please use our support chat. For business inquiries or general questions, please contact us via email or phone.',
                })}
              </p>
              <div className="space-y-4">
                <a
                  href="/support"
                  className="block w-full rounded-lg bg-primary-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-primary-700"
                >
                  {t('form.supportButton', { defaultValue: 'Go to Support Chat' })}
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="block w-full rounded-lg border border-primary-600 px-6 py-3 text-center font-medium text-primary-600 transition-colors hover:bg-primary-50"
                >
                  {t('form.emailButton', { defaultValue: 'Send Email' })}
                </a>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="glass-light mt-8 rounded-2xl p-8">
            <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900">
              {t('additional.title', { defaultValue: 'Other Ways to Reach Us' })}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">
                  {t('additional.support.title', { defaultValue: 'Customer Support' })}
                </h3>
                <p className="text-sm text-neutral-700">
                  {t('additional.support.description', {
                    defaultValue: 'For technical issues or account help, use our support chat.',
                  })}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">
                  {t('additional.business.title', { defaultValue: 'Business Inquiries' })}
                </h3>
                <p className="text-sm text-neutral-700">
                  {t('additional.business.description', {
                    defaultValue:
                      'For partnerships or business opportunities, contact us via email.',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
