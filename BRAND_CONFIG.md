# Brand Configuration Guide

This document explains how to configure brand names, domain names, and project names for the application.

## Environment Variables

The following environment variables control brand-related settings:

### Frontend (`.env.local`)

```env
# Full brand name (used in emails, metadata, etc.)
NEXT_PUBLIC_BRAND_NAME=Auto Service Connect

# Short brand name (used in PWA manifest, service worker, etc.)
NEXT_PUBLIC_BRAND_NAME_SHORT=AutoService

# Domain name without protocol (e.g., "autoserviceconnect.am")
NEXT_PUBLIC_DOMAIN_NAME=autoserviceconnect.am

# Full site URL with protocol (if not set, will be constructed from DOMAIN_NAME)
NEXT_PUBLIC_SITE_URL=https://autoserviceconnect.am

# Twitter handle without @ (e.g., "autoserviceconnect")
NEXT_PUBLIC_TWITTER_HANDLE=autoserviceconnect

# User-Agent string for external API calls (e.g., geocoding services)
NEXT_PUBLIC_USER_AGENT=AutoServiceConnect/1.0

# Support email address
NEXT_PUBLIC_SUPPORT_EMAIL=support@autoserviceconnect.com
```

### Backend (`.env`)

```env
# Full brand name (used in Swagger, emails, etc.)
BRAND_NAME=Auto Service Connect

# Short brand name (used in service worker, cache names, etc.)
BRAND_NAME_SHORT=AutoService

# Domain name without protocol
DOMAIN_NAME=autoserviceconnect.am

# User-Agent string for external API calls
USER_AGENT=AutoServiceConnect/1.0
```

## Static Files

The following files are static and need to be manually updated when changing brand configuration:

### `frontend/public/manifest.json`

This file contains PWA manifest settings. Update the following fields:

```json
{
  "name": "Auto Service Connect",
  "short_name": "AutoService",
  "description": "Find and book the best auto services in Armenia"
}
```

**Note:** Consider using a build script to generate this file from environment variables in the future.

### `frontend/public/sw.js`

This file contains the service worker with cache names. Update the following:

```javascript
const CACHE_NAME = 'autoservice-connect-v1';
const RUNTIME_CACHE = 'autoservice-connect-runtime-v1';
```

**Note:** Consider using a build script to generate this file from environment variables in the future.

## Usage in Code

### Frontend

Import the config constants:

```typescript
import {
  BRAND_NAME,
  BRAND_NAME_SHORT,
  SITE_URL,
  DOMAIN_NAME,
  TWITTER_HANDLE,
  USER_AGENT,
} from '@/lib/constants/app.config';
```

### Backend

Access via ConfigService:

```typescript
const brandName = this.configService.get<string>('BRAND_NAME', 'Auto Service Connect');
```

## Files Using Brand Configuration

### Frontend

- `app/sitemap.ts` - Site URL
- `app/[locale]/services/[id]/metadata.ts` - Brand name, Twitter handle
- `app/[locale]/services/metadata.ts` - Brand name, Twitter handle
- `app/robots.ts` - Site URL
- `components/seo/ServiceSchema.tsx` - Site URL
- `components/seo/OrganizationSchema.tsx` - Brand name, Site URL
- `lib/services/geocoding.service.ts` - User-Agent

### Backend

- `src/main.ts` - Swagger title (brand name)
- `src/geocoding/geocoding.service.ts` - User-Agent
- `src/common/services/email.service.ts` - Brand name in email templates
- `src/common/services/email/templates/*.ts` - Brand name in email footers

## Migration Guide

To rebrand the application:

1. Update all environment variables in `.env.local` (frontend) and `.env` (backend)
2. Manually update `frontend/public/manifest.json`
3. Manually update `frontend/public/sw.js`
4. Restart the application

## Future Improvements

Consider creating build scripts to:

- Generate `manifest.json` from environment variables
- Generate `sw.js` from environment variables
- Validate brand configuration at build time
