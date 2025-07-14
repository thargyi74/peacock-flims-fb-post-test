#!/usr/bin/env node

/**
 * Test System User Token
 * 
 * This script helps you test a Facebook System User token
 * Usage: node scripts/test-system-user-token.js YOUR_SYSTEM_USER_TOKEN
 */

const https = require('https');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve({ error: 'Invalid JSON response', raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function testSystemUserToken(token) {
  console.log('🔍 Testing System User Token...\n');
  
  // Test 1: Debug Token
  console.log('1. Debugging token information...');
  try {
    const debugUrl = `https://graph.facebook.com/v19.0/debug_token?input_token=${token}&access_token=${token}`;
    const debugResponse = await makeRequest(debugUrl);
    
    if (debugResponse.data) {
      const tokenInfo = debugResponse.data;
      console.log('✅ Token is valid');
      console.log(`   App ID: ${tokenInfo.app_id}`);
      console.log(`   Type: ${tokenInfo.type}`);
      console.log(`   User ID: ${tokenInfo.user_id || 'N/A'}`);
      console.log(`   Expires: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toISOString() : 'Never'}`);
      console.log(`   Scopes: ${tokenInfo.scopes ? tokenInfo.scopes.join(', ') : 'N/A'}`);
    } else {
      console.log('❌ Token debug failed:', debugResponse.error?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Token debug error:', error.message);
    return false;
  }
  
  console.log('');
  
  // Test 2: Get Pages
  console.log('2. Fetching accessible pages...');
  try {
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`;
    const pagesResponse = await makeRequest(pagesUrl);
    
    if (pagesResponse.data && Array.isArray(pagesResponse.data)) {
      console.log(`✅ Found ${pagesResponse.data.length} accessible page(s):`);
      pagesResponse.data.forEach(page => {
        console.log(`   - ${page.name} (ID: ${page.id})`);
        console.log(`     Permissions: ${page.perms ? page.perms.join(', ') : 'N/A'}`);
      });
      
      // Check for target page
      const targetPage = pagesResponse.data.find(page => page.id === '396720486865677');
      if (targetPage) {
        console.log('✅ Target page "DVB Peacock Film Festival" is accessible');
      } else {
        console.log('⚠️  Target page "DVB Peacock Film Festival" not found in accessible pages');
      }
    } else {
      console.log('❌ Failed to fetch pages:', pagesResponse.error?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Pages fetch error:', error.message);
    return false;
  }
  
  console.log('');
  
  // Test 3: Fetch Posts from Target Page
  console.log('3. Testing posts access for DVB Peacock Film Festival...');
  try {
    const postsUrl = `https://graph.facebook.com/v19.0/396720486865677/posts?fields=id,message,created_time,permalink_url&limit=3&access_token=${token}`;
    const postsResponse = await makeRequest(postsUrl);
    
    if (postsResponse.data && Array.isArray(postsResponse.data)) {
      console.log(`✅ Successfully fetched ${postsResponse.data.length} posts:`);
      postsResponse.data.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.message ? post.message.substring(0, 50) + '...' : 'No message'}`);
        console.log(`      Created: ${post.created_time}`);
        console.log(`      URL: ${post.permalink_url}`);
      });
    } else {
      console.log('❌ Failed to fetch posts:', postsResponse.error?.message || 'Unknown error');
      if (postsResponse.error?.code === 190) {
        console.log('   This usually means the token is invalid or expired');
      } else if (postsResponse.error?.code === 200) {
        console.log('   This usually means insufficient permissions for the page');
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Posts fetch error:', error.message);
    return false;
  }
  
  console.log('');
  console.log('🎉 All tests passed! Your System User token is working correctly.');
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Update your .env file with this token');
  console.log('   2. Set FACEBOOK_ACCESS_TOKEN to this system user token');
  console.log('   3. This token never expires, so no refresh mechanism needed');
  
  return true;
}

// Main execution
const token = process.argv[2];

if (!token) {
  console.log('❌ Please provide a System User token as an argument');
  console.log('Usage: node scripts/test-system-user-token.js YOUR_SYSTEM_USER_TOKEN');
  process.exit(1);
}

console.log('Facebook System User Token Tester');
console.log('=================================\n');

testSystemUserToken(token)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  });
