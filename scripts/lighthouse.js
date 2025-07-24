#!/usr/bin/env node

/**
 * Lighthouse performance testing script for ClassroomHQ
 * Runs Lighthouse audits and generates performance reports
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

class LighthouseRunner {
  constructor() {
    this.config = {
      extends: 'lighthouse:default',
      settings: {
        onlyAudits: [
          'first-contentful-paint',
          'largest-contentful-paint',
          'first-meaningful-paint',
          'speed-index',
          'interactive',
          'cumulative-layout-shift',
          'total-blocking-time',
          'unused-javascript',
          'unused-css-rules',
          'render-blocking-resources',
          'uses-webp-images',
          'uses-optimized-images',
          'uses-text-compression',
          'uses-responsive-images',
        ],
      },
    };

    this.urls = [
      'http://localhost:9002',
      'http://localhost:9002/dashboard',
      'http://localhost:9002/courses',
      'http://localhost:9002/assignments',
    ];

    this.thresholds = {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 80,
      pwa: 80,
    };
  }

  async launchChrome() {
    console.log('🚀 Launching Chrome...');
    return await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    });
  }

  async runAudit(url, chrome) {
    console.log(`🔍 Running Lighthouse audit for: ${url}`);
    
    try {
      const runnerResult = await lighthouse(url, {
        port: chrome.port,
        disableDeviceEmulation: true,
        chromeFlags: ['--disable-mobile-emulation'],
      }, this.config);

      return {
        url,
        lhr: runnerResult.lhr,
        report: runnerResult.report,
      };
    } catch (error) {
      console.error(`❌ Error running audit for ${url}:`, error.message);
      return null;
    }
  }

  analyzeResults(results) {
    console.log('\n📊 Analyzing Lighthouse results...\n');

    const summary = {
      urls: [],
      overall: {
        performance: 0,
        accessibility: 0,
        'best-practices': 0,
        seo: 0,
        pwa: 0,
      },
      issues: [],
      recommendations: [],
    };

    results.forEach(result => {
      if (!result) return;

      const { url, lhr } = result;
      const scores = {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        pwa: lhr.categories.pwa ? Math.round(lhr.categories.pwa.score * 100) : 0,
      };

      console.log(`📄 ${url}:`);
      console.log(`   Performance: ${scores.performance}/100`);
      console.log(`   Accessibility: ${scores.accessibility}/100`);
      console.log(`   Best Practices: ${scores['best-practices']}/100`);
      console.log(`   SEO: ${scores.seo}/100`);
      if (scores.pwa > 0) {
        console.log(`   PWA: ${scores.pwa}/100`);
      }

      // Check thresholds
      Object.entries(scores).forEach(([category, score]) => {
        if (score < this.thresholds[category]) {
          summary.issues.push({
            url,
            category,
            score,
            threshold: this.thresholds[category],
          });
        }
      });

      // Core Web Vitals
      const audits = lhr.audits;
      const coreWebVitals = {
        LCP: audits['largest-contentful-paint']?.numericValue,
        FID: audits['max-potential-fid']?.numericValue,
        CLS: audits['cumulative-layout-shift']?.numericValue,
      };

      console.log(`   Core Web Vitals:`);
      console.log(`     LCP: ${coreWebVitals.LCP ? (coreWebVitals.LCP / 1000).toFixed(2) + 's' : 'N/A'}`);
      console.log(`     FID: ${coreWebVitals.FID ? coreWebVitals.FID.toFixed(2) + 'ms' : 'N/A'}`);
      console.log(`     CLS: ${coreWebVitals.CLS ? coreWebVitals.CLS.toFixed(3) : 'N/A'}`);
      console.log('');

      summary.urls.push({
        url,
        scores,
        coreWebVitals,
      });

      // Update overall scores
      Object.keys(summary.overall).forEach(category => {
        summary.overall[category] += scores[category];
      });
    });

    // Calculate averages
    const validResults = results.filter(r => r !== null).length;
    Object.keys(summary.overall).forEach(category => {
      summary.overall[category] = Math.round(summary.overall[category] / validResults);
    });

    return summary;
  }

  generateRecommendations(summary) {
    console.log('💡 Performance Recommendations:\n');

    const recommendations = [];

    // Performance recommendations
    if (summary.overall.performance < this.thresholds.performance) {
      recommendations.push('Optimize images with WebP format and proper sizing');
      recommendations.push('Implement code splitting for better bundle optimization');
      recommendations.push('Use React.memo for expensive components');
      recommendations.push('Enable text compression (gzip/brotli)');
    }

    // Accessibility recommendations
    if (summary.overall.accessibility < this.thresholds.accessibility) {
      recommendations.push('Add proper ARIA labels and semantic HTML');
      recommendations.push('Ensure sufficient color contrast ratios');
      recommendations.push('Implement keyboard navigation support');
    }

    // Best practices recommendations
    if (summary.overall['best-practices'] < this.thresholds['best-practices']) {
      recommendations.push('Remove unused JavaScript and CSS');
      recommendations.push('Use HTTPS for all resources');
      recommendations.push('Optimize third-party scripts');
    }

    if (recommendations.length === 0) {
      console.log('✅ No major performance issues detected!');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    return recommendations;
  }

  async saveReports(results) {
    const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    for (const result of results) {
      if (!result) continue;

      const urlSlug = result.url.replace(/[^a-zA-Z0-9]/g, '-');
      const reportPath = path.join(reportsDir, `${urlSlug}-${timestamp}.html`);
      
      fs.writeFileSync(reportPath, result.report);
      console.log(`📄 Report saved: ${reportPath}`);
    }
  }

  async run() {
    console.log('🚀 Starting Lighthouse Performance Testing\n');

    let chrome;
    try {
      chrome = await this.launchChrome();
      
      const results = [];
      for (const url of this.urls) {
        const result = await this.runAudit(url, chrome);
        if (result) {
          results.push(result);
        }
      }

      if (results.length === 0) {
        console.log('❌ No successful audits completed');
        return;
      }

      const summary = this.analyzeResults(results);
      const recommendations = this.generateRecommendations(summary);

      // Save detailed reports
      await this.saveReports(results);

      // Save summary
      const summaryPath = path.join(process.cwd(), 'lighthouse-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary,
        recommendations,
      }, null, 2));

      console.log(`\n📊 Summary saved: ${summaryPath}`);
      console.log('\n✨ Lighthouse testing complete!');

    } catch (error) {
      console.error('❌ Error running Lighthouse:', error);
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:9002');
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Development server is not running on http://localhost:9002');
    console.log('Please start the server with: npm run dev');
    process.exit(1);
  }

  const runner = new LighthouseRunner();
  await runner.run();
}

main().catch(console.error);