# Auto Service Connect - Frontend

Modern, beautiful, and interactive web application for Auto Service Connect platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

4. Run development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # UI components
│   ├── layout/            # Layout components
│   └── features/          # Feature components
├── lib/                   # Utilities
│   ├── api/               # API client
│   └── utils/             # Helper functions
├── stores/                # Zustand stores
├── design-tokens/         # Design system tokens
└── types/                 # TypeScript types
```

## 🛠 Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **React Hook Form + Zod** - Forms
- **next-intl** - Internationalization (i18n)

## 📚 Documentation

See `/docs` folder for detailed documentation:

- `FRONTEND_PRINCIPLES.md` - Development principles
- `FRONTEND_DESIGN_TOKENS.md` - Design tokens
- `FRONTEND_BACKGROUNDS.md` - Background system
- `FRONTEND_UI_EFFECTS.md` - UI effects guide
- `SEO_PRINCIPLES.md` - SEO best practices (Google, Yandex)

## 🎨 Design System

- **Primary Color**: Blue (#0ea5e9)
- **Secondary Color**: Purple (#a855f7)
- **Fonts**: Inter (body), Poppins (headings)

## 🌍 Internationalization (i18n)

The app supports **3 languages**:

- 🇦🇲 **Armenian** (hy) - Default
- 🇬🇧 **English** (en)
- 🇷🇺 **Russian** (ru)

### Usage

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');

  return <h1>{t('welcome')}</h1>;
}
```

### Language Switcher

Use the `LanguageSwitcher` component in your header/navigation:

```tsx
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

<LanguageSwitcher />;
```

### URL Structure

- English: `/en/services`
- Russian: `/ru/services`
- Armenian: `/hy/services`

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Check TypeScript types

## 🚧 Development Status

- [x] Phase 1: Setup & Configuration
- [x] Code Quality Tools (ESLint, Prettier, Husky)
- [x] SOLID Principles Documentation
- [ ] Phase 2: Authentication
- [ ] Phase 3: Core Features
- [ ] Phase 4: Polish & Optimization

## 🔧 Code Quality

Проект настроен с инструментами для поддержания качества кода:

- **ESLint** - Статический анализ кода
- **Prettier** - Автоматическое форматирование
- **Husky** - Git hooks для автоматических проверок
- **lint-staged** - Проверка только измененных файлов

### Pre-commit Hook

Перед каждым коммитом автоматически:

- ✅ Проверяется код ESLint
- ✅ Форматируется код Prettier

### Pre-push Hook

Перед каждым push автоматически:

- ✅ Проверяются типы TypeScript
- ✅ Запускается полная проверка ESLint

📖 **Подробнее:** См. [docs/CODE_QUALITY.md](./docs/CODE_QUALITY.md)

## 🎯 SOLID Principles

Код следует принципам SOLID для создания поддерживаемого и масштабируемого приложения.

📖 **Подробнее:** См. [docs/SOLID_PRINCIPLES.md](./docs/SOLID_PRINCIPLES.md)
