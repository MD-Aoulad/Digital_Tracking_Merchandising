#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutomatedTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: []
      },
      details: {
        unit: { passed: 0, failed: 0, errors: [] },
        integration: { passed: 0, failed: 0, errors: [] },
        e2e: { passed: 0, failed: 0, errors: [] },
        api: { passed: 0, failed: 0, errors: [] },
        performance: { passed: 0, failed: 0, errors: [] },
        security: { passed: 0, failed: 0, errors: [] }
      },
      system: {
        backend: { status: 'unknown', errors: [] },
        frontend: { status: 'unknown', errors: [] },
        mobile: { status: 'unknown', errors: [] }
      },
      recommendations: []
    };
    
    this.timeouts = {
      unit: 30000,      // 30 seconds
      integration: 60000, // 1 minute
      e2e: 120000,      // 2 minutes
      api: 45000,       // 45 seconds
      performance: 90000, // 1.5 minutes
      security: 60000   // 1 minute
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Automated Test Runner...');
    console.log('⏰ Timestamp:', this.results.timestamp);
    console.log('='.repeat(60));

    try {
      // 1. System Health Check
      await this.checkSystemHealth();
      
      // 2. Backend Tests
      await this.runBackendTests();
      
      // 3. Frontend Tests
      await this.runFrontendTests();
      
      // 4. Mobile Tests
      await this.runMobileTests();
      
      // 5. Integration Tests
      await this.runIntegrationTests();
      
      // 6. E2E Tests
      await this.runE2ETests();
      
      // 7. Performance Tests
      await this.runPerformanceTests();
      
      // 8. Security Tests
      await this.runSecurityTests();
      
      // 9. Generate Report
      await this.generateReport();
      
      // 10. Cleanup
      await this.cleanup();
      
    } catch (error) {
      console.error('❌ Critical error in test runner:', error.message);
      this.results.summary.errors.push({
        type: 'CRITICAL',
        message: error.message,
        stack: error.stack
      });
      await this.generateReport();
    }
  }

  async checkSystemHealth() {
    console.log('🔍 Checking system health...');
    
    // Check if backend can start
    try {
      const backendHealth = await this.runWithTimeout(
        'cd backend && npm start',
        10000,
        'Backend health check'
      );
      this.results.system.backend.status = backendHealth.success ? 'healthy' : 'unhealthy';
      if (!backendHealth.success) {
        this.results.system.backend.errors.push(backendHealth.error);
      }
    } catch (error) {
      this.results.system.backend.status = 'error';
      this.results.system.backend.errors.push(error.message);
    }

    // Check if frontend can compile
    try {
      const frontendHealth = await this.runWithTimeout(
        'npm run build',
        15000,
        'Frontend health check'
      );
      this.results.system.frontend.status = frontendHealth.success ? 'healthy' : 'unhealthy';
      if (!frontendHealth.success) {
        this.results.system.frontend.errors.push(frontendHealth.error);
      }
    } catch (error) {
      this.results.system.frontend.status = 'error';
      this.results.system.frontend.errors.push(error.message);
    }
  }

  async runBackendTests() {
    console.log('🧪 Running Backend Tests...');
    
    const testTypes = [
      { name: 'unit', script: 'test:unit', timeout: this.timeouts.unit },
      { name: 'integration', script: 'test:integration', timeout: this.timeouts.integration },
      { name: 'api', script: 'test:api', timeout: this.timeouts.api },
      { name: 'performance', script: 'test:performance', timeout: this.timeouts.performance },
      { name: 'security', script: 'test:security', timeout: this.timeouts.security }
    ];

    for (const testType of testTypes) {
      try {
        console.log(`⏱️  Running: Backend ${testType.name} tests (timeout: ${testType.timeout}ms)`);
        const result = await this.runWithTimeout(
          `cd backend && npm run ${testType.script}`,
          testType.timeout,
          `Backend ${testType.name} tests`
        );
        
        this.results.details[testType.name] = {
          passed: result.exitCode === 0 ? 1 : 0,
          failed: result.exitCode !== 0 ? 1 : 0,
          errors: result.exitCode !== 0 ? [result.output] : []
        };
      } catch (error) {
        console.log(`❌ Backend ${testType.name} tests - FAILED (code: ${error.code})`);
        this.results.details[testType.name] = {
          passed: 0,
          failed: 1,
          errors: [error.message]
        };
      }
    }
  }

  async runFrontendTests() {
    console.log('🧪 Running Frontend Tests...');
    
    const testTypes = [
      { name: 'unit', pattern: '**/*.test.{ts,tsx}', timeout: this.timeouts.unit },
      { name: 'integration', pattern: '**/integration/*.test.{ts,tsx}', timeout: this.timeouts.integration }
    ];

    for (const testType of testTypes) {
      try {
        const result = await this.runWithTimeout(
          `npm test -- --testPathPattern="${testType.pattern}" --verbose --no-coverage --watchAll=false --passWithNoTests`,
          testType.timeout,
          `Frontend ${testType.name} tests`
        );

        if (result.success) {
          this.results.details[testType.name].passed++;
          this.results.summary.passed++;
        } else {
          this.results.details[testType.name].failed++;
          this.results.summary.failed++;
          this.results.details[testType.name].errors.push(result.error);
        }
        this.results.summary.total++;
        
      } catch (error) {
        this.results.details[testType.name].failed++;
        this.results.summary.failed++;
        this.results.summary.total++;
        this.results.details[testType.name].errors.push(error.message);
      }
    }
  }

  async runMobileTests() {
    console.log('🧪 Running Mobile Tests...');
    
    const mobileApps = [
      { name: 'mobile', path: 'mobile' },
      { name: 'WorkforceMobileApp', path: 'WorkforceMobileApp' },
      { name: 'WorkforceMobileExpo', path: 'WorkforceMobileExpo' }
    ];

    for (const app of mobileApps) {
      try {
        console.log(`⏱️  Running: Mobile ${app.name} tests (timeout: ${this.timeouts.unit}ms)`);
        const result = await this.runWithTimeout(
          `cd ${app.path} && npm test`,
          this.timeouts.unit,
          `Mobile ${app.name} tests`
        );
        
        if (result.success) {
          this.results.details.unit.passed++;
          this.results.summary.passed++;
        } else {
          this.results.details.unit.failed++;
          this.results.summary.failed++;
          this.results.details.unit.errors.push(result.error);
        }
        this.results.summary.total++;
        
      } catch (error) {
        console.log(`❌ Mobile ${app.name} tests - FAILED (code: ${error.code})`);
        this.results.details.unit.failed++;
        this.results.summary.failed++;
        this.results.summary.total++;
        this.results.details.unit.errors.push(error.message);
      }
    }
  }

  async runIntegrationTests() {
    console.log('🧪 Running Integration Tests...');
    
    try {
      console.log(`⏱️  Running: Integration tests (timeout: ${this.timeouts.integration}ms)`);
      const result = await this.runWithTimeout(
        'npm run test:integration',
        this.timeouts.integration,
        'Integration tests'
      );
      
      if (result.success) {
        this.results.details.integration.passed++;
        this.results.summary.passed++;
      } else {
        this.results.details.integration.failed++;
        this.results.summary.failed++;
        this.results.details.integration.errors.push(result.error);
      }
      this.results.summary.total++;
      
    } catch (error) {
      console.log(`❌ Integration tests - FAILED (code: ${error.code})`);
      this.results.details.integration.failed++;
      this.results.summary.failed++;
      this.results.summary.total++;
      this.results.details.integration.errors.push(error.message);
    }
  }

  async runE2ETests() {
    console.log('🧪 Running E2E Tests...');
    
    try {
      console.log(`⏱️  Running: E2E tests (timeout: ${this.timeouts.e2e}ms)`);
      const result = await this.runWithTimeout(
        'npm run test:e2e',
        this.timeouts.e2e,
        'E2E tests'
      );
      
      if (result.success) {
        this.results.details.e2e.passed++;
        this.results.summary.passed++;
      } else {
        this.results.details.e2e.failed++;
        this.results.summary.failed++;
        this.results.details.e2e.errors.push(result.error);
      }
      this.results.summary.total++;
      
    } catch (error) {
      console.log(`❌ E2E tests - FAILED (code: ${error.code})`);
      this.results.details.e2e.failed++;
      this.results.summary.failed++;
      this.results.summary.total++;
      this.results.details.e2e.errors.push(error.message);
    }
  }

  async runPerformanceTests() {
    console.log('🧪 Running Performance Tests...');
    
    try {
      console.log(`⏱️  Running: Performance tests (timeout: ${this.timeouts.performance}ms)`);
      const result = await this.runWithTimeout(
        'npm run test:performance',
        this.timeouts.performance,
        'Performance tests'
      );
      
      if (result.success) {
        this.results.details.performance.passed++;
        this.results.summary.passed++;
      } else {
        this.results.details.performance.failed++;
        this.results.summary.failed++;
        this.results.details.performance.errors.push(result.error);
      }
      this.results.summary.total++;
      
    } catch (error) {
      console.log(`❌ Performance tests - FAILED (code: ${error.code})`);
      this.results.details.performance.failed++;
      this.results.summary.failed++;
      this.results.summary.total++;
      this.results.details.performance.errors.push(error.message);
    }
  }

  async runSecurityTests() {
    console.log('🧪 Running Security Tests...');
    
    try {
      console.log(`⏱️  Running: Security tests (timeout: ${this.timeouts.security}ms)`);
      const result = await this.runWithTimeout(
        'npm run test:security',
        this.timeouts.security,
        'Security tests'
      );
      
      if (result.success) {
        this.results.details.security.passed++;
        this.results.summary.passed++;
      } else {
        this.results.details.security.failed++;
        this.results.summary.failed++;
        this.results.details.security.errors.push(result.error);
      }
      this.results.summary.total++;
      
    } catch (error) {
      console.log(`❌ Security tests - FAILED (code: ${error.code})`);
      this.results.details.security.failed++;
      this.results.summary.failed++;
      this.results.summary.total++;
      this.results.details.security.errors.push(error.message);
    }
  }

  async runWithTimeout(command, timeout, description) {
    return new Promise((resolve) => {
      console.log(`⏱️  Running: ${description} (timeout: ${timeout}ms)`);
      
      const child = exec(command, {
        cwd: process.cwd(),
        timeout: timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${description} - PASSED`);
          resolve({ success: true, output, errorOutput });
        } else {
          console.log(`❌ ${description} - FAILED (code: ${code})`);
          resolve({ 
            success: false, 
            error: `Exit code: ${code}\nOutput: ${output}\nError: ${errorOutput}`,
            output,
            errorOutput
          });
        }
      });

      child.on('error', (error) => {
        console.log(`💥 ${description} - ERROR: ${error.message}`);
        resolve({ 
          success: false, 
          error: error.message,
          output,
          errorOutput
        });
      });

      // Force kill if timeout
      setTimeout(() => {
        if (child.pid) {
          console.log(`⏰ ${description} - TIMEOUT, killing process`);
          child.kill('SIGKILL');
          resolve({ 
            success: false, 
            error: `Timeout after ${timeout}ms`,
            output,
            errorOutput
          });
        }
      }, timeout);
    });
  }

  generateRecommendations() {
    const recommendations = [];

    // System health recommendations
    if (this.results.system.backend.status !== 'healthy') {
      recommendations.push({
        priority: 'HIGH',
        category: 'SYSTEM',
        message: 'Backend system is unhealthy - check server configuration and dependencies',
        action: 'Review backend logs and ensure all dependencies are installed'
      });
    }

    if (this.results.system.frontend.status !== 'healthy') {
      recommendations.push({
        priority: 'HIGH',
        category: 'SYSTEM',
        message: 'Frontend compilation issues detected',
        action: 'Check TypeScript compilation errors and missing dependencies'
      });
    }

    // Test failure recommendations
    Object.entries(this.results.details).forEach(([testType, details]) => {
      if (details.failed > 0) {
        recommendations.push({
          priority: details.failed > 5 ? 'HIGH' : 'MEDIUM',
          category: 'TESTING',
          message: `${testType} tests have ${details.failed} failures`,
          action: `Review ${testType} test failures and fix implementation issues`,
          details: details.errors.slice(0, 3) // Show first 3 errors
        });
      }
    });

    // Performance recommendations
    if (this.results.details.performance.failed > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'PERFORMANCE',
        message: 'Performance tests are failing',
        action: 'Optimize application performance and review bottlenecks'
      });
    }

    // Security recommendations
    if (this.results.details.security.failed > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'SECURITY',
        message: 'Security tests are failing',
        action: 'Address security vulnerabilities immediately'
      });
    }

    this.results.recommendations = recommendations;
  }

  async generateReport() {
    console.log('📊 Generating Test Report...');
    
    this.generateRecommendations();
    
    const reportPath = path.join(process.cwd(), 'test-report-automated.json');
    const htmlReportPath = path.join(process.cwd(), 'test-report-automated.html');
    
    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⏭️  Skipped: ${this.results.summary.skipped}`);
    console.log(`💥 Errors: ${this.results.summary.errors.length}`);
    
    console.log('\n📊 DETAILED RESULTS:');
    Object.entries(this.results.details).forEach(([testType, details]) => {
      console.log(`${testType.toUpperCase()}: ${details.passed} passed, ${details.failed} failed`);
    });
    
    console.log('\n🔧 SYSTEM STATUS:');
    Object.entries(this.results.system).forEach(([system, status]) => {
      console.log(`${system.toUpperCase()}: ${status.status}`);
    });
    
    console.log('\n🎯 RECOMMENDATIONS:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.message}`);
    });
    
    console.log('\n📁 Reports saved to:');
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
    
    console.log('\n🚀 Automated Test Runner completed successfully!');
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automated Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { padding: 20px; border-radius: 8px; text-align: center; color: white; }
        .total { background: #3498db; }
        .passed { background: #27ae60; }
        .failed { background: #e74c3c; }
        .errors { background: #f39c12; }
        .details { margin-bottom: 30px; }
        .test-type { margin-bottom: 20px; }
        .test-type h3 { color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px; }
        .recommendations { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .recommendation { margin-bottom: 15px; padding: 10px; border-left: 4px solid #3498db; background: white; }
        .priority-high { border-left-color: #e74c3c; }
        .priority-medium { border-left-color: #f39c12; }
        .priority-low { border-left-color: #27ae60; }
        .error { background: #fee; border: 1px solid #fcc; padding: 10px; margin: 5px 0; border-radius: 4px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Automated Test Report</h1>
            <p>Generated on: ${this.results.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h2>${this.results.summary.total}</h2>
                <p>Total Tests</p>
            </div>
            <div class="summary-card passed">
                <h2>${this.results.summary.passed}</h2>
                <p>Passed</p>
            </div>
            <div class="summary-card failed">
                <h2>${this.results.summary.failed}</h2>
                <p>Failed</p>
            </div>
            <div class="summary-card errors">
                <h2>${this.results.summary.errors.length}</h2>
                <p>Errors</p>
            </div>
        </div>
        
        <div class="details">
            <h2>📊 Detailed Results</h2>
            ${Object.entries(this.results.details).map(([testType, details]) => `
                <div class="test-type">
                    <h3>${testType.toUpperCase()} Tests</h3>
                    <p>Passed: ${details.passed} | Failed: ${details.failed}</p>
                    ${details.errors.length > 0 ? `
                        <h4>Errors:</h4>
                        ${details.errors.map(error => `<div class="error"><pre>${error}</pre></div>`).join('')}
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="recommendations">
            <h2>🎯 Recommendations</h2>
            ${this.results.recommendations.map(rec => `
                <div class="recommendation priority-${rec.priority.toLowerCase()}">
                    <h4>[${rec.priority}] ${rec.category}</h4>
                    <p><strong>Issue:</strong> ${rec.message}</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    ${rec.details ? `
                        <details>
                            <summary>Error Details</summary>
                            ${rec.details.map(detail => `<div class="error"><pre>${detail}</pre></div>`).join('')}
                        </details>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    
    // Kill any remaining processes
    try {
      exec('pkill -f "node server.js"', () => {});
      exec('pkill -f "react-scripts"', () => {});
      exec('pkill -f "jest"', () => {});
      exec('pkill -f "cypress"', () => {});
    } catch (error) {
      // Ignore cleanup errors
    }
    
    console.log('✅ Cleanup completed');
  }
}

// Run the automated test runner
if (require.main === module) {
  const runner = new AutomatedTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = AutomatedTestRunner; 