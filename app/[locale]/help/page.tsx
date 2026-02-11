import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('help');

  return {
    title: t('title', { defaultValue: 'Help & FAQ' }),
    description: t('description', { defaultValue: 'Frequently asked questions and help center' }),
  };
}

export default async function HelpPage() {
  const t = await getTranslations('help');

  const faqCategories = [
    {
      key: 'gettingStarted',
      title: t('categories.gettingStarted.title', { defaultValue: 'Getting Started' }),
      questions: [
        {
          q: t('categories.gettingStarted.q1', {
            defaultValue: 'How do I create an account?',
          }),
          a: t('categories.gettingStarted.a1', {
            defaultValue:
              'Click on "Sign Up" in the header, fill in your information, and verify your email address.',
          }),
        },
        {
          q: t('categories.gettingStarted.q2', {
            defaultValue: 'How do I find an auto service?',
          }),
          a: t('categories.gettingStarted.a2', {
            defaultValue:
              'Use the search bar on the homepage to search by location, service type, or keywords. You can also browse all services.',
          }),
        },
        {
          q: t('categories.gettingStarted.q3', {
            defaultValue: 'How do I book a visit?',
          }),
          a: t('categories.gettingStarted.a3', {
            defaultValue:
              'Click on a service, select "Book Visit", choose a date and time, add your vehicle information, and confirm the booking.',
          }),
        },
      ],
    },
    {
      key: 'bookings',
      title: t('categories.bookings.title', { defaultValue: 'Bookings & Visits' }),
      questions: [
        {
          q: t('categories.bookings.q1', {
            defaultValue: 'Can I cancel or reschedule a visit?',
          }),
          a: t('categories.bookings.a1', {
            defaultValue:
              'Yes, you can cancel or reschedule visits from your "My Visits" page. Please note that cancellation policies may vary by service provider.',
          }),
        },
        {
          q: t('categories.bookings.q2', {
            defaultValue: 'How do I know if my visit is confirmed?',
          }),
          a: t('categories.bookings.a2', {
            defaultValue:
              'You will receive a notification when the service provider confirms your visit. You can also check the status in "My Visits".',
          }),
        },
        {
          q: t('categories.bookings.q3', {
            defaultValue: 'What should I bring to my visit?',
          }),
          a: t('categories.bookings.a3', {
            defaultValue:
              'Bring your vehicle registration documents and any relevant information about the issue. The service provider may contact you if additional items are needed.',
          }),
        },
      ],
    },
    {
      key: 'account',
      title: t('categories.account.title', { defaultValue: 'Account & Profile' }),
      questions: [
        {
          q: t('categories.account.q1', {
            defaultValue: 'How do I update my profile information?',
          }),
          a: t('categories.account.a1', {
            defaultValue:
              'Go to your Profile page and click "Edit" to update your personal information, contact details, and preferences.',
          }),
        },
        {
          q: t('categories.account.q2', {
            defaultValue: 'How do I add or manage my vehicles?',
          }),
          a: t('categories.account.a2', {
            defaultValue:
              'Go to Profile > Vehicles to add, edit, or remove your vehicles. This information helps service providers prepare for your visit.',
          }),
        },
        {
          q: t('categories.account.q3', {
            defaultValue: 'How do I change my password?',
          }),
          a: t('categories.account.a3', {
            defaultValue:
              'You can change your password from your Profile settings. If you forgot your password, use the "Forgot Password" link on the login page.',
          }),
        },
      ],
    },
    {
      key: 'serviceProviders',
      title: t('categories.serviceProviders.title', {
        defaultValue: 'For Service Providers',
      }),
      questions: [
        {
          q: t('categories.serviceProviders.q1', {
            defaultValue: 'How do I register my auto service?',
          }),
          a: t('categories.serviceProviders.a1', {
            defaultValue:
              'Create an account, then go to "My Service" to create your service profile. Fill in all required information and submit for approval.',
          }),
        },
        {
          q: t('categories.serviceProviders.q2', {
            defaultValue: 'How do I manage my bookings?',
          }),
          a: t('categories.serviceProviders.a2', {
            defaultValue:
              'Use the Dashboard to view, accept, complete, or cancel visits. You can also manage your schedule and availability.',
          }),
        },
        {
          q: t('categories.serviceProviders.q3', {
            defaultValue: 'How do I update my service information?',
          }),
          a: t('categories.serviceProviders.a3', {
            defaultValue:
              'Go to "My Service" to update your profile, working hours, services offered, photos, and other information.',
          }),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-neutral-900 sm:text-5xl">
            {t('title', { defaultValue: 'Help & FAQ' })}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
            {t('subtitle', { defaultValue: 'Find answers to common questions' })}
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="mx-auto max-w-4xl space-y-8">
          {faqCategories.map((category) => (
            <div key={category.key} className="glass-light rounded-2xl p-8">
              <h2 className="mb-6 font-display text-2xl font-semibold text-neutral-900">
                {category.title}
              </h2>
              <div className="space-y-6">
                {category.questions.map((item, index) => (
                  <div key={index}>
                    <h3 className="mb-2 font-semibold text-neutral-900">{item.q}</h3>
                    <p className="text-neutral-700">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Still Need Help Section */}
          <div className="glass-light rounded-2xl p-8 text-center">
            <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900">
              {t('stillNeedHelp.title', { defaultValue: 'Still Need Help?' })}
            </h2>
            <p className="mb-6 text-neutral-700">
              {t('stillNeedHelp.description', {
                defaultValue:
                  "Can't find what you're looking for? Our support team is here to help.",
              })}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/support"
                className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
              >
                {t('stillNeedHelp.supportButton', { defaultValue: 'Contact Support' })}
              </a>
              <a
                href="/contact"
                className="rounded-lg border border-primary-600 px-6 py-3 font-medium text-primary-600 transition-colors hover:bg-primary-50"
              >
                {t('stillNeedHelp.contactButton', { defaultValue: 'Contact Us' })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
