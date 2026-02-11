import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about');

  return {
    title: t('title', { defaultValue: 'About Us' }),
    description: t('description', { defaultValue: 'Learn more about Auto Service Connect' }),
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-neutral-900 sm:text-5xl">
            {t('title', { defaultValue: 'About Us' })}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
            {t('subtitle', {
              defaultValue: 'Connecting drivers with trusted auto service providers',
            })}
          </p>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Mission Section */}
          <div className="glass-light rounded-2xl p-8">
            <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900">
              {t('mission.title', { defaultValue: 'Our Mission' })}
            </h2>
            <p className="leading-relaxed text-neutral-700">
              {t('mission.description', {
                defaultValue:
                  'Our mission is to simplify the process of finding and booking auto services. We connect drivers with trusted service providers, making car maintenance and repairs more accessible and convenient.',
              })}
            </p>
          </div>

          {/* Vision Section */}
          <div className="glass-light rounded-2xl p-8">
            <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900">
              {t('vision.title', { defaultValue: 'Our Vision' })}
            </h2>
            <p className="leading-relaxed text-neutral-700">
              {t('vision.description', {
                defaultValue:
                  'We envision a future where finding quality auto services is as easy as ordering food online. Every driver should have access to reliable, professional auto service providers at their fingertips.',
              })}
            </p>
          </div>

          {/* Values Section */}
          <div className="glass-light rounded-2xl p-8">
            <h2 className="mb-6 font-display text-2xl font-semibold text-neutral-900">
              {t('values.title', { defaultValue: 'Our Values' })}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">
                  {t('values.trust.title', { defaultValue: 'Trust' })}
                </h3>
                <p className="text-sm text-neutral-700">
                  {t('values.trust.description', {
                    defaultValue:
                      'We verify all service providers to ensure quality and reliability.',
                  })}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">
                  {t('values.transparency.title', { defaultValue: 'Transparency' })}
                </h3>
                <p className="text-sm text-neutral-700">
                  {t('values.transparency.description', {
                    defaultValue: 'Clear pricing, honest reviews, and transparent communication.',
                  })}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">
                  {t('values.convenience.title', { defaultValue: 'Convenience' })}
                </h3>
                <p className="text-sm text-neutral-700">
                  {t('values.convenience.description', {
                    defaultValue: 'Easy booking, real-time updates, and seamless experience.',
                  })}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">
                  {t('values.quality.title', { defaultValue: 'Quality' })}
                </h3>
                <p className="text-sm text-neutral-700">
                  {t('values.quality.description', {
                    defaultValue:
                      'We maintain high standards for all service providers on our platform.',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Team Section (Optional) */}
          <div className="glass-light rounded-2xl p-8">
            <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900">
              {t('team.title', { defaultValue: 'Why Choose Us' })}
            </h2>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary-600">✓</span>
                <span>
                  {t('team.feature1', {
                    defaultValue: 'Verified and trusted auto service providers',
                  })}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary-600">✓</span>
                <span>
                  {t('team.feature2', {
                    defaultValue: 'Easy online booking and scheduling',
                  })}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary-600">✓</span>
                <span>
                  {t('team.feature3', {
                    defaultValue: 'Real-time communication with service providers',
                  })}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary-600">✓</span>
                <span>
                  {t('team.feature4', {
                    defaultValue: 'Transparent reviews and ratings system',
                  })}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
