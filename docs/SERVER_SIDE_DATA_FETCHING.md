# Server-Side Data Fetching Implementation

This document describes the smart solution for using backend endpoint response data in auto services pages.

## 🎯 Solution Overview

We've implemented a **hybrid approach** that combines:
- **Server-Side Rendering (SSR)** for initial page load (SEO, performance)
- **Client-Side Data Fetching** for interactive features (filters, pagination)

## 📁 Architecture

### Server-Side Components
- `app/[locale]/services/page.tsx` - Server component for services list
- `app/[locale]/services/[id]/page.tsx` - Server component for service detail
- `lib/services/services.server.ts` - Server-side API client
- `lib/api/server-client.ts` - Axios instance for server-side requests

### Client-Side Components
- `components/services/ServicesClient.tsx` - Client component for interactive list
- `components/services/ServiceDetailClient.tsx` - Client component for interactive detail parts

## 🔄 Data Flow

### Services List Page

```
1. Server Component (page.tsx)
   ↓
   Fetches initial data using servicesServerService.search()
   ↓
   Passes data to ServicesClient as initialData
   ↓
2. Client Component (ServicesClient.tsx)
   ↓
   Uses React Query with initialData for hydration
   ↓
   Handles client-side updates (filters, pagination)
```

### Service Detail Page

```
1. Server Component (page.tsx)
   ↓
   Fetches service data using servicesServerService.getById()
   ↓
   Renders main content (SEO-friendly)
   ↓
   Passes serviceId to ServiceDetailClient
   ↓
2. Client Component (ServiceDetailClient.tsx)
   ↓
   Handles interactive parts (reviews, etc.)
```

## 🔧 Backend Response Mapping

### Search Endpoint Response
```typescript
// Backend returns:
{
  data: SearchResult[],
  pagination: { page, limit, total, totalPages }
}

// SearchResult structure:
{
  id: string;
  name: string;
  serviceType: string;
  description: string;
  city: string;
  region: string;
  averageRating: number | null;
  totalReviews: number;
  distance?: number;
  services: Array<{ id, name, category }>;
  avatarUrl: string | null;
  isVerified: boolean;
}
```

### Detail Endpoint Response
```typescript
// Backend returns:
{
  id: string;
  name: string;
  serviceType: 'individual' | 'company';
  description: string | null;
  specialization: string | null;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  workingHours: Record<string, { open, close }> | null;
  services: Array<{ id, name, category }>;
  averageRating: number | null;
  totalReviews: number;
  isVerified: boolean;
  avatarUrl: string | null;
}
```

## 🎨 Transformation Logic

### Search Result → AutoService
```typescript
function transformSearchResult(result: SearchResult): AutoService {
  // Split name for individual services
  const [firstName, ...lastNameParts] = result.name.split(' ');
  const lastName = lastNameParts.join(' ') || '';

  return {
    id: result.id,
    serviceType: result.serviceType as 'individual' | 'company',
    companyName: result.serviceType === 'company' ? result.name : undefined,
    firstName: result.serviceType === 'individual' ? firstName : undefined,
    lastName: result.serviceType === 'individual' ? lastName : undefined,
    description: result.description || undefined,
    address: `${result.city}, ${result.region}`, // Backend doesn't return address
    city: result.city,
    region: result.region,
    latitude: 0, // Not in search response
    longitude: 0, // Not in search response
    averageRating: result.averageRating ? Number(result.averageRating) : undefined,
    totalReviews: result.totalReviews,
    isVerified: result.isVerified,
    avatarFile: result.avatarUrl ? { fileUrl: result.avatarUrl } : undefined,
    specialization: result.services?.[0]?.name || undefined,
  };
}
```

### Detail Response → AutoService
```typescript
function transformDetailResponse(response: BackendDetailResponse): AutoService {
  const [firstName, ...lastNameParts] = response.name.split(' ');
  const lastName = lastNameParts.join(' ') || '';

  return {
    id: response.id,
    serviceType: response.serviceType,
    companyName: response.serviceType === 'company' ? response.name : undefined,
    firstName: response.serviceType === 'individual' ? firstName : undefined,
    lastName: response.serviceType === 'individual' ? lastName : undefined,
    description: response.description || undefined,
    specialization: response.specialization || undefined,
    address: response.address,
    city: response.city,
    region: response.region,
    latitude: response.latitude,
    longitude: response.longitude,
    phoneNumber: response.phoneNumber || undefined,
    workingHours: response.workingHours || undefined,
    averageRating: response.averageRating ? Number(response.averageRating) : undefined,
    totalReviews: response.totalReviews,
    isVerified: response.isVerified,
    avatarFile: response.avatarUrl ? { fileUrl: response.avatarUrl } : undefined,
  };
}
```

## ✅ Benefits

1. **SEO Optimization**
   - Server-side rendering ensures search engines can index content
   - Meta tags generated server-side with actual data
   - Structured data (Schema.org) included

2. **Performance**
   - Initial page load is faster (server-rendered HTML)
   - Reduced client-side JavaScript bundle
   - Better Core Web Vitals scores

3. **User Experience**
   - Content visible immediately (no loading spinner on initial load)
   - Smooth client-side updates for filters/pagination
   - Progressive enhancement approach

4. **Type Safety**
   - Proper TypeScript types for backend responses
   - Transformation functions ensure type safety
   - Compile-time error checking

## 🔐 Security & Best Practices

1. **Server Client**
   - No authentication cookies (public endpoints only)
   - Proper error handling
   - Timeout configuration

2. **Data Transformation**
   - Validates and transforms backend data
   - Handles missing/null values gracefully
   - Maintains type safety

3. **Error Handling**
   - Server-side errors caught and handled
   - Client-side retry mechanisms
   - User-friendly error messages

## 📝 Usage Examples

### Server Component (Services List)
```typescript
export default async function ServicesPage({ params, searchParams }) {
  const { locale } = await params;
  const search = await searchParams;
  
  // Parse filters from URL
  const filters = {
    city: search.city,
    page: search.page ? parseInt(search.page, 10) : 1,
    // ... other filters
  };

  // Fetch server-side
  const initialData = await servicesServerService.search(filters, locale);

  // Pass to client component
  return <ServicesClient initialData={initialData} />;
}
```

### Client Component (Services List)
```typescript
export function ServicesClient({ initialData }) {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  
  // Use React Query with initial server data
  const { data } = useServices(filters, { initialData });
  
  // Client-side updates work seamlessly
  return <ServiceFilters onFiltersChange={setFilters} />;
}
```

## 🚀 Future Enhancements

1. **Caching Strategy**
   - Add Redis caching for server-side requests
   - Implement ISR (Incremental Static Regeneration)
   - Cache service detail pages

2. **Optimistic Updates**
   - Implement optimistic UI updates for filters
   - Prefetch next page data

3. **Error Recovery**
   - Better error boundaries
   - Automatic retry with exponential backoff
   - Offline support

---

**Last Updated**: 2025-01-29
**Status**: ✅ Implemented and tested

