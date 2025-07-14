const pageId = "396720486865677";
const accessToken =
  "EAAFCJnkhhBsBPFucaJPnkaL65z0kkdNLfrISBznj3FURJlKZAJPXW4kOyW3nfiFpUzfZBZBUhs3BPQaxs58sDZC9wBOTYBKQtS1N8qSEVBJ6dfZCKhP3p0XleOqB6UDRU4RCMSYbZB7W8AEBK6gLZBDkExFiXym24nxY11L5ZANYUHpChNznyvEmZCj6tWvZABvQhg4g0qP2Ux3MZC19JaLRNa9e07v2GiDQjplble5vuuLRBASYjoKBiWbkidR3CUZD";

async function checkPageRole() {
  try {
    console.log('Checking your role on the page...');
    
    // Check if you can access page roles
    const rolesResponse = await fetch(`https://graph.facebook.com/${pageId}/roles?access_token=${accessToken}`);
    const rolesData = await rolesResponse.json();
    
    if (rolesData.error) {
      console.error('❌ Cannot access page roles:', rolesData.error);
      
      // Alternative: Check if you can access page insights (admin-only)
      console.log('\nTrying alternative check - page insights (admin only)...');
      const insightsResponse = await fetch(`https://graph.facebook.com/${pageId}/insights?access_token=${accessToken}`);
      const insightsData = await insightsResponse.json();
      
      if (insightsData.error) {
        console.error('❌ Cannot access page insights:', insightsData.error);
        console.log('This suggests you may not have admin privileges');
      } else {
        console.log('✅ Can access page insights - you likely have admin privileges');
      }
    } else {
      console.log('✅ Page roles accessible:');
      console.log('Raw roles data:', JSON.stringify(rolesData, null, 2));
    }
    
    // Check what permissions this token has
    console.log('\nChecking token permissions...');
    const tokenResponse = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`);
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Token debug error:', tokenData.error);
    } else {
      console.log('Token info:', JSON.stringify(tokenData, null, 2));
    }
    
  } catch (error) {
    console.error('Failed to check page role:', error);
  }
}

checkPageRole();