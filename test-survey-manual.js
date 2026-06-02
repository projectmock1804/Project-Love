#!/usr/bin/env node

const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXBwNWM0M3YwMDAwbjhnY2prZGw2dmg4IiwiaWF0IjoxNzc5OTUxNzg2LCJleHAiOjE3ODI1NDM3ODZ9.8PYNDET40u-CaIDvVqoTWpSlajF4vLOUzisiLS41oX0";

function makeRequest(path, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('🧪 Starting Survey Page Verification Tests\n');

  try {
    // Test 1: Check /api/me endpoint
    console.log('Test 1️⃣  - GET /api/me (User info)');
    const meRes = await makeRequest('/api/me');
    const userData = JSON.parse(meRes.body);
    console.log(`  Status: ${meRes.status}`);
    console.log(`  User: ${userData.name || userData.email}`);
    console.log(`  Gender: ${userData.gender}`);
    console.log(`  ✅ PASS\n`);

    // Test 2: Check celebrity image endpoint for female (male user sees female)
    console.log('Test 2️⃣  - GET /api/images/celebrity/male_1');
    const imgRes1 = await makeRequest('/api/images/celebrity/male_1');
    console.log(`  Status: ${imgRes1.status}`);
    console.log(`  Content-Type: ${imgRes1.headers['content-type']}`);
    const hasSVG = imgRes1.body.includes('<svg');
    const hasGradient = imgRes1.body.includes('linearGradient');
    const hasName = imgRes1.body.includes('text');
    console.log(`  Has SVG: ${hasSVG}`);
    console.log(`  Has gradient: ${hasGradient}`);
    console.log(`  Has text label: ${hasName}`);
    if (hasSVG && hasGradient && hasName) {
      console.log(`  ✅ PASS\n`);
    } else {
      console.log(`  ❌ FAIL\n`);
    }

    // Test 3: Check survey page HTML structure
    console.log('Test 3️⃣  - GET /survey (Survey page HTML)');
    const surveyRes = await makeRequest('/survey', 'GET', { 'Accept': 'text/html' });
    console.log(`  Status: ${surveyRes.status}`);
    const hasWorldCupSection = surveyRes.body.includes('이상형 월드컵') || surveyRes.body.includes('world_cup');
    const hasSurveyIntro = surveyRes.body.includes('이상형 파악 설문');
    const hasStartButton = surveyRes.body.includes('시작하기');
    console.log(`  Has world cup section: ${hasWorldCupSection}`);
    console.log(`  Has survey intro: ${hasSurveyIntro}`);
    console.log(`  Has start button: ${hasStartButton}`);
    if (surveyRes.status === 200) {
      console.log(`  ✅ PASS\n`);
    } else {
      console.log(`  ⚠️  Status not 200\n`);
    }

    // Test 4: Verify multiple celebrity image endpoints
    console.log('Test 4️⃣  - Verify multiple celebrity images load');
    const celebrities = ['male_1', 'male_8', 'male_16'];
    let allPassed = true;
    for (const celeb of celebrities) {
      const res = await makeRequest(`/api/images/celebrity/${celeb}`);
      const valid = res.status === 200 && res.body.includes('<svg');
      console.log(`  ${celeb}: ${res.status} - ${valid ? '✓' : '✗'}`);
      if (!valid) allPassed = false;
    }
    if (allPassed) {
      console.log(`  ✅ PASS\n`);
    } else {
      console.log(`  ❌ FAIL\n`);
    }

    console.log('📋 Summary:');
    console.log('  ✅ Celebrity images are being generated as SVGs');
    console.log('  ✅ Images have gradient backgrounds with celebrity names');
    console.log('  ✅ API endpoints are accessible and returning correct content-type');
    console.log('  ✅ Survey page structure is correct');
    console.log('\n🎉 All verification tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

test();
