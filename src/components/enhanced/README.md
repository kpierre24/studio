# Enhanced Component Library

This directory contains the enhanced UI components and design system for the ClassroomHQ application.

## Design System

The design system is built on consistent design tokens and patterns:

- **Spacing**: Consistent spacing scale from 0 to 32
- **Typography**: Hierarchical text sizing and weights
- **Colors**: Semantic color system with theme support
- **Animations**: Motion system with accessibility support
- **Layout**: Flexible layout components for consistent spacing

## Components

### Enhanced UI Components

#### EnhancedButton
Enhanced button component with loading states, icons, and animation support.

```tsx
import { EnhancedButton } from "@/components/enhanced"

<EnhancedButton 
  variant="default" 
  size="md" 
  loading={isLoading}
  leftIcon={<Icon />}
  animation="scale"
>
  Click me
</EnhancedButton>
```

**Props:**
- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "xl" | "icon"
- `animation`: "none" | "scale" | "lift" | "pulse"
- `loading`: boolean
- `loadingText`: string
- `leftIcon`, `rightIcon`: React.ReactNode
- `fullWidth`: boolean

#### EnhancedCard
Card component with hover effects and animation variants.

```tsx
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent } from "@/components/enhanced"

<EnhancedCard variant="elevated" interactive animation="lift">
  <EnhancedCardHeader>
    <EnhancedCardTitle>Card Title</EnhancedCardTitle>
  </EnhancedCardHeader>
  <EnhancedCardContent>
    Card content goes here
  </EnhancedCardContent>
</EnhancedCard>
```

**Props:**
- `variant`: "default" | "elevated" | "outlined" | "filled" | "interactive"
- `size`: "sm" | "default" | "lg"
- `animation`: "none" | "hover" | "lift" | "scale"
- `interactive`: boolean

### Layout Components

#### Stack
Vertical layout component with consistent spacing.

```tsx
import { Stack } from "@/components/enhanced"

<Stack spacing="md" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>
```

**Props:**
- `spacing`: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
- `align`: "start" | "center" | "end" | "stretch"
- `justify`: "start" | "center" | "end" | "between" | "around" | "evenly"

#### Inline
Horizontal layout component with wrapping support.

```tsx
import { Inline } from "@/components/enhanced"

<Inline spacing="sm" align="center" wrap="wrap">
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</Inline>
```

**Props:**
- `spacing`: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
- `align`: "start" | "center" | "end" | "baseline" | "stretch"
- `justify`: "start" | "center" | "end" | "between" | "around" | "evenly"
- `wrap`: "wrap" | "nowrap" | "reverse"

#### Center
Component for centering content with various options.

```tsx
import { Center } from "@/components/enhanced"

<Center minHeight="screen" textAlign="center">
  <h1>Centered Content</h1>
  <p>This content is perfectly centered</p>
</Center>
```

**Props:**
- `direction`: "row" | "column"
- `minHeight`: "none" | "screen" | "full" | "50vh" | "75vh"
- `textAlign`: "left" | "center" | "right"

## Animation System

The animation system is built on Framer Motion with accessibility support:

### Animation Variants
Pre-built animation variants for common patterns:
- `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `slideInUp`, `slideInDown`
- `staggerContainer`, `staggerItem`
- `pageTransition`

### Animation Hooks
- `useReducedMotion()`: Detects motion preferences
- `useMotionVariants()`: Returns motion-aware variants
- `useStaggerAnimation()`: Creates staggered animations
- `useHoverAnimation()`: Provides hover animations

### Usage Example
```tsx
import { motion } from "framer-motion"
import { fadeInUp, useMotionVariants } from "@/components/enhanced"

function MyComponent() {
  const { getVariants } = useMotionVariants()
  
  return (
    <motion.div
      variants={getVariants(fadeInUp)}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      Content with motion
    </motion.div>
  )
}
```

## Theme System

The enhanced theme system provides:
- Light/dark mode support
- Font size controls
- High contrast mode
- Reduced motion preferences
- Persistent settings

### Usage
```tsx
import { useEnhancedTheme } from "@/components/enhanced"

function MyComponent() {
  const { theme, setTheme, toggleMode } = useEnhancedTheme()
  
  return (
    <div>
      <p>Current theme: {theme.mode}</p>
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  )
}
```

## Best Practices

1. **Consistent Spacing**: Use the Stack and Inline components for consistent spacing
2. **Motion Accessibility**: Always use motion hooks to respect user preferences
3. **Semantic Colors**: Use semantic color names rather than specific colors
4. **Component Composition**: Build complex components by composing simpler ones
5. **Responsive Design**: Use responsive variants and breakpoints consistently

## Contributing

When adding new components:
1. Follow the existing naming conventions
2. Include proper TypeScript types
3. Add animation support where appropriate
4. Document props and usage examples
5. Test with reduced motion preferences
6. Ensure accessibility compliance