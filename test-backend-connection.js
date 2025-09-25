// Test script to verify Railway backend connection
import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://advanced-calendar-production-02f3.up.railway.app/api';

async function testBackendConnection() {
  console.log('🔍 Testing Railway Backend Connection...');
  console.log('📍 Backend URL:', RAILWAY_BACKEND_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing Health Endpoint...');
    const healthResponse = await axios.get(`${RAILWAY_BACKEND_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    
    // Test auth endpoint
    console.log('\n2. Testing Auth Endpoint...');
    const authResponse = await axios.post(`${RAILWAY_BACKEND_URL}/auth/login`, {
      email: 'demo@example.com',
      password: 'demo123'
    });
    console.log('✅ Auth Test:', authResponse.data);
    
    // Test registration endpoint
    console.log('\n3. Testing Registration Endpoint...');
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'test123456'
    };
    
    const registerResponse = await axios.post(`${RAILWAY_BACKEND_URL}/auth/register`, testUser);
    console.log('✅ Registration Test:', registerResponse.data);
    
    console.log('\n🎉 All tests passed! Railway backend is working perfectly.');
    console.log('📋 Next step: Update Vercel environment variables');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testBackendConnection();
