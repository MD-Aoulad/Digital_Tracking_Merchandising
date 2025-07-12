/**
 * Cypress Configuration for Digital Tracking Merchandising
 * 
 * This configuration provides end-to-end testing setup for:
 * - User workflows
 * - Authentication flows
 * - Todo management
 * - Navigation testing
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // E2E testing configuration
  e2e: {
    // Base URL for the application
    baseUrl: 'http://localhost:3000',
    
    // API base URL
    env: {
      apiUrl: 'http://localhost:5000/api',
    },
    
    // Test files pattern
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.ts',
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video recording
    video: true,
    videoCompression: 32,
    
    // Screenshot settings
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // Videos folder
    videosFolder: 'cypress/videos',
    
    // Downloads folder
    downloadsFolder: 'cypress/downloads',
    
    // Fixtures folder
    fixturesFolder: 'cypress/fixtures',
    
    // Default timeout
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Page load timeout
    pageLoadTimeout: 60000,
    
    // Retry attempts
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Setup node events
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });
      
      // Custom commands
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });
    },
  },
  
  // Component testing configuration
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  
  // Global configuration
  watchForFileChanges: false,
  
  // Chrome Web Security
  chromeWebSecurity: false,
  
  // Experimental features
  experimentalModifyObstructiveThirdPartyCode: true,
  
  // Network stubbing
  experimentalNetworkStubbing: true,
  
  // Memory management
  experimentalMemoryManagement: true,
  
  // Performance monitoring
  experimentalRunAllSpecs: true,
  
  // Reporter configuration
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/results/results-[hash].xml',
    },
  },
}); 