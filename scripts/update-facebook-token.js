const fs = require('fs');
const path = require('path');

/**
 * Script to help update Facebook access token in .env file
 * 
 * Usage:
 * node scripts/update-facebook-token.js [new_token]
 * 
 * Or run without arguments to get instructions
 */

async function updateFacebookToken(newToken) {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    return;
  }

  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace or add FACEBOOK_ACCESS_TOKEN
    const tokenRegex = /^FACEBOOK_ACCESS_TOKEN=.*$/m;
    
    if (tokenRegex.test(envContent)) {
      envContent = envContent.replace(tokenRegex, `FACEBOOK_ACCESS_TOKEN=${newToken}`);
      console.log('✅ Updated existing FACEBOOK_ACCESS_TOKEN');
    } else {
      envContent += `\nFACEBOOK_ACCESS_TOKEN=${newToken}\n`;
      console.log('✅ Added new FACEBOOK_ACCESS_TOKEN');
    }
    
    // Create backup
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, fs.readFileSync(envPath));
    console.log(`📦 Backup created: ${backupPath}`);
    
    // Write updated content
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully');
    
    // Test the new token
    console.log('🔍 Testing new token...');
    await testToken(newToken);
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
}

async function testToken(token) {
  try {
    const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Token is valid');
      console.log(`   User: ${data.name || 'Unknown'}`);
      console.log(`   ID: ${data.id || 'Unknown'}`);
      
      // Check if it's a page token by trying to get page info
      const pageResponse = await fetch(`https://graph.facebook.com/${process.env.FACEBOOK_PAGE_ID || 'me'}?access_token=${token}&fields=name,id,fan_count`);
      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        if (pageData.fan_count !== undefined) {
          console.log('✅ This appears to be a page access token');
          console.log(`   Page: ${pageData.name}`);
          console.log(`   Followers: ${pageData.fan_count}`);
        }
      }
    } else {
      console.error('❌ Token test failed:', data.error?.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error testing token:', error.message);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const newToken = args[0];

if (!newToken) {
  console.log(`
🔧 Facebook Token Updater

This script helps you update your Facebook access token in the .env file.

Usage:
  node scripts/update-facebook-token.js <your_new_token>

To get a long-lived token:
  1. Go to http://localhost:3000/token-manager
  2. Follow the instructions to get a never-expiring page token
  3. Copy the token and run this script with it

Example:
  node scripts/update-facebook-token.js EAAKZAmSAAO3oBP...

Current token in .env: ${process.env.FACEBOOK_ACCESS_TOKEN ? 'Set' : 'Not set'}
Current page ID: ${process.env.FACEBOOK_PAGE_ID || 'Not set'}
`);
  process.exit(0);
}

if (newToken.length < 100) {
  console.error('❌ Token seems too short. Facebook tokens are usually much longer.');
  process.exit(1);
}

updateFacebookToken(newToken);
