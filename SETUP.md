# Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001)

**Note:** The app will automatically redirect to `/en`, `/ru`, or `/hy` based on your browser language.

## 📦 What's Included

### Phase 1 Complete ✅

- ✅ Next.js 14 with TypeScript
- ✅ Tailwind CSS configured with design tokens
- ✅ API client with interceptors
- ✅ Zustand stores (auth, UI)
- ✅ Design tokens (colors, gradients)
- ✅ Basic layout and home page
- ✅ React Query setup
- ✅ **Internationalization (i18n)** - English, Russian, Armenian

### Next Steps (Phase 2)

- [ ] Authentication pages (Login, Register)
- [ ] Protected routes
- [ ] Layout components (Header, Footer, Sidebar)
- [ ] Toast notifications

## 🌍 Internationalization

The app supports **3 languages**:

- 🇬🇧 **English** (en) - Default
- 🇷🇺 **Russian** (ru)
- 🇦🇲 **Armenian** (hy)

### URL Structure

- English: `http://localhost:3001/en`
- Russian: `http://localhost:3001/ru`
- Armenian: `http://localhost:3001/hy`

### Using Translations

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

### Language Switcher

The `LanguageSwitcher` component is already added to the home page. You can use it anywhere:

```tsx
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

<LanguageSwitcher />;
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
frontend/
├── app/
│   ├── [locale]/           # Localized routes
│   │   ├── layout.tsx      # Locale layout with i18n
│   │   └── page.tsx        # Home page
│   ├── layout.tsx         # Root layout (fonts only)
│   ├── providers.tsx      # React Query provider
│   └── globals.css        # Global styles + animations
├── components/
│   └── common/
│       └── LanguageSwitcher.tsx
├── i18n/
│   ├── request.ts         # Server-side i18n config
│   └── routing.ts         # Routing configuration
├── messages/
│   ├── en.json            # English translations
│   ├── ru.json            # Russian translations
│   └── hy.json            # Armenian translations
├── lib/
│   ├── api/
│   │   ├── client.ts      # Axios client with interceptors
│   │   └── endpoints.ts   # API endpoints constants
│   └── utils/
│       ├── cn.ts          # className utility
│       └── i18n.ts        # i18n utilities
├── stores/
│   ├── authStore.ts       # Authentication state
│   └── uiStore.ts         # UI state (sidebar, toast, etc.)
├── design-tokens/
│   ├── colors.ts          # Color palette
│   └── gradients.ts       # Gradient definitions
└── types/
    └── index.ts           # TypeScript types
```

## 🎨 Design System

- **Primary Color**: Blue (#0ea5e9)
- **Secondary Color**: Purple (#a855f7)
- **Fonts**: Inter (body), Poppins (headings)
- **Gradients**: Hero, Primary, Secondary, Subtle

## 🔗 API Integration

The API client is configured to:

- Automatically add auth tokens to requests
- Refresh tokens on 401 errors
- Handle errors gracefully
- Base URL: `http://localhost:3000/api` (configurable via env)

## 📚 Documentation

See `/docs` folder for:

- `FRONTEND_PRINCIPLES.md` - Development principles
- `FRONTEND_DESIGN_TOKENS.md` - Design tokens
- `FRONTEND_BACKGROUNDS.md` - Background system
- `FRONTEND_UI_EFFECTS.md` - UI effects guide
- `i18n/README.md` - Internationalization guide

## ✅ Phase 1 Checklist

- [x] Project structure created
- [x] Dependencies configured
- [x] Tailwind CSS setup
- [x] Design tokens created
- [x] API client configured
- [x] Zustand stores created
- [x] Basic layout and home page
- [x] TypeScript types defined
- [x] **Internationalization (i18n) setup**
- [x] **Language switcher component**
- [x] **Translations for 3 languages**

## 🚧 Next Phase

Ready to start Phase 2: Authentication & Layout Components!
