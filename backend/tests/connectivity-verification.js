/**
 * Automated Backend Connectivity Verification Script
 * 
 * This script performs comprehensive automated testing of all backend API endpoints
 * for both the Home Page and Admin Page.
 * 
 * Usage: node backend/tests/connectivity-verification.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@avalmeos.com';
const ADMIN_PASSWORD = 'admin123';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name, status, details = '') {
  const symbol = status ? '✅' : '❌';
  const color = status ? 'green' : 'red';
  log(`  ${symbol} ${name}`, color);
  if (details) {
    log(`     ${details}`, 'yellow');
  }
}

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     BACKEND CONNECTIVITY AUTOMATED VERIFICATION          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let adminToken = null;

  // ========================================
  // TEST 1: Server Health
  // ========================================
  logSection('1. SERVER HEALTH CHECK');

  try {
    const healthRes = await httpRequest(`${BASE_URL}/api/health`);
    totalTests++;
    if (healthRes.status === 200 && healthRes.data.status === 'ok') {
      passedTests++;
      logTest('Server Health Check', true, `Status: ${healthRes.data.status}`);
    } else {
      failedTests++;
      logTest('Server Health Check', false, `Unexpected response`);
    }
  } catch (error) {
    failedTests++;
    logTest('Server Health Check', false, error.message);
  }

  // ========================================
  // TEST 2: Home Page - Public Endpoints
  // ========================================
  logSection('2. HOME PAGE API ENDPOINTS');

  // Test Destinations
  try {
    const destRes = await httpRequest(`${BASE_URL}/api/destinations`);
    totalTests++;
    if (destRes.status === 200 && destRes.data.success && Array.isArray(destRes.data.data)) {
      passedTests++;
      logTest('GET /api/destinations', true, `${destRes.data.data.length} destinations found`);
    } else {
      failedTests++;
      logTest('GET /api/destinations', false, `Status: ${destRes.status}`);
    }
  } catch (error) {
    failedTests++;
    logTest('GET /api/destinations', false, error.message);
  }

  // Test Activities
  try {
    const actRes = await httpRequest(`${BASE_URL}/api/activities`);
    totalTests++;
    if (actRes.status === 200 && actRes.data.success && Array.isArray(actRes.data.data)) {
      passedTests++;
      logTest('GET /api/activities', true, `${actRes.data.data.length} activities found`);
    } else {
      failedTests++;
      logTest('GET /api/activities', false, `Status: ${actRes.status}`);
    }
  } catch (error) {
    failedTests++;
    logTest('GET /api/activities', false, error.message);
  }

  // Test Packages
  try {
    const pkgRes = await httpRequest(`${BASE_URL}/api/packages`);
    totalTests++;
    if (pkgRes.status === 200 && pkgRes.data.success && Array.isArray(pkgRes.data.data)) {
      passedTests++;
      logTest('GET /api/packages', true, `${pkgRes.data.data.length} packages found`);
    } else {
      failedTests++;
      logTest('GET /api/packages', false, `Status: ${pkgRes.status}`);
    }
  } catch (error) {
    failedTests++;
    logTest('GET /api/packages', false, error.message);
  }

  // ========================================
  // TEST 3: Admin Authentication
  // ========================================
  logSection('3. ADMIN AUTHENTICATION');

  // Test Login
  try {
    const loginRes = await httpRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    totalTests++;
    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.data.token) {
      passedTests++;
      adminToken = loginRes.data.data.token;
      logTest('POST /api/auth/login', true, `Token generated successfully`);
    } else {
      failedTests++;
      logTest('POST /api/auth/login', false, `Login failed: ${loginRes.data.message}`);
    }
  } catch (error) {
    failedTests++;
    logTest('POST /api/auth/login', false, error.message);
  }

  // Test Unauthorized Access
  try {
    const unauthRes = await httpRequest(`${BASE_URL}/api/admin/bookings`);
    totalTests++;
    if (unauthRes.status === 401 && !unauthRes.data.success) {
      passedTests++;
      logTest('Unauthorized Access Blocked', true, 'Properly rejected without token');
    } else {
      failedTests++;
      logTest('Unauthorized Access Blocked', false, 'Should have returned 401');
    }
  } catch (error) {
    failedTests++;
    logTest('Unauthorized Access Blocked', false, error.message);
  }

  // ========================================
  // TEST 4: Admin Dashboard & Stats
  // ========================================
  if (adminToken) {
    logSection('4. ADMIN DASHBOARD ENDPOINTS');

    // Test Admin Stats
    try {
      const statsRes = await httpRequest(`${BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      totalTests++;
      if (statsRes.status === 200 && statsRes.data.success) {
        passedTests++;
        const data = statsRes.data.data;
        logTest('GET /api/admin/stats', true, `Bookings: ${data.totalBookings}, Users: ${data.totalUsers}, Destinations: ${data.totalDestinations}`);
      } else {
        failedTests++;
        logTest('GET /api/admin/stats', false, `Status: ${statsRes.status}`);
      }
    } catch (error) {
      failedTests++;
      logTest('GET /api/admin/stats', false, error.message);
    }

    // Test Admin Bookings
    try {
      const bookingsRes = await httpRequest(`${BASE_URL}/api/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      totalTests++;
      if (bookingsRes.status === 200 && bookingsRes.data.success) {
        passedTests++;
        logTest('GET /api/admin/bookings', true, `${bookingsRes.data.data.length} bookings found`);
      } else {
        failedTests++;
        logTest('GET /api/admin/bookings', false, `Status: ${bookingsRes.status}`);
      }
    } catch (error) {
      failedTests++;
      logTest('GET /api/admin/bookings', false, error.message);
    }

    // Test Admin Users
    try {
      const usersRes = await httpRequest(`${BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      totalTests++;
      if (usersRes.status === 200 && usersRes.data.success) {
        passedTests++;
        logTest('GET /api/admin/users', true, `${usersRes.data.data.length} users found`);
      } else {
        failedTests++;
        logTest('GET /api/admin/users', false, `Status: ${usersRes.status}`);
      }
    } catch (error) {
      failedTests++;
      logTest('GET /api/admin/users', false, error.message);
    }

    // Test Admin Inquiries
    try {
      const inquiriesRes = await httpRequest(`${BASE_URL}/api/admin/inquiries`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      totalTests++;
      if (inquiriesRes.status === 200 && inquiriesRes.data.success) {
        passedTests++;
        logTest('GET /api/admin/inquiries', true, `${inquiriesRes.data.data.length} inquiries found`);
      } else {
        failedTests++;
        logTest('GET /api/admin/inquiries', false, `Status: ${inquiriesRes.status}`);
      }
    } catch (error) {
      failedTests++;
      logTest('GET /api/admin/inquiries', false, error.message);
    }
  }

  // ========================================
  // TEST 5: Form Submissions
  // ========================================
  logSection('5. FORM SUBMISSIONS');

  // Test Inquiry Submission
  try {
    const inquiryRes = await httpRequest(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      body: {
        name: 'Auto Test User',
        email: 'autotest@example.com',
        phone: '+1234567890',
        subject: 'Automated Test Inquiry',
        message: 'This is an automated test message',
        inquiry_type: 'general'
      }
    });
    totalTests++;
    if (inquiryRes.status === 201 && inquiryRes.data.success) {
      passedTests++;
      logTest('POST /api/inquiries', true, `Created inquiry: ${inquiryRes.data.data.id}`);
    } else {
      failedTests++;
      logTest('POST /api/inquiries', false, `Status: ${inquiryRes.status}`);
    }
  } catch (error) {
    failedTests++;
    logTest('POST /api/inquiries', false, error.message);
  }

  // Test Booking (requires authentication - will test with user registration)
  // This is a limited test since booking requires user authentication

  // ========================================
  // TEST 6: Error Handling
  // ========================================
  logSection('6. ERROR HANDLING');

  // Test Invalid Login
  try {
    const invalidLoginRes = await httpRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: { email: 'wrong@test.com', password: 'wrongpassword' }
    });
    totalTests++;
    if (invalidLoginRes.status === 401 && !invalidLoginRes.data.success) {
      passedTests++;
      logTest('Invalid Credentials Rejected', true, 'Proper error message returned');
    } else {
      failedTests++;
      logTest('Invalid Credentials Rejected', false, 'Should have returned 401');
    }
  } catch (error) {
    failedTests++;
    logTest('Invalid Credentials Rejected', false, error.message);
  }

  // Test Invalid Token
  try {
    const invalidTokenRes = await httpRequest(`${BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': 'Bearer invalid_token_12345' }
    });
    totalTests++;
    if (invalidTokenRes.status === 403) {
      passedTests++;
      logTest('Invalid Token Rejected', true, 'Properly rejected invalid token');
    } else {
      failedTests++;
      logTest('Invalid Token Rejected', false, `Status: ${invalidTokenRes.status}`);
    }
  } catch (error) {
    failedTests++;
    logTest('Invalid Token Rejected', false, error.message);
  }

  // ========================================
  // FINAL SUMMARY
  // ========================================
  logSection('VERIFICATION SUMMARY');

  const percentage = Math.round((passedTests / totalTests) * 100);
  const statusColor = percentage === 100 ? 'green' : percentage >= 80 ? 'yellow' : 'red';

  log(`  Total Tests: ${totalTests}`, 'blue');
  log(`  Passed: ${passedTests}`, 'green');
  log(`  Failed: ${failedTests}`, 'red');
  log(`  Success Rate: ${percentage}%`, statusColor);
  console.log('');

  if (percentage === 100) {
    log('  🎉 ALL TESTS PASSED! Backend is fully functional.', 'green');
  } else if (percentage >= 80) {
    log('  ⚠️  MOST TESTS PASSED. Some issues need attention.', 'yellow');
  } else {
    log('  ❌ MULTIPLE TESTS FAILED. Backend needs fixes.', 'red');
  }

  console.log('\n');
  log('  Verification completed at: ' + new Date().toISOString(), 'cyan');
  console.log('\n');

  return percentage === 100;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
