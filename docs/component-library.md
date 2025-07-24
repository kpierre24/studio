# Component Library Documentation

## Overview

The ClassroomHQ component library provides a comprehensive set of enhanced UI components designed for accessibility, performance, and user experience. All components follow consistent design patterns and support theming, animations, and responsive design.

## Design Principles

- **Accessibility First**: All components meet WCAG AA standards
- **Performance Optimized**: Components use React.memo, useMemo, and useCallback where appropriate
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Theme Support**: Light/dark mode with smooth transitions
- **Animation Aware**: Respects user motion preferences

## Core Components

### Layout Components

#### Stack
Vertical layout component with consistent spacing.

```tsx
import { Stack } from '@/components/layout/Stack'

<Stack spacing="md" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

#### Inline
Horizontal layout component with flexible spacing.

```tsx
import { Inline } from '@/components/layout/Inline'

<Inline spacing="sm" align="center">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Inline>
```

#### Center
Centers content both horizontally and vertically.

```tsx
import { Center } from '@/components/layout/Center'

<Center>
  <div>Centered content</div>
</Center>
```

### Enhanced UI Components

#### Enhanced Button
Improved button component with loading states and animations.

```tsx
import { EnhancedButton } from '@/components/ui/enhanced-button'

<EnhancedButton
  variant="primary"
  size="md"
  isLoading={loading}
  onClick={handleClick}
>
  Submit
</EnhancedButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `disabled`: boolean

#### Enhanced Card
Card component with hover effects and interactive states.

```tsx
import { EnhancedCard } from '@/components/ui/enhanced-card'

<EnhancedCard
  title="Card Title"
  subtitle="Card subtitle"
  actions={<Button>Action</Button>}
  hover
>
  Card content
</EnhancedCard>
```

### Data Visualization Components

#### Trend Chart
Interactive chart component for displaying trends over time.

```tsx
import { TrendChart } from '@/components/ui/trend-chart'

<TrendChart
  data={chartData}
  height={300}
  showGrid
  color="primary"
/>
```

#### Progress Ring
Animated circular progress indicator.

```tsx
import { ProgressRing } from '@/components/ui/progress-ring'

<ProgressRing
  progress={75}
  size="lg"
  showLabel
  color="success"
/>
```

#### Activity Timeline
Chronological display of user activities.

```tsx
import { ActivityTimeline } from '@/components/ui/activity-timeline'

<ActivityTimeline
  activities={activities}
  maxItems={10}
  showTimestamps
/>
```

### Navigation Components

#### Breadcrumb Navigation
Dynamic breadcrumb navigation with routing integration.

```tsx
import { BreadcrumbNavigation } from '@/components/ui/breadcrumb-navigation'

<BreadcrumbNavigation
  items={breadcrumbItems}
  separator="/"
/>
```

#### Global Search
Real-time search with fuzzy matching and categorization.

```tsx
import { GlobalSearch } from '@/components/ui/global-search'

<GlobalSearch
  placeholder="Search courses, assignments..."
  onResultSelect={handleResultSelect}
  categories={['courses', 'assignments', 'users']}
/>
```

### Form Components

#### Mobile Input
Mobile-optimized input component with enhanced UX.

```tsx
import { MobileInput } from '@/components/ui/mobile-input'

<MobileInput
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  error={errors.email}
  required
/>
```

#### Mobile Form
Complete form wrapper with mobile optimizations.

```tsx
import { MobileForm } from '@/components/ui/mobile-form'

<MobileForm
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
>
  <MobileInput name="email" label="Email" />
  <MobileTextarea name="message" label="Message" />
</MobileForm>
```

### Content Management Components

#### Content Organizer
Drag-and-drop content organization interface.

```tsx
import { ContentOrganizer } from '@/components/ui/content-organizer'

<ContentOrganizer
  items={contentItems}
  onReorder={handleReorder}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### File Manager
Comprehensive file management with preview and organization.

```tsx
import { FileManager } from '@/components/ui/file-manager'

<FileManager
  files={files}
  onUpload={handleUpload}
  onDelete={handleDelete}
  showPreview
  allowMultiple
/>
```

### Accessibility Components

#### Accessibility Provider
Context provider for accessibility features.

```tsx
import { AccessibilityProvider } from '@/components/ui/accessibility-provider'

<AccessibilityProvider>
  <App />
</AccessibilityProvider>
```

#### Accessibility Controls
User controls for accessibility preferences.

```tsx
import { AccessibilityControls } from '@/components/ui/accessibility-controls'

<AccessibilityControls
  showFontSize
  showThemeToggle
  showMotionToggle
  showContrastToggle
/>
```

#### Color Contrast Checker
Tool for checking color contrast compliance.

```tsx
import { ColorContrastChecker } from '@/components/ui/color-contrast-checker'

<ColorContrastChecker
  onContrastChange={handleContrastChange}
/>
```

### Performance Components

#### Virtualized List
Performance-optimized list for large datasets.

```tsx
import { VirtualizedList } from '@/components/ui/virtualized-list'

<VirtualizedList
  items={largeDataset}
  itemHeight={60}
  renderItem={({ item, index }) => (
    <div key={index}>{item.name}</div>
  )}
/>
```

#### Optimized Image
Performance-optimized image component with WebP support.

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority
/>
```

### Animation Components

#### Page Transition
Smooth page transitions with motion preferences support.

```tsx
import { PageTransition } from '@/components/ui/page-transitions'

<PageTransition direction="fade">
  <PageContent />
</PageTransition>
```

#### Micro Animations
Collection of micro-interaction components.

```tsx
import { 
  AnimatedButton, 
  AnimatedCard, 
  LoadingDots 
} from '@/components/ui/micro-animations'

<AnimatedButton variant="gentle" isLoading={loading}>
  Click me
</AnimatedButton>
```

## Hooks

### useAnimations
Hook for managing animation states and preferences.

```tsx
import { useAnimations } from '@/hooks/useAnimations'

const { shouldAnimate, prefersReducedMotion } = useAnimations()
```

### useFocusManagement
Hook for managing keyboard focus and navigation.

```tsx
import { useFocusManagement } from '@/hooks/useFocusManagement'

const { focusElement, trapFocus, restoreFocus } = useFocusManagement()
```

### useErrorHandler
Hook for consistent error handling across components.

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler'

const { handleError, clearError, error } = useErrorHandler()
```

## Theming

### Theme Context
The enhanced theme system supports:

- Light/dark mode switching
- Font size adjustments (sm, md, lg)
- High contrast mode
- Reduced motion preferences

```tsx
import { useEnhancedTheme } from '@/contexts/ThemeContext'

const { 
  theme, 
  toggleMode, 
  increaseFontSize, 
  toggleHighContrast 
} = useEnhancedTheme()
```

### CSS Custom Properties
Theme values are available as CSS custom properties:

```css
.my-component {
  color: hsl(var(--primary));
  background: hsl(var(--background));
  font-size: var(--font-size-base);
}
```

## Performance Guidelines

### Component Optimization
- Use `React.memo` for expensive components
- Implement proper prop comparison functions
- Use `useMemo` and `useCallback` for expensive calculations
- Avoid inline object/function creation in render

### List Optimization
- Use `VirtualizedList` for lists with >100 items
- Implement proper `key` props
- Consider pagination for large datasets

### Image Optimization
- Use `OptimizedImage` component
- Implement lazy loading
- Use appropriate image formats (WebP, AVIF)

### Bundle Optimization
- Use dynamic imports for heavy components
- Implement code splitting at route level
- Monitor bundle size regularly

## Accessibility Guidelines

### ARIA Labels
All interactive components include appropriate ARIA labels:

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <X />
</button>
```

### Keyboard Navigation
Components support keyboard navigation:

```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={onClick}
>
  Interactive element
</div>
```

### Screen Reader Support
Use semantic HTML and provide context:

```tsx
<main id="main-content" role="main">
  <h1>Page Title</h1>
  <nav aria-label="Main navigation">
    {/* Navigation items */}
  </nav>
</main>
```

## Testing

### Component Testing
```tsx
import { render, screen } from '@testing-library/react'
import { EnhancedButton } from '@/components/ui/enhanced-button'

test('renders button with correct text', () => {
  render(<EnhancedButton>Click me</EnhancedButton>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})
```

### Accessibility Testing
```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Migration Guide

### From Basic Components
Replace basic components with enhanced versions:

```tsx
// Before
<button onClick={onClick}>Submit</button>

// After
<EnhancedButton onClick={onClick}>Submit</EnhancedButton>
```

### Adding Accessibility
Enhance existing components with accessibility features:

```tsx
// Before
<div onClick={onClick}>Interactive element</div>

// After
<div
  role="button"
  tabIndex={0}
  aria-label="Interactive element"
  onClick={onClick}
  onKeyDown={handleKeyDown}
>
  Interactive element
</div>
```

## Best Practices

1. **Always use semantic HTML** - Start with proper HTML elements
2. **Test with keyboard only** - Ensure all functionality is keyboard accessible
3. **Check color contrast** - Use the Color Contrast Checker component
4. **Respect motion preferences** - Use the animation system that respects user preferences
5. **Optimize for performance** - Use React.memo and virtualization where appropriate
6. **Write comprehensive tests** - Include accessibility tests in your test suite

## Support

For questions or issues with the component library:

1. Check this documentation
2. Review component source code in `/src/components/ui/`
3. Run accessibility tests: `npm run test:a11y`
4. Check performance: `npm run perf:monitor`
5. Contact the development team

---

This documentation is maintained alongside the component library. Please update it when adding or modifying components.