#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestHealthChecker {
  constructor() {
    this.healthStatus = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      checks: {
        dependencies: { status: 'unknown', issues: [] },
        configuration: { status: 'unknown', issues: [] },
        processes: { status: 'unknown', issues: [] },
        ports: { status: 'unknown', issues: [] },
        files: { status: 'unknown', issues: [] }
      },
      recommendations: []
    };
  }

  async runHealthCheck() {
    console.log('🏥 Running Test Infrastructure Health Check...');
    
    try {
      await this.checkDependencies();
      await this.checkConfiguration();
      await this.checkProcesses();
      await this.checkPorts();
      await this.checkFiles();
      
      this.determineOverallHealth();
      this.generateRecommendations();
      
      await this.generateHealthReport();
      
      return this.healthStatus;
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.healthStatus.overall = 'error';
      this.healthStatus.checks.general = { 
        status: 'error', 
        issues: [error.message] 
      };
      return this.healthStatus;
    }
  }

  async checkDependencies() {
    console.log('📦 Checking dependencies...');
    const checks = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'npm', command: 'npm --version' },
      { name: 'Jest', command: 'npx jest --version' },
      { name: 'Cypress', command: 'npx cypress --version' },
      { name: 'TypeScript', command: 'npx tsc --version' }
    ];

    for (const check of checks) {
      try {
        const result = await this.runCommand(check.command);
        if (result.success) {
          console.log(`✅ ${check.name}: ${result.output.trim()}`);
        } else {
          this.healthStatus.checks.dependencies.issues.push(
            `${check.name}: ${result.error}`
          );
        }
      } catch (error) {
        this.healthStatus.checks.dependencies.issues.push(
          `${check.name}: ${error.message}`
        );
      }
    }

    this.healthStatus.checks.dependencies.status = 
      this.healthStatus.checks.dependencies.issues.length === 0 ? 'healthy' : 'unhealthy';
  }

  async checkConfiguration() {
    console.log('⚙️  Checking configuration files...');
    const requiredFiles = [
      'package.json',
      'jest.config.js',
      'cypress.config.js',
      'tsconfig.json',
      'backend/package.json',
      'backend/server.js'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}: exists`);
        
        // Check if file is valid JSON (for JSON files)
        if (file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(file, 'utf8');
            JSON.parse(content);
            console.log(`✅ ${file}: valid JSON`);
          } catch (error) {
            this.healthStatus.checks.configuration.issues.push(
              `${file}: invalid JSON - ${error.message}`
            );
          }
        }
      } else {
        this.healthStatus.checks.configuration.issues.push(
          `${file}: missing`
        );
      }
    }

    this.healthStatus.checks.configuration.status = 
      this.healthStatus.checks.configuration.issues.length === 0 ? 'healthy' : 'unhealthy';
  }

  async checkProcesses() {
    console.log('🔄 Checking running processes...');
    
    try {
      // Check for Node.js processes
      const nodeProcesses = await this.runCommand('ps aux | grep node | grep -v grep');
      if (nodeProcesses.success) {
        const lines = nodeProcesses.output.trim().split('\n');
        console.log(`📊 Found ${lines.length} Node.js processes running`);
        
        // Check for specific processes that might interfere
        const problematicProcesses = [
          'react-scripts',
          'server.js',
          'jest',
          'cypress'
        ];
        
        for (const process of problematicProcesses) {
          if (nodeProcesses.output.includes(process)) {
            console.log(`⚠️  Found running ${process} process`);
            this.healthStatus.checks.processes.issues.push(
              `${process} process is already running`
            );
          }
        }
      }
      
    } catch (error) {
      this.healthStatus.checks.processes.issues.push(
        `Failed to check processes: ${error.message}`
      );
    }

    this.healthStatus.checks.processes.status = 
      this.healthStatus.checks.processes.issues.length === 0 ? 'healthy' : 'unhealthy';
  }

  async checkPorts() {
    console.log('🔌 Checking port availability...');
    const portsToCheck = [3000, 5000, 3001, 5001];
    
    for (const port of portsToCheck) {
      try {
        const result = await this.runCommand(`lsof -i :${port}`);
        if (result.success && result.output.trim()) {
          console.log(`⚠️  Port ${port} is in use`);
          this.healthStatus.checks.ports.issues.push(
            `Port ${port} is occupied`
          );
        } else {
          console.log(`✅ Port ${port}: available`);
        }
      } catch (error) {
        console.log(`✅ Port ${port}: available (or check failed)`);
      }
    }

    this.healthStatus.checks.ports.status = 
      this.healthStatus.checks.ports.issues.length === 0 ? 'healthy' : 'unhealthy';
  }

  async checkFiles() {
    console.log('📁 Checking test files...');
    
    const testPatterns = [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/*.spec.tsx'
    ];
    
    let totalTestFiles = 0;
    let validTestFiles = 0;
    
    for (const pattern of testPatterns) {
      try {
        const result = await this.runCommand(`find . -name "${pattern.replace('**', '*')}" -type f`);
        if (result.success) {
          const files = result.output.trim().split('\n').filter(f => f);
          totalTestFiles += files.length;
          
          for (const file of files) {
            if (file) {
              try {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('test(') || content.includes('describe(') || content.includes('it(')) {
                  validTestFiles++;
                } else {
                  this.healthStatus.checks.files.issues.push(
                    `${file}: no test functions found`
                  );
                }
              } catch (error) {
                this.healthStatus.checks.files.issues.push(
                  `${file}: cannot read - ${error.message}`
                );
              }
            }
          }
        }
      } catch (error) {
        // Pattern not found, continue
      }
    }
    
    console.log(`📊 Found ${totalTestFiles} test files, ${validTestFiles} valid`);
    
    if (totalTestFiles === 0) {
      this.healthStatus.checks.files.issues.push(
        'No test files found'
      );
    }

    this.healthStatus.checks.files.status = 
      this.healthStatus.checks.files.issues.length === 0 ? 'healthy' : 'unhealthy';
  }

  determineOverallHealth() {
    const allChecks = Object.values(this.healthStatus.checks);
    const unhealthyChecks = allChecks.filter(check => check.status === 'unhealthy');
    const errorChecks = allChecks.filter(check => check.status === 'error');
    
    if (errorChecks.length > 0) {
      this.healthStatus.overall = 'error';
    } else if (unhealthyChecks.length > 0) {
      this.healthStatus.overall = 'unhealthy';
    } else {
      this.healthStatus.overall = 'healthy';
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Dependencies recommendations
    if (this.healthStatus.checks.dependencies.status !== 'healthy') {
      recommendations.push({
        priority: 'HIGH',
        category: 'DEPENDENCIES',
        message: 'Missing or incompatible dependencies detected',
        action: 'Run "npm install" and ensure all required tools are installed'
      });
    }
    
    // Configuration recommendations
    if (this.healthStatus.checks.configuration.status !== 'healthy') {
      recommendations.push({
        priority: 'HIGH',
        category: 'CONFIGURATION',
        message: 'Configuration files are missing or invalid',
        action: 'Check and fix configuration files'
      });
    }
    
    // Process recommendations
    if (this.healthStatus.checks.processes.status !== 'healthy') {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'PROCESSES',
        message: 'Conflicting processes detected',
        action: 'Stop conflicting processes before running tests'
      });
    }
    
    // Port recommendations
    if (this.healthStatus.checks.ports.status !== 'healthy') {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'PORTS',
        message: 'Required ports are occupied',
        action: 'Free up ports or configure different ports'
      });
    }
    
    // File recommendations
    if (this.healthStatus.checks.files.status !== 'healthy') {
      recommendations.push({
        priority: 'LOW',
        category: 'FILES',
        message: 'Test files have issues',
        action: 'Review and fix test file structure'
      });
    }
    
    this.healthStatus.recommendations = recommendations;
  }

  async generateHealthReport() {
    const reportPath = 'test-health-report.json';
    const htmlPath = 'test-health-report.html';
    
    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.healthStatus, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync(htmlPath, htmlReport);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🏥 TEST INFRASTRUCTURE HEALTH REPORT');
    console.log('='.repeat(60));
    console.log(`Overall Status: ${this.healthStatus.overall.toUpperCase()}`);
    
    Object.entries(this.healthStatus.checks).forEach(([check, status]) => {
      const icon = status.status === 'healthy' ? '✅' : status.status === 'unhealthy' ? '⚠️' : '❌';
      console.log(`${icon} ${check.toUpperCase()}: ${status.status}`);
      if (status.issues.length > 0) {
        status.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    });
    
    if (this.healthStatus.recommendations.length > 0) {
      console.log('\n🎯 RECOMMENDATIONS:');
      this.healthStatus.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
      });
    }
    
    console.log(`\n📁 Reports saved to:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Infrastructure Health Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { display: inline-block; padding: 10px 20px; border-radius: 20px; color: white; font-weight: bold; }
        .status.healthy { background: #27ae60; }
        .status.unhealthy { background: #f39c12; }
        .status.error { background: #e74c3c; }
        .check { margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid #ecf0f1; }
        .check.healthy { border-left-color: #27ae60; background: #f8fff9; }
        .check.unhealthy { border-left-color: #f39c12; background: #fffbf0; }
        .check.error { border-left-color: #e74c3c; background: #fff5f5; }
        .issue { background: #fee; border: 1px solid #fcc; padding: 8px; margin: 5px 0; border-radius: 4px; }
        .recommendation { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3498db; }
        .priority-high { border-left-color: #e74c3c; }
        .priority-medium { border-left-color: #f39c12; }
        .priority-low { border-left-color: #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Test Infrastructure Health Report</h1>
            <p>Generated on: ${this.healthStatus.timestamp}</p>
            <div class="status ${this.healthStatus.overall}">
                ${this.healthStatus.overall.toUpperCase()}
            </div>
        </div>
        
        <h2>📊 Health Checks</h2>
        ${Object.entries(this.healthStatus.checks).map(([check, status]) => `
            <div class="check ${status.status}">
                <h3>${check.toUpperCase()}</h3>
                <p><strong>Status:</strong> ${status.status}</p>
                ${status.issues.length > 0 ? `
                    <h4>Issues:</h4>
                    ${status.issues.map(issue => `<div class="issue">${issue}</div>`).join('')}
                ` : '<p>✅ No issues found</p>'}
            </div>
        `).join('')}
        
        ${this.healthStatus.recommendations.length > 0 ? `
            <h2>🎯 Recommendations</h2>
            ${this.healthStatus.recommendations.map(rec => `
                <div class="recommendation priority-${rec.priority.toLowerCase()}">
                    <h4>[${rec.priority}] ${rec.category}</h4>
                    <p><strong>Issue:</strong> ${rec.message}</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                </div>
            `).join('')}
        ` : ''}
    </div>
</body>
</html>
    `;
  }

  async runCommand(command) {
    return new Promise((resolve) => {
      exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, output: stdout, stderr });
        } else {
          resolve({ success: true, output: stdout, stderr });
        }
      });
    });
  }
}

// CLI interface
if (require.main === module) {
  const checker = new TestHealthChecker();
  checker.runHealthCheck().catch(console.error);
}

module.exports = TestHealthChecker; 