# SEO Principles for Auto Service Connect

This document outlines SEO best practices for the frontend web application, covering Google, Yandex, and other major search engines.

## Table of Contents

1. [Meta Tags & Metadata](#meta-tags--metadata)
2. [Structured Data (Schema.org)](#structured-data-schemaorg)
3. [URL Structure & Routing](#url-structure--routing)
4. [Internationalization (i18n) SEO](#internationalization-i18n-seo)
5. [Performance & Core Web Vitals](#performance--core-web-vitals)
6. [Content Optimization](#content-optimization)
7. [Image Optimization](#image-optimization)
8. [Mobile Optimization](#mobile-optimization)
9. [Sitemap & Robots.txt](#sitemap--robotstxt)
10. [Social Media Meta Tags](#social-media-meta-tags)
11. [Yandex Specific](#yandex-specific)
12. [Google Specific](#google-specific)
13. [Implementation Checklist](#implementation-checklist)

---

## Meta Tags & Metadata

### Basic Meta Tags

Every page should include:

```tsx
// app/[locale]/services/[id]/layout.tsx
export const metadata: Metadata = {
  title: 'Auto Service Name - Auto Service Connect',
  description: 'Professional auto service in Yerevan. Book your appointment online. Verified service provider with 4.8 rating.',
  keywords: 'auto service, car repair, Yerevan, Armenia, verified service',
  authors: [{ name: 'Auto Service Connect' }],
  creator: 'Auto Service Connect',
  publisher: 'Auto Service Connect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};
```

### Open Graph Tags (Facebook, LinkedIn)

```tsx
export const metadata: Metadata = {
  openGraph: {
    title: 'Auto Service Name - Auto Service Connect',
    description: 'Professional auto service in Yerevan',
    url: 'https://autoserviceconnect.am/services/service-id',
    siteName: 'Auto Service Connect',
    images: [
      {
        url: 'https://autoserviceconnect.am/images/service-avatar.jpg',
        width: 1200,
        height: 630,
        alt: 'Auto Service Name',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};
```

### Twitter Card Tags

```tsx
export const metadata: Metadata = {
  twitter: {
    card: 'summary_large_image',
    title: 'Auto Service Name - Auto Service Connect',
    description: 'Professional auto service in Yerevan',
    images: ['https://autoserviceconnect.am/images/service-avatar.jpg'],
    creator: '@autoserviceconnect',
  },
};
```

### Canonical URLs

```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://autoserviceconnect.am/services/service-id',
    languages: {
      'en': 'https://autoserviceconnect.am/en/services/service-id',
      'ru': 'https://autoserviceconnect.am/ru/services/service-id',
      'hy': 'https://autoserviceconnect.am/hy/services/service-id',
    },
  },
};
```

---

## Structured Data (Schema.org)

### LocalBusiness Schema (for Service Providers)

```tsx
// components/seo/ServiceSchema.tsx
export function ServiceSchema({ service }: { service: AutoService }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: service.companyName || `${service.firstName} ${service.lastName}`,
    description: service.description,
    image: service.avatarFile?.fileUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: service.address,
      addressLocality: service.city,
      addressRegion: service.region,
      addressCountry: 'AM',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: service.latitude,
      longitude: service.longitude,
    },
    telephone: service.phoneNumber,
    priceRange: '$$',
    aggregateRating: service.averageRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: service.averageRating,
          reviewCount: service.totalReviews,
        }
      : undefined,
    openingHoursSpecification: service.workingHours
      ? Object.entries(service.workingHours).map(([day, hours]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
          opens: hours?.open,
          closes: hours?.close,
        }))
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Organization Schema (for Homepage)

```tsx
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Auto Service Connect',
    url: 'https://autoserviceconnect.am',
    logo: 'https://autoserviceconnect.am/logo.png',
    description: 'Find and book the best auto services in Armenia',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['en', 'ru', 'hy'],
    },
    sameAs: [
      'https://www.facebook.com/autoserviceconnect',
      'https://www.instagram.com/autoserviceconnect',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### BreadcrumbList Schema

```tsx
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## URL Structure & Routing

### Best Practices

1. **Use Clean URLs**
   - ✅ Good: `/services/auto-repair-yerevan`
   - ❌ Bad: `/services?id=123&name=auto-repair`

2. **Include Keywords in URLs**
   - `/services/car-wash-yerevan`
   - `/services/engine-repair-armenia`

3. **Use Hyphens, Not Underscores**
   - ✅ Good: `/services/auto-service`
   - ❌ Bad: `/services/auto_service`

4. **Keep URLs Short**
   - Maximum 3-4 levels deep
   - ✅ Good: `/services/[id]`
   - ❌ Bad: `/category/subcategory/service/[id]`

### Next.js App Router Implementation

```tsx
// app/[locale]/services/[id]/page.tsx
export async function generateMetadata(
  { params }: { params: { locale: string; id: string } }
): Promise<Metadata> {
  const service = await getServiceById(params.id);
  
  return {
    title: `${service.name} - Auto Service Connect`,
    description: service.description,
    alternates: {
      canonical: `https://autoserviceconnect.am/${params.locale}/services/${params.id}`,
    },
  };
}
```

---

## Internationalization (i18n) SEO

### Hreflang Tags

```tsx
// app/[locale]/layout.tsx
export const metadata: Metadata = {
  alternates: {
    languages: {
      'en': 'https://autoserviceconnect.am/en',
      'ru': 'https://autoserviceconnect.am/ru',
      'hy': 'https://autoserviceconnect.am/hy',
      'x-default': 'https://autoserviceconnect.am/en',
    },
  },
};
```

### Language-Specific Content

- Use proper language codes (en, ru, hy)
- Translate all metadata
- Use locale-specific keywords
- Provide language switcher with proper links

---

## Performance & Core Web Vitals

### Core Web Vitals Targets

1. **Largest Contentful Paint (LCP)**: < 2.5s
2. **First Input Delay (FID)**: < 100ms
3. **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Strategies

```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={service.avatarFile.fileUrl}
  alt={service.name}
  width={800}
  height={600}
  priority={isAboveFold}
  loading={isAboveFold ? 'eager' : 'lazy'}
  placeholder="blur"
/>
```

### Code Splitting

```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic';

const ServiceMap = dynamic(() => import('@/components/ServiceMap'), {
  loading: () => <MapSkeleton />,
  ssr: false,
});
```

---

## Content Optimization

### Title Tags

- Length: 50-60 characters
- Include primary keyword
- Include brand name
- Unique for each page

```tsx
// Examples
'Car Repair Services in Yerevan | Auto Service Connect'
'Auto Service Name - Verified Provider | Auto Service Connect'
'Book Auto Service Online - Auto Service Connect'
```

### Meta Descriptions

- Length: 150-160 characters
- Include call-to-action
- Include primary keyword
- Unique for each page

```tsx
// Examples
'Find and book verified auto services in Yerevan. Professional car repair, maintenance, and diagnostics. Book your appointment online today!'
'Professional auto service in Armenia. Expert mechanics, verified reviews, easy online booking. Schedule your visit now!'
```

### Heading Structure

```tsx
// Proper heading hierarchy
<h1>Service Name</h1> {/* Only one H1 per page */}
<h2>About This Service</h2>
<h3>Services Offered</h3>
<h3>Working Hours</h3>
<h2>Customer Reviews</h2>
```

### Keyword Optimization

- **Primary Keywords**: auto service, car repair, auto service Armenia
- **Long-tail Keywords**: car repair Yerevan, auto service near me, verified auto mechanic
- **Local Keywords**: Yerevan, Armenia, [city name] auto service

---

## Image Optimization

### Image SEO Best Practices

```tsx
<Image
  src={imageUrl}
  alt="Descriptive alt text with keywords" // Required for SEO
  width={1200}
  height={630}
  title="Image title" // Optional but helpful
/>
```

### Alt Text Guidelines

- ✅ Good: "Professional car mechanic repairing engine in Yerevan auto service"
- ❌ Bad: "image1.jpg" or "photo"

### Image File Names

- ✅ Good: `car-repair-yerevan-service.jpg`
- ❌ Bad: `IMG_1234.jpg` or `photo.png`

---

## Mobile Optimization

### Mobile-First Design

- Responsive design (Tailwind CSS breakpoints)
- Touch-friendly buttons (min 44x44px)
- Fast loading on mobile networks
- Mobile-optimized images

### Viewport Meta Tag

```tsx
// Already handled by Next.js, but ensure:
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## Sitemap & Robots.txt

### Dynamic Sitemap Generation

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://autoserviceconnect.am';
  const locales = ['en', 'ru', 'hy'];
  
  // Get all services
  const services = await getAllServices();
  
  const serviceUrls = services.flatMap((service) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/services/${service.id}`,
      lastModified: service.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...serviceUrls,
  ];
}
```

### Robots.txt

```tsx
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://autoserviceconnect.am/sitemap.xml',
  };
}
```

---

## Social Media Meta Tags

### Facebook Open Graph

Already covered in Meta Tags section.

### Twitter Cards

Already covered in Meta Tags section.

### LinkedIn

Uses Open Graph tags, same as Facebook.

---

## Yandex Specific

### Yandex Webmaster Tools

1. **Add Yandex Verification**
   ```tsx
   // app/layout.tsx
   <meta name="yandex-verification" content="YOUR_VERIFICATION_CODE" />
   ```

2. **Yandex Metrika**
   ```tsx
   // Add Yandex Metrika script
   <script
     type="text/javascript"
     dangerouslySetInnerHTML={{
       __html: `
         (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
         m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
         (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
         ym(YANDEX_ID, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true});
       `,
     }}
   />
   ```

3. **Yandex Structured Data**
   - Use same Schema.org markup (Yandex supports it)
   - Add Yandex-specific microdata if needed

### Yandex SEO Guidelines

- **Content Quality**: Original, unique content
- **Loading Speed**: Fast page load (Yandex considers this)
- **Mobile-First**: Mobile version is prioritized
- **HTTPS**: Required for better ranking
- **Local SEO**: Important for Armenia market

---

## Google Specific

### Google Search Console

1. **Verification**
   ```tsx
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```

2. **Google Analytics 4**
   ```tsx
   // Add GA4 script
   <script
     async
     src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
   />
   ```

### Google SEO Guidelines

- **E-E-A-T**: Experience, Expertise, Authoritativeness, Trustworthiness
- **Core Web Vitals**: Critical ranking factors
- **Mobile-First Indexing**: Mobile version is primary
- **HTTPS**: Required
- **Structured Data**: Use Schema.org

---

## Implementation Checklist

### Page-Level SEO

- [ ] Unique, descriptive title tag (50-60 chars)
- [ ] Unique meta description (150-160 chars)
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Alt text for all images
- [ ] Canonical URL set
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Structured data (Schema.org)
- [ ] Breadcrumb navigation
- [ ] Internal linking
- [ ] Fast page load (< 3s)
- [ ] Mobile responsive
- [ ] HTTPS enabled

### Site-Level SEO

- [ ] XML Sitemap generated
- [ ] Robots.txt configured
- [ ] 404 page with proper redirects
- [ ] Language tags (hreflang)
- [ ] Search console verification
- [ ] Analytics tracking
- [ ] Performance optimization
- [ ] Security headers
- [ ] SSL certificate

### Content SEO

- [ ] Keyword research completed
- [ ] Content optimized for keywords
- [ ] Unique content on each page
- [ ] Regular content updates
- [ ] User-generated content (reviews)
- [ ] Local SEO optimization
- [ ] Multilingual content

### Technical SEO

- [ ] Clean URL structure
- [ ] Proper redirects (301)
- [ ] No duplicate content
- [ ] Fast server response time
- [ ] Proper error handling
- [ ] Structured data validation
- [ ] Mobile usability
- [ ] Core Web Vitals optimization

---

## Tools & Resources

### SEO Tools

- **Google Search Console**: Monitor search performance
- **Yandex Webmaster**: Monitor Yandex performance
- **Google Analytics**: Track user behavior
- **Yandex Metrika**: Track user behavior (Russia/CIS)
- **PageSpeed Insights**: Check performance
- **Schema.org Validator**: Validate structured data
- **Screaming Frog**: Technical SEO audit

### Testing Tools

- **Google Rich Results Test**: Test structured data
- **Mobile-Friendly Test**: Check mobile optimization
- **PageSpeed Insights**: Performance testing
- **Lighthouse**: Comprehensive audit

---

## Monitoring & Maintenance

### Regular Checks

1. **Weekly**: Check Search Console for errors
2. **Monthly**: Review keyword rankings
3. **Quarterly**: Full SEO audit
4. **Ongoing**: Monitor Core Web Vitals

### Key Metrics to Track

- Organic traffic
- Keyword rankings
- Click-through rate (CTR)
- Bounce rate
- Average session duration
- Pages per session
- Conversion rate
- Core Web Vitals scores

---

## Best Practices Summary

1. **Content First**: High-quality, original content
2. **User Experience**: Fast, mobile-friendly, accessible
3. **Technical Excellence**: Clean code, proper structure
4. **Local SEO**: Optimize for Armenia market
5. **Multilingual**: Proper i18n implementation
6. **Structured Data**: Rich snippets for better visibility
7. **Performance**: Fast loading, optimized assets
8. **Security**: HTTPS, secure headers
9. **Monitoring**: Regular tracking and optimization
10. **Compliance**: Follow search engine guidelines

---

## Notes

- SEO is an ongoing process, not a one-time setup
- Focus on user experience first, SEO second
- Keep up with search engine algorithm updates
- Test and measure everything
- Local SEO is crucial for Armenia market
- Multilingual SEO requires careful implementation

