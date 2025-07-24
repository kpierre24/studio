/**
 * Design System Configuration
 * Centralized design tokens and system configuration
 */

// Spacing scale (in rem)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const

// Typography scale
export const typography = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const

// Border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// Shadow scale
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Animation durations
export const durations = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
} as const

// Component size variants
export const sizes = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const

// Color semantic meanings
export const colorSemantics = {
  primary: 'Primary brand color for main actions',
  secondary: 'Secondary color for supporting elements',
  accent: 'Accent color for highlights and emphasis',
  muted: 'Muted color for less important content',
  destructive: 'Color for destructive actions and errors',
  warning: 'Color for warnings and cautions',
  success: 'Color for success states and confirmations',
  info: 'Color for informational content',
} as const

// Component variants
export const variants = {
  button: {
    default: 'Primary button style',
    destructive: 'Destructive action button',
    outline: 'Outlined button variant',
    secondary: 'Secondary button style',
    ghost: 'Minimal button style',
    link: 'Link-styled button',
  },
  card: {
    default: 'Standard card with border',
    elevated: 'Card with shadow elevation',
    outlined: 'Card with prominent border',
    filled: 'Card with background fill',
  },
  input: {
    default: 'Standard input field',
    filled: 'Filled input variant',
    outlined: 'Outlined input variant',
    underlined: 'Underlined input variant',
  },
} as const

// Accessibility guidelines
export const a11y = {
  minTouchTarget: '44px', // Minimum touch target size
  minColorContrast: 4.5,  // WCAG AA contrast ratio
  focusRingWidth: '2px',  // Focus ring thickness
  animationDuration: {
    max: '500ms',         // Maximum animation duration
    reduced: '0.01ms',    // Duration for reduced motion
  },
} as const

// Component composition patterns
export const patterns = {
  stack: 'Vertical spacing between elements',
  inline: 'Horizontal spacing between elements',
  grid: 'Grid-based layout system',
  cluster: 'Grouped elements with consistent spacing',
  sidebar: 'Sidebar layout pattern',
  switcher: 'Responsive layout switching',
  cover: 'Full-height cover layout',
  center: 'Centered content layout',
} as const