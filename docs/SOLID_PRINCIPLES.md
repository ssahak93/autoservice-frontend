# SOLID Principles Implementation

This document describes how SOLID principles are applied in the frontend codebase, specifically in the search functionality.

## Overview

The search functionality has been designed to strictly follow SOLID principles, making the code more maintainable, testable, and extensible.

## Single Responsibility Principle (SRP)

Each component/hook/utility has a single, well-defined responsibility:

### ServicesClient Component

- **Responsibility**: Orchestrates search UI and data fetching
- **Does NOT**: Handle URL synchronization, filter logic, or data transformation

### SearchBar Component

- **Responsibility**: Handles search input UI and debouncing
- **Does NOT**: Manage search state or perform API calls

### ServiceFilters Component

- **Responsibility**: Handles filter UI and local state management
- **Does NOT**: Perform API calls or manage URL state

### ActiveFilters Component

- **Responsibility**: Displays active filters as removable chips
- **Does NOT**: Manage filter state or perform filtering logic

### useSearch Hook

- **Responsibility**: Manages search state and URL synchronization
- **Does NOT**: Handle UI rendering or API calls

### searchParams Utilities

- **Responsibility**: Serialize/deserialize search parameters to/from URL
- **Does NOT**: Manage state or perform API calls

## Open/Closed Principle (OCP)

The code is open for extension but closed for modification:

### Component Composition

- New filter types can be added to `ServiceFilters` without modifying existing filters
- New search features can be added by composing existing components
- Example: Adding a "price range" filter only requires adding a new input field

### Hook Extensibility

- `useSearch` hook can be extended with new options without breaking existing usage
- New search parameters can be added to utilities without modifying existing logic

### Utility Functions

- `serializeSearchParams` and `deserializeSearchParams` can handle new parameters without modification
- New parameter types are added by extending the functions, not modifying them

## Liskov Substitution Principle (LSP)

Components and hooks can be substituted with compatible implementations:

### SearchBar Component

- Can be replaced with any component that implements the same props interface
- Example: Could be replaced with an autocomplete search bar without breaking the parent

### useSearch Hook

- Can be replaced with any hook that returns the same interface
- Example: Could be replaced with a Redux-based hook without breaking components

## Interface Segregation Principle (ISP)

Interfaces and props are focused and specific:

### SearchBar Props

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}
```

- Only contains props relevant to search input
- No unnecessary props or dependencies

### useSearch Return Value

```typescript
{
  searchParams: ServiceSearchParams;
  updateSearch: (updates, options?) => void;
  resetSearch: () => void;
  setFilter: (key, value) => void;
  isInitialized: boolean;
}
```

- Only exposes methods that clients actually need
- No unnecessary state or methods

## Dependency Inversion Principle (DIP)

High-level components depend on abstractions, not concrete implementations:

### ServicesClient Dependencies

- Depends on `useSearch` hook (abstraction)
- Depends on `useServices` hook (abstraction)
- Depends on component props interfaces, not concrete implementations

### Component Dependencies

- Components depend on prop interfaces, not concrete implementations
- Hooks depend on utility function interfaces, not implementations
- Example: `SearchBar` doesn't know about `useSearch` implementation

### Benefits

- Easy to mock dependencies for testing
- Easy to swap implementations
- Reduced coupling between components

## Example: Adding a New Filter

To add a new filter (e.g., "price range"):

1. **Add to ServiceSearchParams** (Open/Closed - extending interface):

```typescript
export interface ServiceSearchParams {
  // ... existing
  minPrice?: number;
  maxPrice?: number;
}
```

2. **Add to searchParams utilities** (Open/Closed - extending functions):

```typescript
if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
```

3. **Add to ServiceFilters** (Open/Closed - adding new field):

```typescript
<div>
  <label>Price Range</label>
  <Input
    value={localFilters.minPrice || ''}
    onChange={(e) => handleChange('minPrice', e.target.value)}
  />
</div>
```

4. **Add to ActiveFilters** (Open/Closed - adding new chip):

```typescript
if (filters.minPrice || filters.maxPrice) {
  activeFilters.push({
    key: 'minPrice',
    label: 'Price',
    value: `${filters.minPrice || 0} - ${filters.maxPrice || '∞'}`,
  });
}
```

No modification to existing components!

## Example: Adding a New Search Feature

1. **Create new component** (Open/Closed):

```typescript
export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  // Implementation
}
```

2. **Compose in ServicesClient** (Open/Closed):

```typescript
<AdvancedSearch onSearch={handleAdvancedSearch} />
```

3. **Extend useSearch if needed** (Open/Closed):

```typescript
const handleAdvancedSearch = useCallback(
  (criteria) => {
    updateSearch(criteria, { resetPage: true });
  },
  [updateSearch]
);
```

No modification to existing code!

## Testing Benefits

SOLID principles make testing easier:

- **Unit Tests**: Each component/hook can be tested in isolation
- **Mocking**: Dependencies are easily mockable via props/interfaces
- **Integration Tests**: Components can be tested together without full app setup

## Component Hierarchy

```
ServicesClient (Orchestrator)
├── SearchBar (Input UI)
├── ServiceFilters (Filter UI)
├── ActiveFilters (Active Filters Display)
└── ServiceCard[] (Results Display)
    └── useSearch (State Management)
        └── searchParams (URL Utilities)
```

Each level depends on abstractions from the level below, following DIP.

## Summary

The search functionality demonstrates all five SOLID principles:

- ✅ **S**ingle Responsibility: Each component/hook has one clear purpose
- ✅ **O**pen/Closed: Extensible without modification
- ✅ **L**iskov Substitution: Components are interchangeable
- ✅ **I**nterface Segregation: Focused, minimal interfaces
- ✅ **D**ependency Inversion: Depend on abstractions, not concretions
