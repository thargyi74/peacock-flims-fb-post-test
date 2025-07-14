const pageId = "396720486865677";
const accessToken = "EAAKZAmSAAO3oBPIDt2XZBbZCmZAXAnoSk3jSXdJtjZBUXFVzjNXNc3uHD9z524oLbBNVrbvP0YyY065dDaO6YZCM6DdXtxO9J2sWmfXdZBCaZBJVQPQzH2v6AddocMZCvmBZBBPlbpATPGbVZBMunhXeQjGT32HtASf6jhu6bvJFJZCuhbZAkBwxtYL9OIF7tEpyWxk7U0Pot4LSqI9t0SmLNJjASRHUZCb92hyMIndePxVVaiPRGZA2n1Ft9hONXtg2IMZD";

async function fetchPublicPosts() {
  try {
    console.log('Fetching public page information...');
    
    // First get basic page info
    const pageResponse = await fetch(`https://graph.facebook.com/${pageId}?fields=id,name,about,category,picture,cover&access_token=${accessToken}`);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.error('❌ Error fetching page info:', pageData.error);
      return;
    }
    
    console.log('✅ Page Information:');
    console.log(`Name: ${pageData.name}`);
    console.log(`ID: ${pageData.id}`);
    console.log(`About: ${pageData.about || 'No description'}`);
    console.log(`Category: ${pageData.category || 'No category'}`);
    
    if (pageData.picture) {
      console.log(`Profile Picture: ${pageData.picture.data.url}`);
    }
    
    if (pageData.cover) {
      console.log(`Cover Photo: ${pageData.cover.source}`);
    }
    
    console.log('---');
    
    // Try to get posts using different approaches
    console.log('Attempting to fetch posts...');
    
    // Method 1: Try with minimal fields
    let response = await fetch(`https://graph.facebook.com/${pageId}/posts?fields=id,message,created_time&access_token=${accessToken}`);
    let data = await response.json();
    
    if (data.error) {
      console.log('❌ Posts access failed:', data.error.message);
      console.log('\n📝 Note: To read posts, you need:');
      console.log('1. A proper Page Access Token (not User Access Token)');
      console.log('2. Your app must be approved for pages_read_engagement permission');
      console.log('3. You must be an admin of the page');
      
      // Show alternative approaches
      console.log('\n🔄 Alternative approaches:');
      console.log('1. Use Facebook SDK in a web app with proper authentication');
      console.log('2. Use Facebook\'s public post embeds');
      console.log('3. Submit your app for review to get proper permissions');
    } else {
      console.log(`✅ Successfully fetched ${data.data.length} posts!`);
      // Process posts here
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch posts:', error);
  }
}

fetchPublicPosts();