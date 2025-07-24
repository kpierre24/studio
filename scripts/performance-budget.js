/**
 * Performance budget monitoring script
 * Checks if the application meets performance budgets
 */

const fs = require('fs');
const path = require('path');

// Performance budgets (in milliseconds or bytes)
const PERFORMANCE_BUDGETS = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Loading metrics
  FCP: 1800, // First Contentful Paint
  TTFB: 800, // Time to First Byte
  
  // Bundle sizes (in KB)
  MAIN_BUNDLE: 300,
  VENDOR_BUNDLE: 600,
  TOTAL_JS: 900,
  
  // Memory usage (in MB)
  MEMORY_USAGE: 75,
  
  // Performance scores
  LIGHTHOUSE_PERFORMANCE: 85,
  LIGHTHOUSE_ACCESSIBILITY: 95,
  LIGHTHOUSE_BEST_PRACTICES: 90,
  LIGHTHOUSE_SEO: 90,
};

class PerformanceBudgetChecker {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async checkBudgets() {
    console.log('🔍 Checking performance budgets...\n');

    // Check bundle sizes
    await this.checkBundleSizes();
    
    // Check Lighthouse scores if available
    await this.checkLighthouseScores();
    
    // Check optimization report if available
    await this.checkOptimizationReport();
    
    // Generate report
    this.generateReport();
  }

  async checkBundleSizes() {
    const buildDir = path.join(process.cwd(), '.next');
    
    if (!fs.existsSync(buildDir)) {
      this.addResult('Bundle Analysis', 'SKIP', 'Build directory not found. Run npm run build first.');
      return;
    }

    try {
      // Check main bundle size
      const staticDir = path.join(buildDir, 'static', 'chunks');
      if (fs.existsSync(staticDir)) {
        const files = fs.readdirSync(staticDir);
        let totalSize = 0;
        let mainBundleSize = 0;
        let vendorBundleSize = 0;

        files.forEach(file => {
          if (file.endsWith('.js')) {
            const filePath = path.join(staticDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            totalSize += sizeKB;

            if (file.includes('main') || file.includes('pages')) {
              mainBundleSize += sizeKB;
            } else if (file.includes('vendor') || file.includes('framework')) {
              vendorBundleSize += sizeKB;
            }
          }
        });

        this.checkMetric('Main Bundle Size', mainBundleSize, PERFORMANCE_BUDGETS.MAIN_BUNDLE, 'KB');
        this.checkMetric('Vendor Bundle Size', vendorBundleSize, PERFORMANCE_BUDGETS.VENDOR_BUNDLE, 'KB');
        this.checkMetric('Total JS Size', totalSize, PERFORMANCE_BUDGETS.TOTAL_JS, 'KB');

        // Check for code splitting effectiveness
        const chunkCount = files.filter(f => f.endsWith('.js')).length;
        this.addResult('Code Splitting', chunkCount > 5 ? 'PASS' : 'WARN', 
          `${chunkCount} chunks (good splitting: >5)`);
      }
    } catch (error) {
      this.addResult('Bundle Analysis', 'ERROR', `Failed to analyze bundles: ${error.message}`);
    }
  }

  async checkLighthouseScores() {
    const lighthouseReportPath = path.join(process.cwd(), 'lighthouse-report.json');
    
    if (!fs.existsSync(lighthouseReportPath)) {
      this.addResult('Lighthouse Analysis', 'SKIP', 'Lighthouse report not found. Run npm run lighthouse first.');
      return;
    }

    try {
      const report = JSON.parse(fs.readFileSync(lighthouseReportPath, 'utf8'));
      const categories = report.categories;

      if (categories.performance) {
        this.checkMetric(
          'Lighthouse Performance',
          Math.round(categories.performance.score * 100),
          PERFORMANCE_BUDGETS.LIGHTHOUSE_PERFORMANCE,
          '%'
        );
      }

      if (categories.accessibility) {
        this.checkMetric(
          'Lighthouse Accessibility',
          Math.round(categories.accessibility.score * 100),
          PERFORMANCE_BUDGETS.LIGHTHOUSE_ACCESSIBILITY,
          '%'
        );
      }

      if (categories['best-practices']) {
        this.checkMetric(
          'Lighthouse Best Practices',
          Math.round(categories['best-practices'].score * 100),
          PERFORMANCE_BUDGETS.LIGHTHOUSE_BEST_PRACTICES,
          '%'
        );
      }

      if (categories.seo) {
        this.checkMetric(
          'Lighthouse SEO',
          Math.round(categories.seo.score * 100),
          PERFORMANCE_BUDGETS.LIGHTHOUSE_SEO,
          '%'
        );
      }

      // Check Core Web Vitals from Lighthouse
      const audits = report.audits;
      if (audits['largest-contentful-paint']) {
        this.checkMetric(
          'Largest Contentful Paint',
          Math.round(audits['largest-contentful-paint'].numericValue),
          PERFORMANCE_BUDGETS.LCP,
          'ms'
        );
      }

      if (audits['first-contentful-paint']) {
        this.checkMetric(
          'First Contentful Paint',
          Math.round(audits['first-contentful-paint'].numericValue),
          PERFORMANCE_BUDGETS.FCP,
          'ms'
        );
      }

      if (audits['cumulative-layout-shift']) {
        this.checkMetric(
          'Cumulative Layout Shift',
          parseFloat(audits['cumulative-layout-shift'].numericValue.toFixed(3)),
          PERFORMANCE_BUDGETS.CLS,
          ''
        );
      }

    } catch (error) {
      this.addResult('Lighthouse Analysis', 'ERROR', `Failed to parse Lighthouse report: ${error.message}`);
    }
  }

  async checkOptimizationReport() {
    const reportPath = path.join(process.cwd(), 'optimization-report.json');
    
    if (!fs.existsSync(reportPath)) {
      this.addResult('Optimization Report', 'SKIP', 'Optimization report not found.');
      return;
    }

    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      
      // Check optimization metrics
      if (report.bundleOptimizations) {
        const opts = report.bundleOptimizations;
        this.addResult('Tree Shaking', opts.treeShaking ? 'PASS' : 'FAIL', 
          opts.treeShaking ? 'Enabled' : 'Not enabled');
        this.addResult('Code Splitting', opts.codeSplitting ? 'PASS' : 'FAIL',
          opts.codeSplitting ? 'Enabled' : 'Not enabled');
        this.addResult('Minification', opts.minification ? 'PASS' : 'FAIL',
          opts.minification ? 'Enabled' : 'Not enabled');
      }

      if (report.imageOptimizations) {
        const imgOpts = report.imageOptimizations;
        this.addResult('Image Optimization', imgOpts.webpSupport ? 'PASS' : 'WARN',
          imgOpts.webpSupport ? 'WebP enabled' : 'WebP not enabled');
        this.addResult('Lazy Loading', imgOpts.lazyLoading ? 'PASS' : 'WARN',
          imgOpts.lazyLoading ? 'Enabled' : 'Not enabled');
      }

    } catch (error) {
      this.addResult('Optimization Report', 'ERROR', `Failed to parse optimization report: ${error.message}`);
    }
  }

  checkMetric(name, actual, budget, unit) {
    const passed = actual <= budget;
    const status = passed ? 'PASS' : 'FAIL';
    const message = `${actual}${unit} (budget: ${budget}${unit})`;
    
    this.addResult(name, status, message);
  }

  addResult(name, status, message) {
    this.results.push({ name, status, message });
    
    if (status === 'PASS') {
      this.passed++;
    } else if (status === 'FAIL') {
      this.failed++;
    }
  }

  generateReport() {
    console.log('\n📊 Performance Budget Report\n');
    console.log('='.repeat(70));

    // Group results by category
    const categories = {
      'Bundle Analysis': [],
      'Core Web Vitals': [],
      'Lighthouse Scores': [],
      'Optimizations': [],
      'Other': []
    };

    this.results.forEach(result => {
      if (result.name.includes('Bundle') || result.name.includes('JS Size') || result.name.includes('Code Splitting')) {
        categories['Bundle Analysis'].push(result);
      } else if (result.name.includes('Paint') || result.name.includes('Layout Shift')) {
        categories['Core Web Vitals'].push(result);
      } else if (result.name.includes('Lighthouse')) {
        categories['Lighthouse Scores'].push(result);
      } else if (result.name.includes('Optimization') || result.name.includes('Tree Shaking') || result.name.includes('Minification') || result.name.includes('Lazy Loading')) {
        categories['Optimizations'].push(result);
      } else {
        categories['Other'].push(result);
      }
    });

    Object.entries(categories).forEach(([category, results]) => {
      if (results.length > 0) {
        console.log(`\n📁 ${category}:`);
        results.forEach(result => {
          const icon = result.status === 'PASS' ? '✅' : 
                       result.status === 'FAIL' ? '❌' : 
                       result.status === 'SKIP' ? '⏭️' : 
                       result.status === 'WARN' ? '⚠️' : '⚠️';
          
          console.log(`  ${icon} ${result.name}: ${result.message}`);
        });
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log(`📈 Summary: ${this.passed} passed, ${this.failed} failed, ${this.results.length - this.passed - this.failed} skipped/warnings`);

    // Performance recommendations
    if (this.failed > 0) {
      console.log('\n💡 Performance Recommendations:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`  • ${result.name}: ${this.getRecommendation(result.name)}`);
      });
    }

    if (this.failed > 0) {
      console.log('\n🚨 Performance budget violations detected!');
      console.log('Consider optimizing the failing metrics before deployment.');
      process.exit(1);
    } else {
      console.log('\n🎉 All performance budgets are within limits!');
    }
  }

  getRecommendation(metricName) {
    const recommendations = {
      'Main Bundle Size': 'Use code splitting and dynamic imports',
      'Vendor Bundle Size': 'Optimize dependencies and use tree shaking',
      'Total JS Size': 'Enable compression and remove unused code',
      'Largest Contentful Paint': 'Optimize images and critical resources',
      'First Contentful Paint': 'Reduce server response time and eliminate render-blocking resources',
      'Cumulative Layout Shift': 'Reserve space for dynamic content and optimize font loading',
      'Lighthouse Performance': 'Focus on Core Web Vitals and resource optimization',
      'Lighthouse Accessibility': 'Add ARIA labels and improve keyboard navigation',
    };

    return recommendations[metricName] || 'Review and optimize this metric';
  }
}

// Run the performance budget check
if (require.main === module) {
  const checker = new PerformanceBudgetChecker();
  checker.checkBudgets().catch(error => {
    console.error('❌ Performance budget check failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceBudgetChecker;