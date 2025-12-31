# Responsive UI Guidelines

## Overview

This project follows a **mobile-first responsive design approach**. All components and pages must be fully responsive and work seamlessly across all device sizes.

## Design Principles

### 1. Mobile-First Approach

- Design for mobile devices first (320px - 768px)
- Then enhance for tablets (768px - 1024px)
- Finally optimize for desktop (1024px+)

### 2. Breakpoints

We use Tailwind CSS default breakpoints:

```css
sm:  640px   /* Small devices (landscape phones) */
md:  768px   /* Medium devices (tablets) */
lg:  1024px  /* Large devices (desktops) */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X Extra large devices */
```

### 3. Responsive Patterns

#### Grid Layouts

```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

#### Flexbox Layouts

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
```

#### Text Sizing

```tsx
// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

#### Spacing

```tsx
// Responsive padding/margins
<div className="p-4 md:p-6 lg:p-8">
```

## Component Requirements

### All Components Must:

1. **Be Mobile-Friendly**
   - Touch targets minimum 44x44px
   - Adequate spacing between interactive elements
   - Readable text sizes (minimum 16px on mobile)

2. **Adapt to Screen Size**
   - Use responsive grid/flex layouts
   - Hide/show elements based on screen size
   - Adjust font sizes appropriately

3. **Handle Orientation Changes**
   - Work in both portrait and landscape
   - Adjust layouts accordingly

4. **Support Touch Interactions**
   - Large enough buttons/links
   - Swipe gestures where appropriate
   - No hover-only interactions

## Common Responsive Patterns

### Navigation

- Mobile: Hamburger menu
- Desktop: Horizontal navigation bar

### Cards

- Mobile: Full width, stacked
- Tablet: 2 columns
- Desktop: 3-4 columns

### Forms

- Mobile: Full width inputs
- Desktop: Constrained width with max-width

### Tables

- Mobile: Card-based layout or horizontal scroll
- Desktop: Full table layout

### Modals/Dialogs

- Mobile: Full screen or bottom sheet
- Desktop: Centered modal with max-width

### Images

- Use Next.js Image component with responsive sizes
- Proper aspect ratios
- Lazy loading for performance

## Testing Checklist

Before deploying, test on:

- [ ] Mobile phones (320px - 480px)
- [ ] Large phones (481px - 768px)
- [ ] Tablets (769px - 1024px)
- [ ] Small desktops (1025px - 1280px)
- [ ] Large desktops (1281px+)
- [ ] Landscape orientation
- [ ] Portrait orientation

## Tools

- **Browser DevTools**: Use responsive design mode
- **Chrome DevTools**: Device toolbar (Ctrl+Shift+M)
- **Firefox DevTools**: Responsive Design Mode
- **Real Devices**: Test on actual phones/tablets when possible

## Best Practices

1. **Use Tailwind's Responsive Prefixes**
   - `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
   - Always mobile-first (base styles for mobile)

2. **Container Queries** (when supported)
   - Use for component-level responsiveness

3. **Flexible Units**
   - Prefer `rem`/`em` over `px` for typography
   - Use percentage/`vw`/`vh` for layouts

4. **Avoid Fixed Widths**
   - Use `max-width` instead of fixed `width`
   - Use `min-width` for minimum sizes

5. **Responsive Images**
   - Use Next.js `Image` component
   - Provide multiple sizes via `sizes` prop
   - Use appropriate image formats (WebP, AVIF)

6. **Touch-Friendly**
   - Minimum 44x44px touch targets
   - Adequate spacing (minimum 8px between elements)

7. **Readable Text**
   - Minimum 16px font size on mobile
   - Line height 1.5-1.6 for readability
   - Adequate contrast ratios (WCAG AA minimum)

## Examples

### Responsive Card Grid

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

### Responsive Navigation

```tsx
{
  /* Mobile: Hamburger menu */
}
<button className="lg:hidden">Menu</button>;

{
  /* Desktop: Full navigation */
}
<nav className="hidden gap-4 lg:flex">
  <Link href="/">Home</Link>
  <Link href="/services">Services</Link>
</nav>;
```

### Responsive Typography

```tsx
<h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">Title</h1>
```

### Responsive Container

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">{/* Content */}</div>
```

## Accessibility in Responsive Design

1. **Focus Management**
   - Visible focus indicators on all interactive elements
   - Logical tab order

2. **Screen Reader Support**
   - Proper ARIA labels
   - Semantic HTML

3. **Color Contrast**
   - Maintain contrast ratios across all screen sizes
   - Don't rely solely on color for information

4. **Text Scaling**
   - Support browser text scaling (up to 200%)
   - Use relative units (rem, em)

---

**Last Updated**: 2025-01-29
**Status**: ✅ Active Guidelines
