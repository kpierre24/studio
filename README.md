# ClassroomHQ - Enhanced Learning Management System

A modern, accessible, and feature-rich learning management system built with Next.js, featuring comprehensive UI/UX enhancements for an exceptional user experience.

## 🚀 Features

### Core Functionality
- **User Management**: Multi-role support (Super Admin, Teacher, Student)
- **Course Management**: Create, organize, and manage educational content
- **Assignment System**: Comprehensive assignment creation and submission workflow
- **Real-time Communication**: Integrated messaging and notifications
- **Progress Tracking**: Detailed analytics and progress visualization

### UI/UX Enhancements

#### 🎨 Modern Design System
- **Enhanced Theme Support**: Light/dark mode with smooth transitions
- **Responsive Design**: Mobile-first approach with optimized layouts
- **Component Library**: Comprehensive set of reusable UI components
- **Visual Hierarchy**: Improved typography and spacing scales
- **Micro-animations**: Smooth transitions and interactive feedback

#### 📊 Data Visualization
- **Interactive Charts**: Grade trends, progress tracking, and analytics
- **Progress Visualization**: Animated progress rings and completion indicators
- **Activity Timeline**: Chronological activity display with contextual information
- **Attendance Heatmaps**: Calendar-based attendance visualization
- **Performance Dashboards**: Role-specific dashboard widgets

#### 🔍 Enhanced Navigation
- **Global Search**: Real-time fuzzy search across all content types
- **Breadcrumb Navigation**: Dynamic path generation with quick navigation
- **Favorites System**: Bookmark and quick-access functionality
- **Recent Items**: Smart tracking of recently accessed content
- **Smart Filtering**: Advanced filtering and categorization

#### ♿ Accessibility Features
- **WCAG Compliance**: AA/AAA level accessibility standards
- **Screen Reader Support**: Comprehensive ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Color Contrast**: High contrast mode and color contrast checking
- **Motion Preferences**: Reduced motion support for sensitive users
- **Font Size Controls**: Adjustable text size and spacing options

#### ⚡ Performance Optimizations
- **Code Splitting**: Lazy loading and dynamic imports
- **Image Optimization**: WebP format with responsive sizing
- **Bundle Optimization**: Efficient chunk splitting and tree shaking
- **Virtualization**: Performance optimization for large lists
- **Memory Management**: Optimized component rendering and cleanup

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **Charts**: Recharts for data visualization
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with validation
- **Search**: Fuse.js for fuzzy search functionality
- **Testing**: Jest with React Testing Library
- **Performance**: Lighthouse and custom monitoring tools

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd classroomhq
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
# Configure your environment variables
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:9002](http://localhost:9002) in your browser.

## 📚 Documentation

### Component Library
The enhanced component library includes:

- **Layout Components**: Stack, Inline, Center for consistent spacing
- **Interactive Elements**: Enhanced buttons, forms, and inputs
- **Data Display**: Charts, tables, and visualization components
- **Navigation**: Breadcrumbs, search, and menu components
- **Feedback**: Notifications, loading states, and error handling
- **Accessibility**: Screen reader support and keyboard navigation

### Performance Monitoring
Monitor application performance with built-in tools:

```bash
# Run Lighthouse audit
npm run lighthouse

# Performance monitoring
npm run perf:monitor

# Bundle analysis
npm run analyze
```

### Accessibility Testing
Ensure accessibility compliance:

```bash
# Run accessibility tests
npm run test:a11y

# Check color contrast
# Use the built-in Color Contrast Checker component
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Accessibility tests
npm run test:a11y
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run lighthouse` - Run Lighthouse performance audit
- `npm run perf:monitor` - Monitor runtime performance
- `npm run analyze` - Analyze bundle size

## 📱 Mobile Support

ClassroomHQ is designed with mobile-first principles:

- **Touch-optimized**: Appropriate touch targets and gestures
- **Responsive Layouts**: Adaptive layouts for all screen sizes
- **Mobile Navigation**: Bottom tabs and hamburger menu patterns
- **Optimized Forms**: Mobile keyboard optimization
- **Performance**: Optimized for mobile networks and devices

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain accessibility standards (WCAG AA)
- Write comprehensive tests
- Use semantic commit messages
- Ensure responsive design
- Optimize for performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Charts by [Recharts](https://recharts.org/)
- Icons from [Lucide React](https://lucide.dev/)

---

For more information, please refer to the [documentation](./docs) or contact the development team.
