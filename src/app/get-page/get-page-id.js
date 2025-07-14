const token =
  "EAAFCJnkhhBsBPFucaJPnkaL65z0kkdNLfrISBznj3FURJlKZAJPXW4kOyW3nfiFpUzfZBZBUhs3BPQaxs58sDZC9wBOTYBKQtS1N8qSEVBJ6dfZCKhP3p0XleOqB6UDRU4RCMSYbZB7W8AEBK6gLZBDkExFiXym24nxY11L5ZANYUHpChNznyvEmZCj6tWvZABvQhg4g0qP2Ux3MZC19JaLRNa9e07v2GiDQjplble5vuuLRBASYjoKBiWbkidR3CUZD";

async function getPageId() {
  try {
    const response = await fetch(`https://graph.facebook.com/me/accounts?access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Error:', data.error);
      return;
    }
    
    console.log('Raw response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('Pages associated with this account:');
      data.data.forEach(page => {
        console.log(`Name: ${page.name}`);
        console.log(`ID: ${page.id}`);
        console.log(`Category: ${page.category}`);
        console.log('---');
      });
    } else {
      console.log('No pages found. You may need to create a Facebook page first.');
    }
  } catch (error) {
    console.error('Failed to fetch page ID:', error);
  }
}

getPageId();