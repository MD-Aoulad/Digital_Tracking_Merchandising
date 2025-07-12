/**
 * Global Teardown for Jest Tests
 * 
 * This file runs after all tests complete and cleans up the testing environment.
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Cleaning up global test environment...');
  
  // Clean up test files if needed
  const testFilesToClean = [
    'test-output.json',
    'test-results.xml',
  ];
  
  testFilesToClean.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Cleaned up: ${file}`);
    }
  });
  
  // Reset environment variables
  delete process.env.REACT_APP_TEST_MODE;
  
  // Clear all mocks
  jest.clearAllMocks();
  jest.resetAllMocks();
  
  // Clear timers
  jest.clearAllTimers();
  
  console.log('✅ Global test environment cleanup complete');
}; 