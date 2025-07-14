const token =
  "EAAFCJnkhhBsBPFucaJPnkaL65z0kkdNLfrISBznj3FURJlKZAJPXW4kOyW3nfiFpUzfZBZBUhs3BPQaxs58sDZC9wBOTYBKQtS1N8qSEVBJ6dfZCKhP3p0XleOqB6UDRU4RCMSYbZB7W8AEBK6gLZBDkExFiXym24nxY11L5ZANYUHpChNznyvEmZCj6tWvZABvQhg4g0qP2Ux3MZC19JaLRNa9e07v2GiDQjplble5vuuLRBASYjoKBiWbkidR3CUZD";

async function getProfiles() {
  try {
    console.log('Checking personal profile...');
    const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Error:', data.error);
      return;
    }
    
    console.log('Personal Profile:');
    console.log(`Name: ${data.name}`);
    console.log(`ID: ${data.id}`);
    console.log('---');
    
    // Check if user has any business profiles
    console.log('\nChecking business profiles...');
    const businessResponse = await fetch(`https://graph.facebook.com/me/business_users?access_token=${token}`);
    const businessData = await businessResponse.json();
    
    if (businessData.error) {
      console.error('Business profiles error:', businessData.error);
    } else {
      console.log('Business profiles:', JSON.stringify(businessData, null, 2));
    }
    
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
  }
}

getProfiles();