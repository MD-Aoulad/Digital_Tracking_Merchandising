#!/usr/bin/env node

const AutomatedTestRunner = require('./automated-test-runner');
const fs = require('fs');
const path = require('path');

class ContinuousTestMonitor {
  constructor(options = {}) {
    this.options = {
      interval: options.interval || 300000, // 5 minutes default
      maxRuns: options.maxRuns || 0, // 0 = unlimited
      logFile: options.logFile || 'continuous-test-monitor.log',
      reportDir: options.reportDir || 'test-reports',
      ...options
    };
    
    this.runCount = 0;
    this.isRunning = false;
    this.shouldStop = false;
    this.lastRunTime = null;
    this.nextRunTime = null;
    
    // Ensure report directory exists
    if (!fs.existsSync(this.options.reportDir)) {
      fs.mkdirSync(this.options.reportDir, { recursive: true });
    }
  }

  async start() {
    console.log('🔄 Starting Continuous Test Monitor...');
    console.log(`⏰ Interval: ${this.options.interval / 1000} seconds`);
    console.log(`📁 Reports: ${this.options.reportDir}`);
    console.log(`📝 Log: ${this.options.logFile}`);
    
    this.log('Continuous Test Monitor started');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
    
    // Start the monitoring loop
    await this.monitorLoop();
  }

  async monitorLoop() {
    while (!this.shouldStop) {
      try {
        this.lastRunTime = new Date();
        this.nextRunTime = new Date(this.lastRunTime.getTime() + this.options.interval);
        
        console.log(`\n🔄 Run #${this.runCount + 1} starting at ${this.lastRunTime.toISOString()}`);
        console.log(`⏰ Next run scheduled for ${this.nextRunTime.toISOString()}`);
        
        // Run tests
        await this.runTests();
        
        this.runCount++;
        
        // Check if we've reached max runs
        if (this.options.maxRuns > 0 && this.runCount >= this.options.maxRuns) {
          console.log(`✅ Reached maximum runs (${this.options.maxRuns}), stopping monitor`);
          break;
        }
        
        // Wait for next interval
        if (!this.shouldStop) {
          console.log(`⏳ Waiting ${this.options.interval / 1000} seconds until next run...`);
          await this.sleep(this.options.interval);
        }
        
      } catch (error) {
        console.error('❌ Error in monitor loop:', error);
        this.log(`ERROR: ${error.message}`);
        
        // Wait a bit before retrying
        await this.sleep(30000); // 30 seconds
      }
    }
    
    console.log('🛑 Continuous Test Monitor stopped');
    this.log('Continuous Test Monitor stopped');
  }

  async runTests() {
    if (this.isRunning) {
      console.log('⚠️  Previous test run still in progress, skipping...');
      return;
    }
    
    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      const runner = new AutomatedTestRunner();
      await runner.runAllTests();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Test run completed in ${duration}ms`);
      
      // Archive the latest report
      await this.archiveReport();
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Test run failed after ${duration}ms:`, error.message);
      this.log(`TEST_RUN_FAILED: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  async archiveReport() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sourceJson = 'test-report-automated.json';
      const sourceHtml = 'test-report-automated.html';
      
      if (fs.existsSync(sourceJson)) {
        const destJson = path.join(this.options.reportDir, `test-report-${timestamp}.json`);
        fs.copyFileSync(sourceJson, destJson);
        console.log(`📄 JSON report archived: ${destJson}`);
      }
      
      if (fs.existsSync(sourceHtml)) {
        const destHtml = path.join(this.options.reportDir, `test-report-${timestamp}.html`);
        fs.copyFileSync(sourceHtml, destHtml);
        console.log(`📄 HTML report archived: ${destHtml}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to archive report:', error.message);
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.options.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async stop() {
    console.log('\n🛑 Stopping Continuous Test Monitor...');
    this.shouldStop = true;
    
    // Wait for current run to complete
    if (this.isRunning) {
      console.log('⏳ Waiting for current test run to complete...');
      while (this.isRunning) {
        await this.sleep(1000);
      }
    }
    
    console.log('✅ Continuous Test Monitor stopped gracefully');
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      shouldStop: this.shouldStop,
      runCount: this.runCount,
      lastRunTime: this.lastRunTime,
      nextRunTime: this.nextRunTime,
      options: this.options
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--interval':
        options.interval = parseInt(args[++i]) * 1000; // Convert to milliseconds
        break;
      case '--max-runs':
        options.maxRuns = parseInt(args[++i]);
        break;
      case '--log-file':
        options.logFile = args[++i];
        break;
      case '--report-dir':
        options.reportDir = args[++i];
        break;
      case '--help':
        console.log(`
Continuous Test Monitor

Usage: node scripts/continuous-test-monitor.js [options]

Options:
  --interval <seconds>    Test run interval in seconds (default: 300)
  --max-runs <number>     Maximum number of test runs (default: unlimited)
  --log-file <path>       Log file path (default: continuous-test-monitor.log)
  --report-dir <path>     Report directory (default: test-reports)
  --help                  Show this help message

Examples:
  node scripts/continuous-test-monitor.js --interval 600 --max-runs 10
  node scripts/continuous-test-monitor.js --report-dir ./my-reports
        `);
        process.exit(0);
        break;
    }
  }
  
  const monitor = new ContinuousTestMonitor(options);
  monitor.start().catch(console.error);
}

module.exports = ContinuousTestMonitor; 