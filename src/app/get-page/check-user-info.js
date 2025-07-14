const token =
  "EAAFCJnkhhBsBPFucaJPnkaL65z0kkdNLfrISBznj3FURJlKZAJPXW4kOyW3nfiFpUzfZBZBUhs3BPQaxs58sDZC9wBOTYBKQtS1N8qSEVBJ6dfZCKhP3p0XleOqB6UDRU4RCMSYbZB7W8AEBK6gLZBDkExFiXym24nxY11L5ZANYUHpChNznyvEmZCj6tWvZABvQhg4g0qP2Ux3MZC19JaLRNa9e07v2GiDQjplble5vuuLRBASYjoKBiWbkidR3CUZD";
const userId = "100005819523806";

async function checkUserInfo() {
  try {
    console.log('Checking current token user info...');
    const meResponse = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
    const meData = await meResponse.json();
    
    if (meData.error) {
      console.error('Error:', meData.error);
    } else {
      console.log('Current token belongs to:');
      console.log(`Name: ${meData.name}`);
      console.log(`ID: ${meData.id}`);
    }
    
    console.log(`\nExpected User ID: ${userId}`);
    console.log(`Token User ID: ${meData.id}`);
    console.log(`Match: ${meData.id === userId ? '✅ YES' : '❌ NO'}`);
    
    if (meData.id !== userId) {
      console.log('\n⚠️  Warning: Token belongs to a different user!');
      console.log('You may need to generate a new token for the correct user account.');
    }
    
  } catch (error) {
    console.error('Failed to check user info:', error);
  }
}

checkUserInfo();