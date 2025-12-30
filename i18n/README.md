# Internationalization (i18n) Setup

This project uses `next-intl` for internationalization support.

## 🌍 Supported Languages

- **Armenian** (hy) - Default
- **English** (en)
- **Russian** (ru)

## 📁 File Structure

```
frontend/
├── i18n/
│   ├── request.ts        # Server-side i18n config
│   └── routing.ts        # Routing configuration
├── messages/
│   ├── en.json           # English translations
│   ├── ru.json            # Russian translations
│   └── hy.json            # Armenian translations
└── middleware.ts          # Locale detection middleware
```

## 🔧 Configuration

### Routing

The routing is configured in `i18n/routing.ts`:

- Locales: `['hy', 'en', 'ru']` (Armenian first)
- Default locale: `'hy'` (Armenian)
- URL prefix: Always shown (e.g., `/hy/`, `/en/`, `/ru/`)

### Middleware

The middleware automatically detects the user's preferred language and redirects to the appropriate locale.

## 💻 Usage

### In Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('home');

  return <h1>{t('title')}</h1>;
}
```

### In Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');

  return <button>{t('save')}</button>;
}
```

### With Variables

```tsx
const t = useTranslations('validation');

// In messages/en.json: "minLength": "Must be at least {min} characters"
t('minLength', { min: 8 });
```

### Navigation

Use the `Link` component from `@/i18n/routing` instead of Next.js `Link`:

```tsx
import { Link } from '@/i18n/routing';

<Link href="/services">Services</Link>;
```

## 📝 Adding New Translations

1. Add the key to all language files (`messages/en.json`, `messages/ru.json`, `messages/hy.json`)
2. Use the key in your component:

```tsx
const t = useTranslations('myNamespace');
t('myKey');
```

## 🔄 Language Switcher

The `LanguageSwitcher` component is available at:

- `components/common/LanguageSwitcher.tsx`

Add it to your header/navigation:

```tsx
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

<LanguageSwitcher />;
```

## 🎯 Best Practices

1. **Namespace organization**: Group related translations (e.g., `auth`, `services`, `visits`)
2. **Consistent keys**: Use descriptive, consistent key names
3. **Variables**: Use `{variable}` syntax for dynamic content
4. **Pluralization**: Handle plural forms in translations when needed
5. **RTL support**: Consider RTL languages if needed in the future

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
