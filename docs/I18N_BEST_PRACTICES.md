# Internationalization (i18n) Best Practices

This document outlines best practices for handling translations and language management in the Auto Service Connect frontend application.

## Table of Contents

1. [Language Storage Strategy](#language-storage-strategy)
2. [Translation Management](#translation-management)
3. [Missing Translation Handling](#missing-translation-handling)
4. [Backend Integration](#backend-integration)
5. [Best Practices](#best-practices)
6. [Implementation Guide](#implementation-guide)

---

## Language Storage Strategy

### ✅ Recommended: URL-Based with localStorage Fallback

**Primary Source: URL Route**
- Language is stored in the URL: `/hy/services`, `/en/services`, `/ru/services`
- This is the **single source of truth** for the current language
- SEO-friendly and shareable
- Works with browser back/forward buttons

**Secondary Source: localStorage (Preference Only)**
- Stores user's **preferred language** for initial redirect
- Used only when URL doesn't have a locale
- Not used for runtime language switching

### Why This Approach?

1. **SEO Benefits**: Search engines can index different language versions
2. **Shareability**: Users can share language-specific URLs
3. **Browser History**: Works correctly with browser navigation
4. **Server-Side Rendering**: Next.js can determine language from URL
5. **No State Sync Issues**: URL is always the source of truth

### Implementation

```tsx
// Language is determined from URL
const locale = useLocale(); // Gets from URL: /hy/services -> 'hy'

// Preference stored in localStorage for initial redirect
localStorage.setItem('preferred-locale', 'hy');
```

---

## Translation Management

### File Structure

```
frontend/
├── messages/
│   ├── hy.json    # Armenian (default)
│   ├── en.json    # English
│   └── ru.json    # Russian
```

### Adding Translations

1. **Add to all language files** (hy.json, en.json, ru.json)
2. **Use consistent namespaces**:
   ```json
   {
     "common": { ... },
     "auth": { ... },
     "services": { ... },
     "visits": { ... }
   }
   ```
3. **Keep keys descriptive**:
   - ✅ Good: `services.noResultsFound`
   - ❌ Bad: `s.nrf`

### Using Translations

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('services');
  
  // This will log warning in development if key is missing
  return <h1>{t('title')}</h1>;
}
```

---

## Missing Translation Handling

### Development Mode Warnings

The application automatically logs warnings for missing translations in development:

```tsx
// lib/utils/i18n.ts
export function useT(namespace?: string) {
  const t = useTranslations(namespace);
  
  return (key: string) => {
    const translation = t(key);
    
    // Warn if translation is missing
    if (translation === key && process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation: ${namespace}.${key}`);
    }
    
    return translation;
  };
}
```

### Production Behavior

- Missing translations return the key itself (fallback)
- No console warnings in production
- Application continues to work

### Translation Validation Script

```bash
# TODO: Add script to validate all translations exist
npm run i18n:validate
```

---

## Backend Integration

### Language in HTTP Requests

The frontend automatically sends the current locale in HTTP requests:

**Headers Sent:**
- `Accept-Language: hy` (standard HTTP header)
- `X-Locale: hy` (custom header for explicit locale)

**Implementation:**
```tsx
// lib/api/client.ts
this.client.interceptors.request.use((config) => {
  const locale = getCurrentLocale(); // Gets from URL
  config.headers['Accept-Language'] = locale;
  config.headers['X-Locale'] = locale;
  return config;
});
```

### Backend Handling

**Recommended Backend Implementation:**

```typescript
// backend/src/common/decorators/locale.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Locale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // Priority: X-Locale header > Accept-Language > default
    return (
      request.headers['x-locale'] ||
      request.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
      'hy' // Default to Armenian
    );
  }
);

// Usage in controller
@Get('services')
async getServices(@Locale() locale: string) {
  return this.service.getServices(locale);
}
```

**Alternative: Global Interceptor**

```typescript
// backend/src/common/interceptors/locale.interceptor.ts
@Injectable()
export class LocaleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const locale = 
      request.headers['x-locale'] ||
      request.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
      'hy';
    
    // Attach to request for use in services
    request.locale = locale;
    
    return next.handle();
  }
}
```

### Database Considerations

**Option 1: Store Translations in Database**
```sql
-- Example schema
CREATE TABLE translations (
  id UUID PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  locale VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(key, locale)
);
```

**Option 2: Return Locale-Specific Fields**
```typescript
// Backend response
{
  "name": "Auto Service", // Default (Armenian)
  "nameEn": "Auto Service", // English
  "nameRu": "Авто Сервис", // Russian
}
```

**Option 3: Use Translation Service**
```typescript
// Backend service
class ServiceProviderService {
  async getService(id: string, locale: string) {
    const service = await this.repository.findOne(id);
    
    return {
      ...service,
      name: this.translate(service.nameKey, locale),
      description: this.translate(service.descriptionKey, locale),
    };
  }
}
```

---

## Best Practices

### 1. Always Use URL for Language

✅ **DO:**
```tsx
// Language from URL
const locale = useLocale(); // From /hy/services
```

❌ **DON'T:**
```tsx
// Don't rely only on localStorage
const locale = localStorage.getItem('locale');
```

### 2. Store Preference, Not Current Language

✅ **DO:**
```tsx
// Store user preference for initial redirect
localStorage.setItem('preferred-locale', 'hy');
```

❌ **DON'T:**
```tsx
// Don't sync current language to localStorage
// URL is the source of truth
```

### 3. Send Locale in API Requests

✅ **DO:**
```tsx
// Automatically added by API client
headers: {
  'Accept-Language': 'hy',
  'X-Locale': 'hy'
}
```

### 4. Handle Missing Translations Gracefully

✅ **DO:**
```tsx
// Log warning in development, return key in production
if (missing && isDev) {
  console.warn('Missing translation');
}
return key; // Fallback
```

### 5. Use Consistent Translation Keys

✅ **DO:**
```json
{
  "services": {
    "title": "Services",
    "noResults": "No services found"
  }
}
```

❌ **DON'T:**
```json
{
  "s": {
    "t": "Services",
    "nrf": "No services found"
  }
}
```

### 6. Validate Translations

- Run validation script before deployment
- Check all keys exist in all languages
- Use TypeScript types for translation keys (future enhancement)

---

## Implementation Guide

### Step 1: Update Default Language

```tsx
// i18n/routing.ts
export const routing = defineRouting({
  locales: ['hy', 'en', 'ru'], // Armenian first
  defaultLocale: 'hy', // Armenian is default
});
```

### Step 2: Add Missing Translation Warnings

```tsx
// lib/utils/i18n.ts
export function useT(namespace?: string) {
  const t = useTranslations(namespace);
  return (key: string) => {
    const translation = t(key);
    if (translation === key && process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing: ${namespace}.${key}`);
    }
    return translation;
  };
}
```

### Step 3: Add Locale to API Requests

```tsx
// lib/api/client.ts
this.client.interceptors.request.use((config) => {
  const locale = getCurrentLocale();
  config.headers['Accept-Language'] = locale;
  config.headers['X-Locale'] = locale;
  return config;
});
```

### Step 4: Update Language Switcher

```tsx
// components/common/LanguageSwitcher.tsx
const handleLanguageChange = (newLocale: string) => {
  setPreferredLocale(newLocale); // Store preference
  router.replace(pathname, { locale: newLocale }); // Update URL
};
```

---

## Backend Recommendations

### 1. Create Locale Decorator

```typescript
// backend/src/common/decorators/locale.decorator.ts
export const Locale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-locale'] || 
           request.headers['accept-language']?.split(',')[0]?.split('-')[0] || 
           'hy';
  }
);
```

### 2. Use in Controllers

```typescript
@Get('services')
async getServices(@Locale() locale: string) {
  return this.service.getServices(locale);
}
```

### 3. Store Translations

- Option A: Database table with key-locale-value
- Option B: JSON files per locale
- Option C: Translation service (i18next, etc.)

### 4. Return Localized Responses

```typescript
// Backend service
async getService(id: string, locale: string) {
  const service = await this.repository.findOne(id);
  
  return {
    ...service,
    // Override translatable fields
    name: this.getTranslation(service.nameKey, locale),
    description: this.getTranslation(service.descriptionKey, locale),
  };
}
```

---

## Summary

### Frontend Strategy

1. **Primary**: URL route (`/hy/services`) - single source of truth
2. **Secondary**: localStorage for user preference (initial redirect only)
3. **API**: Send locale in headers (`Accept-Language`, `X-Locale`)
4. **Warnings**: Log missing translations in development

### Backend Strategy

1. **Extract locale** from `X-Locale` or `Accept-Language` headers
2. **Use decorator** for easy access in controllers
3. **Store translations** in database or files
4. **Return localized** content based on locale

### Benefits

- ✅ SEO-friendly (language in URL)
- ✅ Shareable URLs
- ✅ Browser history works
- ✅ Server-side rendering compatible
- ✅ Backend can localize responses
- ✅ No state sync issues

---

## Migration Notes

When migrating from English to Armenian as default:

1. Update `defaultLocale` in `i18n/routing.ts`
2. Update middleware to redirect to `/hy` by default
3. Update documentation
4. Test all language switching flows
5. Update SEO metadata defaults

