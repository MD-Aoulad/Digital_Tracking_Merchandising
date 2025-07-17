#!/usr/bin/env node

/**
 * Test Connection Script
 * 
 * This script tests the connection between the mobile app and backend server.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Read API configuration from the TypeScript file
function getApiUrl() {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'api.ts');
  const content = fs.readFileSync(configPath, 'utf8');
  
  // Extract BASE_URL using regex
  const match = content.match(/BASE_URL:\s*'([^']+)'/);
  if (match) {
    return match[1];
  }
  
  return 'http://localhost:5000/api'; // fallback
}

async function testConnection() {
  console.log('🔍 Testing Mobile App Connection');
  console.log('================================\n');
  
  const apiUrl = getApiUrl();
  console.log(`📍 API URL: ${apiUrl}`);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${apiUrl.replace('/api', '')}/api/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Backend health check passed');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Message: ${healthData.message}`);
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
    
    // Test authentication endpoint
    console.log('\n2. Testing authentication endpoint...');
    const authResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'richard@company.com',
        password: 'password'
      })
    });
    
    const authData = await authResponse.json();
    
    if (authResponse.ok) {
      console.log('✅ Authentication test passed');
      console.log(`   User: ${authData.user.name} (${authData.user.email})`);
      console.log(`   Role: ${authData.user.role}`);
      console.log(`   Token: ${authData.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Authentication test failed');
      console.log(`   Error: ${authData.error}`);
      return false;
    }
    
    // Test profile endpoint with token
    console.log('\n3. Testing profile endpoint...');
    const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const profileData = await profileResponse.json();
    
    if (profileResponse.ok) {
      console.log('✅ Profile endpoint test passed');
      console.log(`   User ID: ${profileData.user.id}`);
      console.log(`   Department: ${profileData.user.department}`);
    } else {
      console.log('❌ Profile endpoint test failed');
      console.log(`   Error: ${profileData.error}`);
      return false;
    }
    
    console.log('\n🎉 All tests passed! Mobile app should work correctly.');
    console.log('\n📱 Next steps:');
    console.log('1. Start the mobile app: npm start');
    console.log('2. Use Expo Go to scan the QR code');
    console.log('3. Login with: richard@company.com / password');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running: npm start (in backend folder)');
    console.log('2. Check that the API URL is correct in src/config/api.ts');
    console.log('3. Verify your IP address is accessible from mobile device');
    console.log('4. Check firewall settings');
    
    return false;
  }
}

// Run the test
if (require.main === module) {
  testConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testConnection }; 