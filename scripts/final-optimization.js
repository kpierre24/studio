/**
 * Final optimization script that generates a comprehensive optimization report
 */

const fs = require('fs');
const path = require('path');

class OptimizationReporter {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      bundleOptimizations: {},
      imageOptimizations: {},
      performanceOptimizations: {},
      codeOptimizations: {},
      recommendations: []
    };
  }

  async generateReport() {
    console.log('🔧 Generating optimization report...\n');

    // Analyze bundle optimizations
    await this.analyzeBundleOptimizations();
    
    // Analyze image optimizations
    await this.analyzeImageOptimizations();
    
    // Analyze performance optimizations
    await this.analyzePerformanceOptimizations();
    
    // Analyze code optimizations
    await this.analyzeCodeOptimizations();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Save report
    this.saveReport();
    
    // Display summary
    this.displaySummary();
  }

  async analyzeBundleOptimizations() {
    const nextConfig = this.readNextConfig();
    const packageJson = this.readPackageJson();

    this.report.bundleOptimizations = {
      codeSplitting: this.checkCodeSplitting(nextConfig),
      treeShaking: this.checkTreeShaking(nextConfig),
      minification: this.checkMinification(nextConfig),
      compression: this.checkCompression(nextConfig),
      bundleAnalyzer: this.checkBundleAnalyzer(packageJson),
      optimizePackageImports: this.checkOptimizePackageImports(nextConfig),
      chunkSplitting: this.checkChunkSplitting(nextConfig)
    };
  }

  async analyzeImageOptimizations() {
    const nextConfig = this.readNextConfig();
    
    this.report.imageOptimizations = {
      webpSupport: this.checkWebPSupport(nextConfig),
      avifSupport: this.checkAVIFSupport(nextConfig),
      lazyLoading: this.checkLazyLoading(),
      responsiveImages: this.checkResponsiveImages(nextConfig),
      imageSizes: this.checkImageSizes(nextConfig),
      deviceSizes: this.checkDeviceSizes(nextConfig),
      optimizedImageComponent: this.checkOptimizedImageComponent()
    };
  }

  async analyzePerformanceOptimizations() {
    this.report.performanceOptimizations = {
      reactMemo: this.checkReactMemo(),
      virtualization: this.checkVirtualization(),
      debouncing: this.checkDebouncing(),
      throttling: this.checkThrottling(),
      performanceMonitoring: this.checkPerformanceMonitoring(),
      webVitals: this.checkWebVitals(),
      memoryOptimization: this.checkMemoryOptimization()
    };
  }

  async analyzeCodeOptimizations() {
    this.report.codeOptimizations = {
      dynamicImports: this.checkDynamicImports(),
      componentLazyLoading: this.checkComponentLazyLoading(),
      hookOptimizations: this.checkHookOptimizations(),
      eventHandlerOptimizations: this.checkEventHandlerOptimizations(),
      formOptimizations: this.checkFormOptimizations(),
      stateOptimizations: this.checkStateOptimizations()
    };
  }

  readNextConfig() {
    try {
      const configPath = path.join(process.cwd(), 'next.config.ts');
      if (fs.existsSync(configPath)) {
        return fs.readFileSync(configPath, 'utf8');
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  readPackageJson() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch (error) {
      return {};
    }
  }

  checkCodeSplitting(nextConfig) {
    return nextConfig.includes('splitChunks') || nextConfig.includes('chunks:');
  }

  checkTreeShaking(nextConfig) {
    return nextConfig.includes('sideEffects: false') || nextConfig.includes('usedExports');
  }

  checkMinification(nextConfig) {
    return nextConfig.includes('swcMinify: true') || nextConfig.includes('minimize: true');
  }

  checkCompression(nextConfig) {
    return nextConfig.includes('compress: true');
  }

  checkBundleAnalyzer(packageJson) {
    return packageJson.devDependencies && 
           packageJson.devDependencies['webpack-bundle-analyzer'];
  }

  checkOptimizePackageImports(nextConfig) {
    return nextConfig.includes('optimizePackageImports');
  }

  checkChunkSplitting(nextConfig) {
    return nextConfig.includes('cacheGroups') || nextConfig.includes('splitChunks');
  }

  checkWebPSupport(nextConfig) {
    return nextConfig.includes('image/webp') || nextConfig.includes('formats');
  }

  checkAVIFSupport(nextConfig) {
    return nextConfig.includes('image/avif');
  }

  checkLazyLoading() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'lazy') || 
           this.searchInDirectory(srcDir, 'useIntersectionObserver');
  }

  checkResponsiveImages(nextConfig) {
    return nextConfig.includes('sizes') || nextConfig.includes('deviceSizes');
  }

  checkImageSizes(nextConfig) {
    return nextConfig.includes('imageSizes');
  }

  checkDeviceSizes(nextConfig) {
    return nextConfig.includes('deviceSizes');
  }

  checkOptimizedImageComponent() {
    const componentPath = path.join(process.cwd(), 'src/components/ui/optimized-image.tsx');
    return fs.existsSync(componentPath);
  }

  checkReactMemo() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'React.memo') || 
           this.searchInDirectory(srcDir, 'memo');
  }

  checkVirtualization() {
    const virtualizationPath = path.join(process.cwd(), 'src/components/ui/virtualized-list.tsx');
    return fs.existsSync(virtualizationPath);
  }

  checkDebouncing() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'useDebounce') || 
           this.searchInDirectory(srcDir, 'debounce');
  }

  checkThrottling() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'useThrottle') || 
           this.searchInDirectory(srcDir, 'throttle');
  }

  checkPerformanceMonitoring() {
    const monitorPath = path.join(process.cwd(), 'src/components/ui/performance-monitor.tsx');
    return fs.existsSync(monitorPath);
  }

  checkWebVitals() {
    const packageJson = this.readPackageJson();
    return packageJson.dependencies && packageJson.dependencies['web-vitals'];
  }

  checkMemoryOptimization() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'useMemoryMonitor') || 
           this.searchInDirectory(srcDir, 'memory');
  }

  checkDynamicImports() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'import(') || 
           this.searchInDirectory(srcDir, 'dynamic');
  }

  checkComponentLazyLoading() {
    const lazyPath = path.join(process.cwd(), 'src/components/lazy/index.ts');
    return fs.existsSync(lazyPath);
  }

  checkHookOptimizations() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'useCallback') || 
           this.searchInDirectory(srcDir, 'useMemo');
  }

  checkEventHandlerOptimizations() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'createOptimizedEventHandler');
  }

  checkFormOptimizations() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'useOptimizedForm') || 
           this.searchInDirectory(srcDir, 'react-hook-form');
  }

  checkStateOptimizations() {
    const srcDir = path.join(process.cwd(), 'src');
    return this.searchInDirectory(srcDir, 'useDebouncedState') || 
           this.searchInDirectory(srcDir, 'useOptimized');
  }

  searchInDirectory(dir, searchTerm) {
    if (!fs.existsSync(dir)) return false;
    
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          if (this.searchInDirectory(fullPath, searchTerm)) {
            return true;
          }
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(searchTerm)) {
            return true;
          }
        }
      }
    } catch (error) {
      // Ignore errors and continue
    }
    
    return false;
  }

  generateRecommendations() {
    const recommendations = [];

    // Bundle optimization recommendations
    if (!this.report.bundleOptimizations.codeSplitting) {
      recommendations.push({
        category: 'Bundle',
        priority: 'High',
        title: 'Enable Code Splitting',
        description: 'Implement code splitting to reduce initial bundle size',
        implementation: 'Configure webpack splitChunks in next.config.js'
      });
    }

    if (!this.report.bundleOptimizations.minification) {
      recommendations.push({
        category: 'Bundle',
        priority: 'High',
        title: 'Enable Minification',
        description: 'Enable SWC minification for smaller bundle sizes',
        implementation: 'Add swcMinify: true to next.config.js'
      });
    }

    // Image optimization recommendations
    if (!this.report.imageOptimizations.webpSupport) {
      recommendations.push({
        category: 'Images',
        priority: 'Medium',
        title: 'Enable WebP Support',
        description: 'Use WebP format for better image compression',
        implementation: 'Configure image formats in next.config.js'
      });
    }

    if (!this.report.imageOptimizations.lazyLoading) {
      recommendations.push({
        category: 'Images',
        priority: 'Medium',
        title: 'Implement Lazy Loading',
        description: 'Load images only when they enter the viewport',
        implementation: 'Use intersection observer for lazy loading'
      });
    }

    // Performance optimization recommendations
    if (!this.report.performanceOptimizations.reactMemo) {
      recommendations.push({
        category: 'Performance',
        priority: 'High',
        title: 'Implement React.memo',
        description: 'Prevent unnecessary component re-renders',
        implementation: 'Wrap components with React.memo and use proper comparison functions'
      });
    }

    if (!this.report.performanceOptimizations.virtualization) {
      recommendations.push({
        category: 'Performance',
        priority: 'Medium',
        title: 'Add Virtualization',
        description: 'Virtualize large lists for better performance',
        implementation: 'Implement virtualized list components for large datasets'
      });
    }

    if (!this.report.performanceOptimizations.webVitals) {
      recommendations.push({
        category: 'Monitoring',
        priority: 'Medium',
        title: 'Add Web Vitals Monitoring',
        description: 'Monitor Core Web Vitals for performance insights',
        implementation: 'Install web-vitals package and implement monitoring'
      });
    }

    this.report.recommendations = recommendations;
  }

  saveReport() {
    const reportPath = path.join(process.cwd(), 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`📄 Optimization report saved to: ${reportPath}`);
  }

  displaySummary() {
    console.log('\n🎯 Optimization Summary\n');
    console.log('='.repeat(60));

    // Bundle optimizations
    console.log('\n📦 Bundle Optimizations:');
    Object.entries(this.report.bundleOptimizations).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      console.log(`  ${icon} ${this.formatKey(key)}`);
    });

    // Image optimizations
    console.log('\n🖼️  Image Optimizations:');
    Object.entries(this.report.imageOptimizations).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      console.log(`  ${icon} ${this.formatKey(key)}`);
    });

    // Performance optimizations
    console.log('\n⚡ Performance Optimizations:');
    Object.entries(this.report.performanceOptimizations).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      console.log(`  ${icon} ${this.formatKey(key)}`);
    });

    // Code optimizations
    console.log('\n🔧 Code Optimizations:');
    Object.entries(this.report.codeOptimizations).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      console.log(`  ${icon} ${this.formatKey(key)}`);
    });

    // Recommendations
    if (this.report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.report.recommendations.forEach((rec, index) => {
        const priorityIcon = rec.priority === 'High' ? '🔴' : 
                           rec.priority === 'Medium' ? '🟡' : '🟢';
        console.log(`  ${priorityIcon} ${rec.title} (${rec.category})`);
        console.log(`     ${rec.description}`);
      });
    }

    // Overall score
    const totalOptimizations = Object.keys({
      ...this.report.bundleOptimizations,
      ...this.report.imageOptimizations,
      ...this.report.performanceOptimizations,
      ...this.report.codeOptimizations
    }).length;

    const enabledOptimizations = Object.values({
      ...this.report.bundleOptimizations,
      ...this.report.imageOptimizations,
      ...this.report.performanceOptimizations,
      ...this.report.codeOptimizations
    }).filter(Boolean).length;

    const score = Math.round((enabledOptimizations / totalOptimizations) * 100);

    console.log('\n' + '='.repeat(60));
    console.log(`🏆 Optimization Score: ${score}% (${enabledOptimizations}/${totalOptimizations})`);

    if (score >= 80) {
      console.log('🎉 Excellent optimization level!');
    } else if (score >= 60) {
      console.log('👍 Good optimization level, room for improvement.');
    } else {
      console.log('⚠️  Consider implementing more optimizations.');
    }
  }

  formatKey(key) {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
  }
}

// Run the optimization reporter
if (require.main === module) {
  const reporter = new OptimizationReporter();
  reporter.generateReport().catch(error => {
    console.error('❌ Optimization report generation failed:', error);
    process.exit(1);
  });
}

module.exports = OptimizationReporter;