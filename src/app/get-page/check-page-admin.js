const token =
  "EAAFCJnkhhBsBPFucaJPnkaL65z0kkdNLfrISBznj3FURJlKZAJPXW4kOyW3nfiFpUzfZBZBUhs3BPQaxs58sDZC9wBOTYBKQtS1N8qSEVBJ6dfZCKhP3p0XleOqB6UDRU4RCMSYbZB7W8AEBK6gLZBDkExFiXym24nxY11L5ZANYUHpChNznyvEmZCj6tWvZABvQhg4g0qP2Ux3MZC19JaLRNa9e07v2GiDQjplble5vuuLRBASYjoKBiWbkidR3CUZD";
const pageId = "731832899353466";

async function checkPageAdmin() {
  try {
    console.log(`Checking if you're admin of page ${pageId}...`);
    
    // First, get all pages you admin
    const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${token}`);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('Error getting pages:', pagesData.error);
      return;
    }
    
    const targetPage = pagesData.data.find(page => page.id === pageId);
    
    if (targetPage) {
      console.log('✅ YES! You are an admin of this page:');
      console.log(`Name: ${targetPage.name}`);
      console.log(`ID: ${targetPage.id}`);
      console.log(`Category: ${targetPage.category}`);
      console.log(`Tasks: ${targetPage.tasks.join(', ')}`);
    } else {
      console.log('❌ NO! You are not an admin of this page.');
      
      // Try to get page info anyway
      console.log('\nTrying to get page info...');
      const pageResponse = await fetch(`https://graph.facebook.com/${pageId}?access_token=${token}`);
      const pageData = await pageResponse.json();
      
      if (pageData.error) {
        console.error('Page info error:', pageData.error);
      } else {
        console.log('Page info:');
        console.log(`Name: ${pageData.name}`);
        console.log(`ID: ${pageData.id}`);
        console.log(`Category: ${pageData.category}`);
      }
    }
    
  } catch (error) {
    console.error('Failed to check page admin:', error);
  }
}

checkPageAdmin();