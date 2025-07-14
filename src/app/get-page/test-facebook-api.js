const pageId = "396720486865677";
const accessToken = "EAAKZAmSAAO3oBPIDt2XZBbZCmZAXAnoSk3jSXdJtjZBUXFVzjNXNc3uHD9z524oLbBNVrbvP0YyY065dDaO6YZCM6DdXtxO9J2sWmfXdZBCaZBJVQPQzH2v6AddocMZCvmBZBBPlbpATPGbVZBMunhXeQjGT32HtASf6jhu6bvJFJZCuhbZAkBwxtYL9OIF7tEpyWxk7U0Pot4LSqI9t0SmLNJjASRHUZCb92hyMIndePxVVaiPRGZA2n1Ft9hONXtg2IMZD";

async function testFacebookAPI() {
  try {
    console.log('Testing Facebook API connection...');
    console.log(`Page ID: ${pageId}`);
    
    // First, verify the page and token
    const pageResponse = await fetch(`https://graph.facebook.com/${pageId}?access_token=${accessToken}`);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.error('❌ Page access error:', pageData.error);
      return;
    }
    
    console.log('✅ Page access successful:');
    console.log(`Name: ${pageData.name}`);
    console.log(`ID: ${pageData.id}`);
    console.log(`Category: ${pageData.category}`);
    
    // Test posting a simple message
    console.log('\nTesting post creation...');
    const formData = new URLSearchParams();
    formData.append('message', 'Test post from API - DVB Peacock Film Festival page verification ✅');
    formData.append('access_token', accessToken);
    
    const postResponse = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    const postResult = await postResponse.json();
    
    if (postResult.error) {
      console.error('❌ Post creation error:', postResult.error);
    } else {
      console.log('✅ Post created successfully!');
      console.log(`Post ID: ${postResult.id}`);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testFacebookAPI();