#!/usr/bin/env node

/**
 * Mobile App API Setup Script
 * 
 * This script helps configure the mobile app to connect to the backend server.
 * It detects your local IP address and updates the API configuration.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

// Update API configuration file
function updateApiConfig(ipAddress) {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'api.ts');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ API config file not found:', configPath);
    return false;
  }
  
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Update the BASE_URL with the detected IP
  const newBaseUrl = `http://${ipAddress}:5000/api`;
  content = content.replace(
    /BASE_URL:\s*'[^']*'/,
    `BASE_URL: '${newBaseUrl}'`
  );
  
  fs.writeFileSync(configPath, content);
  return true;
}

// Main execution
function main() {
  console.log('🔧 Mobile App API Setup');
  console.log('========================\n');
  
  const localIP = getLocalIP();
  console.log(`📍 Detected local IP address: ${localIP}`);
  
  if (localIP === 'localhost') {
    console.log('⚠️  Warning: Could not detect local IP address');
    console.log('   The mobile app may not be able to connect to the backend');
    console.log('   Make sure your backend server is running on port 5000');
    console.log('   You may need to manually update the IP address in src/config/api.ts\n');
  } else {
    console.log(`✅ Updating API configuration to use: ${localIP}`);
    
    if (updateApiConfig(localIP)) {
      console.log('✅ API configuration updated successfully!');
      console.log(`   Backend URL: http://${localIP}:5000/api`);
    } else {
      console.log('❌ Failed to update API configuration');
    }
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Make sure your backend server is running: npm start (in backend folder)');
  console.log('2. Start the mobile app: npm start (in WorkforceMobileExpo folder)');
  console.log('3. Use the Expo Go app to scan the QR code');
  console.log('4. Try logging in with: richard@company.com / password');
  
  console.log('\n🔍 Troubleshooting:');
  console.log('- If connection fails, check that your backend server is running on port 5000');
  console.log('- Make sure your phone and computer are on the same WiFi network');
  console.log('- Try using localhost if you\'re testing on the same device');
  console.log('- Check the console logs for detailed error messages');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getLocalIP, updateApiConfig }; 