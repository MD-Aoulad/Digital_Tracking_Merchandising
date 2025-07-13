const { spawn } = require('child_process');

// Global test setup
beforeAll(async () => {
  // Kill any existing processes on test ports
  await killProcessOnPort(5001);
  await killProcessOnPort(5000);
  
  // Wait for ports to be available
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Global test teardown
afterAll(async () => {
  // Clean up any remaining processes
  await killProcessOnPort(5001);
  await killProcessOnPort(5000);
});

async function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const lsof = spawn('lsof', ['-ti', `:${port}`]);
    let pid = '';
    
    lsof.stdout.on('data', (data) => {
      pid += data.toString();
    });
    
    lsof.on('close', () => {
      if (pid.trim()) {
        const kill = spawn('kill', ['-9', pid.trim()]);
        kill.on('close', () => resolve());
      } else {
        resolve();
      }
    });
  });
}

// Export for use in other test files
module.exports = {
  killProcessOnPort
}; 