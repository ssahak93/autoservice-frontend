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
cp env.template .env.local
```

3. Update `.env.local` with your API URL:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
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
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Auth routes (login, register)
│   │   ├── services/      # Services listing and detail pages
│   │   ├── visits/        # Visits management page
│   │   ├── profile/       # User profile page
│   │   ├── notifications/ # Notifications page
│   │   ├── layout.tsx     # Locale-specific layout
│   │   └── page.tsx       # Home page
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # React Query and i18n providers
│   ├── globals.css        # Global styles
│   ├── robots.ts          # SEO robots.txt
│   └── sitemap.ts         # SEO sitemap
├── components/            # React components
│   ├── ui/                # Reusable UI components (Button, Input, etc.)
│   ├── layout/            # Layout components (Header, Footer, etc.)
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat components (ChatWindow, MessageList, etc.)
│   ├── common/            # Common components (Breadcrumbs, Loading, etc.)
│   ├── notifications/     # Notification components
│   ├── profile/           # Profile components
│   ├── reviews/           # Review components
│   ├── services/          # Service-related components
│   ├── visits/            # Visit-related components
│   └── seo/               # SEO components (Schema.org)
├── lib/                   # Utilities and services
│   ├── api/               # API client configuration
│   │   ├── client.ts      # Axios client setup
│   │   ├── endpoints.ts   # API endpoints definitions
│   │   └── server-client.ts  # Server-side API client
│   ├── services/          # Service layer (API calls)
│   └── utils/             # Helper functions
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useChat.ts         # Chat functionality hook
│   ├── useSocket.ts       # WebSocket hook
│   ├── useVisits.ts       # Visits management hook
│   └── ...                # Other feature hooks
├── stores/                # Zustand stores (state management)
│   ├── authStore.ts       # Authentication state
│   ├── chatStore.ts       # Chat state
│   └── uiStore.ts         # UI state (toasts, modals)
├── design-tokens/         # Design system tokens
│   ├── colors.ts          # Color definitions
│   └── gradients.ts       # Gradient definitions
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
├── messages/              # i18n translation files
│   ├── en.json            # English translations
│   ├── ru.json            # Russian translations
│   └── hy.json            # Armenian translations
├── i18n/                  # i18n configuration
│   ├── routing.ts         # Next.js routing configuration
│   └── request.ts         # Server-side i18n request
├── middleware.ts          # Next.js middleware (i18n, auth)
└── scripts/               # Utility scripts
    └── validate-translations.ts  # Translation validation
```

## 🛠 Tech Stack

- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **TanStack Query (React Query)** - Data fetching and caching
- **React Hook Form + Zod** - Form validation
- **next-intl** - Internationalization (i18n)
- **Socket.IO Client** - Real-time WebSocket communication
- **Axios** - HTTP client
- **date-fns** - Date manipulation

## 📚 Documentation

See `/docs` folder for detailed documentation:

- `CODE_QUALITY.md` - Code quality tools and setup
- `HUSKY_SETUP.md` - Git hooks configuration
- `I18N_BEST_PRACTICES.md` - Internationalization guide
- `OPTIMIZATION_SUMMARY.md` - Performance optimizations
- `RESPONSIVE_UI_GUIDELINES.md` - Responsive design guidelines
- `SEO_PRINCIPLES.md` - SEO best practices
- `SERVER_SIDE_DATA_FETCHING.md` - Server-side data fetching
- `SOLID_PRINCIPLES.md` - SOLID principles implementation
- `UI_UX_BEST_PRACTICES.md` - UI/UX guidelines
- `UI_UX_IMPROVEMENTS_SUMMARY.md` - UI/UX improvements log

See `/docs` folder in project root for additional documentation:

- `FRONTEND_PRINCIPLES.md` - Development principles
- `FRONTEND_DESIGN_TOKENS.md` - Design tokens
- `FRONTEND_BACKGROUNDS.md` - Background system
- `FRONTEND_UI_EFFECTS.md` - UI effects guide

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
- [x] Phase 2: Authentication (Email/Password, JWT)
- [x] Phase 3: Core Features
  - [x] Auto Services (listing, search, detail)
  - [x] Visit Scheduling
  - [x] Real-time Chat (WebSocket)
  - [x] Reviews & Ratings
  - [x] Notifications
  - [x] User Profile
- [x] Phase 4: Polish & Optimization
  - [x] Internationalization (i18n)
  - [x] Responsive Design
  - [x] SEO Optimization
  - [x] Performance Optimization

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
