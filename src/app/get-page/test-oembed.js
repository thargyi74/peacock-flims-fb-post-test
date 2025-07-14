const accessToken = "EAAKZAmSAAO3oBPF61zz4AIvVryXBZCMwBInhOquHD1reu2aisMYUGVnAACJQ924BFwxNMOlTc0TnfqGXoRgx4cHgrEwY8Gu4zVF99L0EwqhZAXHslzvRZAjOY5TTwdBTZA3BxLJzZCZA4EdGbAIXs3iqGLflse6ZCEnaRM6ZANcXnKtfGFMZAjZAJX9UfILZBoZBNlZBCouhUy9RuhzdkgiwYuNsLk1ZAuIHOdUdghRofKOl4jLmgGeki1Q0K62DZAw3OgZDZD";

async function testOEmbedAPI() {
  try {
    console.log('Testing Facebook oEmbed API...');
    
    // Test with the page URL (will show general page info)
    const pageUrl = "https://www.facebook.com/396720486865677";
    
    console.log(`\nTesting with page URL: ${pageUrl}`);
    
    const response = await fetch(`https://graph.facebook.com/v18.0/oembed_post?url=${encodeURIComponent(pageUrl)}&access_token=${accessToken}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ oEmbed API Error:', data.error);
      
      // Try different approach - get page info first
      console.log('\n📝 Alternative approach - get page info:');
      const pageResponse = await fetch(`https://graph.facebook.com/396720486865677?fields=id,name,about,picture,cover,link&access_token=${accessToken}`);
      const pageData = await pageResponse.json();
      
      if (pageData.error) {
        console.error('❌ Page info error:', pageData.error);
      } else {
        console.log('✅ Page info retrieved successfully:');
        console.log(`Name: ${pageData.name}`);
        console.log(`About: ${pageData.about}`);
        console.log(`Link: ${pageData.link}`);
        console.log(`Picture: ${pageData.picture?.data?.url}`);
        
        // Show how to embed the page
        console.log('\n🔗 Facebook Page Embed Code:');
        console.log(`<div class="fb-page" data-href="${pageData.link}" data-tabs="timeline" data-width="500" data-height="400" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true"></div>`);
      }
    } else {
      console.log('✅ oEmbed API Success:');
      console.log('Author Name:', data.author_name);
      console.log('Author URL:', data.author_url);
      console.log('Width:', data.width);
      console.log('Height:', data.height);
      console.log('HTML:', data.html);
    }
    
    // Show instructions for using specific posts
    console.log('\n📋 Instructions for embedding specific posts:');
    console.log('1. Go to your Facebook page: https://www.facebook.com/396720486865677');
    console.log('2. Find a specific post you want to embed');
    console.log('3. Copy the post URL (e.g., https://www.facebook.com/396720486865677/posts/123456789)');
    console.log('4. Use that URL with the oEmbed API');
    console.log('5. Example: https://graph.facebook.com/v18.0/oembed_post?url=POST_URL&access_token=YOUR_TOKEN');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOEmbedAPI();