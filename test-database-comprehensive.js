// Comprehensive Database and Multi-Tenant Testing Suite
import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://advanced-calendar-production-02f3.up.railway.app/api';
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test helper function
async function runTest(testName, testFunction) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    const result = await testFunction();
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASSED', result });
    console.log(`✅ ${testName}: PASSED`);
    return result;
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ ${testName}: FAILED - ${error.message}`);
    return null;
  }
}

// Test 1: Database Health Check
async function testDatabaseHealth() {
  const response = await axios.get(`${RAILWAY_BACKEND_URL}/health`);
  if (response.status !== 200) throw new Error('Health check failed');
  if (!response.data.success) throw new Error('Health check returned success: false');
  if (response.data.database !== 'connected') throw new Error('Database not connected');
  return response.data;
}

// Test 2: User Registration
async function testUserRegistration() {
  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    password: 'test123456'
  };
  
  const response = await axios.post(`${RAILWAY_BACKEND_URL}/auth/register`, testUser);
  if (response.status !== 201) throw new Error('Registration failed with status ' + response.status);
  if (!response.data.success) throw new Error('Registration returned success: false');
  if (!response.data.data.user) throw new Error('No user data returned');
  if (!response.data.data.token) throw new Error('No token returned');
  
  return { user: testUser, response: response.data };
}

// Test 3: User Login
async function testUserLogin() {
  const testUser = {
    email: 'demo@example.com',
    password: 'demo123'
  };
  
  const response = await axios.post(`${RAILWAY_BACKEND_URL}/auth/login`, testUser);
  if (response.status !== 200) throw new Error('Login failed with status ' + response.status);
  if (!response.data.success) throw new Error('Login returned success: false');
  if (!response.data.data.user) throw new Error('No user data returned');
  if (!response.data.data.token) throw new Error('No token returned');
  
  return response.data;
}

// Test 4: Business Hours API
async function testBusinessHours() {
  const response = await axios.get(`${RAILWAY_BACKEND_URL}/business-hours`);
  if (response.status !== 200) throw new Error('Business hours failed with status ' + response.status);
  if (!response.data.success) throw new Error('Business hours returned success: false');
  if (!response.data.data.businessHours) throw new Error('No business hours data returned');
  if (!Array.isArray(response.data.data.businessHours)) throw new Error('Business hours not an array');
  if (response.data.data.businessHours.length !== 7) throw new Error('Expected 7 days, got ' + response.data.data.businessHours.length);
  
  return response.data;
}

// Test 5: Rooms API
async function testRooms() {
  const response = await axios.get(`${RAILWAY_BACKEND_URL}/rooms`);
  if (response.status !== 200) throw new Error('Rooms failed with status ' + response.status);
  if (!response.data.success) throw new Error('Rooms returned success: false');
  if (!Array.isArray(response.data.data)) throw new Error('Rooms data not an array');
  if (response.data.data.length === 0) throw new Error('No rooms returned');
  
  return response.data;
}

// Test 6: Bookings API
async function testBookings() {
  const response = await axios.get(`${RAILWAY_BACKEND_URL}/bookings`);
  if (response.status !== 200) throw new Error('Bookings failed with status ' + response.status);
  if (!response.data.success) throw new Error('Bookings returned success: false');
  if (!response.data.data.bookings) throw new Error('No bookings data returned');
  if (!Array.isArray(response.data.data.bookings)) throw new Error('Bookings not an array');
  
  return response.data;
}

// Test 7: Multi-Tenant User Isolation
async function testMultiTenantIsolation() {
  // Create two different users
  const user1 = {
    name: `Tenant1 User ${Date.now()}`,
    email: `tenant1-${Date.now()}@example.com`,
    password: 'tenant123456'
  };
  
  const user2 = {
    name: `Tenant2 User ${Date.now()}`,
    email: `tenant2-${Date.now()}@example.com`,
    password: 'tenant123456'
  };
  
  // Register both users
  const reg1 = await axios.post(`${RAILWAY_BACKEND_URL}/auth/register`, user1);
  const reg2 = await axios.post(`${RAILWAY_BACKEND_URL}/auth/register`, user2);
  
  if (!reg1.data.success || !reg2.data.success) {
    throw new Error('Failed to register test users');
  }
  
  // Login with both users
  const login1 = await axios.post(`${RAILWAY_BACKEND_URL}/auth/login`, {
    email: user1.email,
    password: user1.password
  });
  
  const login2 = await axios.post(`${RAILWAY_BACKEND_URL}/auth/login`, {
    email: user2.email,
    password: user2.password
  });
  
  if (!login1.data.success || !login2.data.success) {
    throw new Error('Failed to login test users');
  }
  
  // Verify users are different
  if (login1.data.data.user.id === login2.data.data.user.id) {
    throw new Error('Users have same ID - multi-tenant isolation failed');
  }
  
  if (login1.data.data.user.email === login2.data.data.user.email) {
    throw new Error('Users have same email - multi-tenant isolation failed');
  }
  
  return {
    user1: login1.data.data.user,
    user2: login2.data.data.user,
    isolation: 'PASSED'
  };
}

// Test 8: Data Persistence
async function testDataPersistence() {
  const testUser = {
    name: `Persistence Test ${Date.now()}`,
    email: `persist-${Date.now()}@example.com`,
    password: 'persist123456'
  };
  
  // Register user
  const register = await axios.post(`${RAILWAY_BACKEND_URL}/auth/register`, testUser);
  if (!register.data.success) throw new Error('Registration failed');
  
  const userId = register.data.data.user.id;
  const userEmail = register.data.data.user.email;
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Login with same credentials
  const login = await axios.post(`${RAILWAY_BACKEND_URL}/auth/login`, {
    email: testUser.email,
    password: testUser.password
  });
  
  if (!login.data.success) throw new Error('Login failed after registration');
  if (login.data.data.user.id !== userId) throw new Error('User ID changed');
  if (login.data.data.user.email !== userEmail) throw new Error('User email changed');
  
  return {
    original: register.data.data.user,
    persisted: login.data.data.user,
    persistence: 'PASSED'
  };
}

// Test 9: Error Handling
async function testErrorHandling() {
  const tests = [];
  
  // Test invalid registration
  try {
    await axios.post(`${RAILWAY_BACKEND_URL}/auth/register`, {
      name: '',
      email: 'invalid-email',
      password: '123'
    });
    tests.push('Invalid registration should have failed');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      tests.push('Invalid registration properly rejected');
    } else {
      tests.push('Invalid registration error handling failed');
    }
  }
  
  // Test invalid login
  try {
    await axios.post(`${RAILWAY_BACKEND_URL}/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
    tests.push('Invalid login should have failed');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      tests.push('Invalid login properly rejected');
    } else {
      tests.push('Invalid login error handling failed');
    }
  }
  
  return tests;
}

// Test 10: API Performance
async function testAPIPerformance() {
  const startTime = Date.now();
  
  // Test multiple concurrent requests
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(axios.get(`${RAILWAY_BACKEND_URL}/health`));
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const allSuccessful = results.every(r => r.status === 200 && r.data.success);
  if (!allSuccessful) throw new Error('Some concurrent requests failed');
  
  return {
    duration: `${duration}ms`,
    requests: results.length,
    avgResponseTime: `${duration / results.length}ms`,
    performance: duration < 5000 ? 'GOOD' : 'SLOW'
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Database and Multi-Tenant Testing');
  console.log('=' .repeat(60));
  
  // Run all tests
  await runTest('Database Health Check', testDatabaseHealth);
  await runTest('User Registration', testUserRegistration);
  await runTest('User Login (Demo)', testUserLogin);
  await runTest('Business Hours API', testBusinessHours);
  await runTest('Rooms API', testRooms);
  await runTest('Bookings API', testBookings);
  await runTest('Multi-Tenant User Isolation', testMultiTenantIsolation);
  await runTest('Data Persistence', testDataPersistence);
  await runTest('Error Handling', testErrorHandling);
  await runTest('API Performance', testAPIPerformance);
  
  // Generate report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (test.status === 'FAILED') {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  // Overall assessment
  const successRate = (testResults.passed / (testResults.passed + testResults.failed)) * 100;
  if (successRate >= 90) {
    console.log('\n🎉 EXCELLENT: Database and multi-tenant system is working perfectly!');
  } else if (successRate >= 70) {
    console.log('\n⚠️ GOOD: Most functionality working, some issues to address');
  } else {
    console.log('\n🚨 NEEDS WORK: Significant issues found, requires attention');
  }
  
  return testResults;
}

// Run the tests
runAllTests().catch(console.error);
