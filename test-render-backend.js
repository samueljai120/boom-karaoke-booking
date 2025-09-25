#!/usr/bin/env node

/**
 * Test script for Render backend deployment
 * Usage: node test-render-backend.js YOUR_RENDER_URL
 */

import https from 'https';

const renderUrl = process.argv[2];

if (!renderUrl) {
  console.log('❌ Please provide the Render backend URL');
  console.log('Usage: node test-render-backend.js YOUR_RENDER_URL');
  process.exit(1);
}

console.log(`🧪 Testing Render backend: ${renderUrl}`);
console.log('─'.repeat(60));

// Test endpoints
const endpoints = [
  { path: '/', name: 'Root API Info' },
  { path: '/api/health', name: 'Health Check' },
  { path: '/test', name: 'Test Endpoint' }
];

async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ ${name}: ${res.statusCode} (${duration}ms)`);
          console.log(`   Message: ${jsonData.message || jsonData.status || 'OK'}`);
          if (jsonData.environment) {
            console.log(`   Environment: ${jsonData.environment}`);
          }
          if (jsonData.database) {
            console.log(`   Database: ${jsonData.database}`);
          }
        } catch (error) {
          console.log(`❌ ${name}: ${res.statusCode} (${duration}ms)`);
          console.log(`   Error: Invalid JSON response`);
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
        
        resolve();
      });
    }).on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ${name}: Connection failed (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      resolve();
    });
  });
}

// Test all endpoints
async function runTests() {
  for (const endpoint of endpoints) {
    const url = `${renderUrl}${endpoint.path}`;
    await testEndpoint(url, endpoint.name);
    console.log('');
  }
  
  console.log('🎯 Testing complete!');
  console.log('');
  console.log('📋 If all tests pass:');
  console.log('1. Your Render backend is working correctly');
  console.log('2. Update your frontend configuration');
  console.log('3. Test real user registration and login');
  console.log('');
  console.log('🔗 Backend URL: ' + renderUrl);
}

runTests();
