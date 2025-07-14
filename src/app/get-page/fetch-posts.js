const pageId = "396720486865677";
const accessToken = "EAAKZAmSAAO3oBPMwFhBbVv26Yua5nhMsBYrZCIhgxOuNZCEZCuZAzrAxu7C4frLFhHOGV5uljPVZBjCmA2im4HP5tUJb0uMNITRjxWvhmOgnNsTZBF5gBdMeXznpsrvTvhMTKprIOmWiZCvWxn1TTunoZCBNHSA9DZBVqLIjvJLLAfJv4J6sDhhHDSBlcYQRgF3isseL75QaA6PAjNgq98R7nT4pQQ1McCNipxF3jUYZBZAofXjU0JZBOGGiWbbSpBgZDZD";

async function fetchPosts() {
  try {
    console.log('Fetching posts from DVB Peacock Film Festival page...');
    
    // Try different endpoints for reading posts
    console.log('Trying posts endpoint...');
    let response = await fetch(`https://graph.facebook.com/${pageId}/posts?fields=id,message,created_time,attachments{media,type,url},full_picture,permalink_url&access_token=${accessToken}`);
    let data = await response.json();
    
    if (data.error) {
      console.log('Posts endpoint failed, trying feed endpoint...');
      response = await fetch(`https://graph.facebook.com/${pageId}/feed?fields=id,message,created_time,attachments{media,type,url},full_picture,permalink_url&access_token=${accessToken}`);
      data = await response.json();
    }
    
    if (data.error) {
      console.log('Feed endpoint failed, trying published_posts endpoint...');
      response = await fetch(`https://graph.facebook.com/${pageId}/published_posts?fields=id,message,created_time,attachments{media,type,url},full_picture,permalink_url&access_token=${accessToken}`);
      data = await response.json();
    }
    
    if (data.error) {
      console.error('❌ Error fetching posts:', data.error);
      return;
    }
    
    console.log(`✅ Found ${data.data.length} posts:`);
    console.log('---');
    
    data.data.forEach((post, index) => {
      console.log(`Post ${index + 1}:`);
      console.log(`ID: ${post.id}`);
      console.log(`Created: ${post.created_time}`);
      console.log(`Message: ${post.message || 'No message'}`);
      
      if (post.full_picture) {
        console.log(`Full Picture: ${post.full_picture}`);
      }
      
      if (post.attachments && post.attachments.data) {
        console.log('Attachments:');
        post.attachments.data.forEach((attachment, i) => {
          console.log(`  ${i + 1}. Type: ${attachment.type}`);
          if (attachment.media && attachment.media.image) {
            console.log(`     Image: ${attachment.media.image.src}`);
          }
          if (attachment.url) {
            console.log(`     URL: ${attachment.url}`);
          }
        });
      }
      
      if (post.permalink_url) {
        console.log(`Permalink: ${post.permalink_url}`);
      }
      
      console.log('---');
    });
    
    // Show pagination info
    if (data.paging) {
      console.log('Pagination available:');
      if (data.paging.next) {
        console.log(`Next: ${data.paging.next}`);
      }
      if (data.paging.previous) {
        console.log(`Previous: ${data.paging.previous}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch posts:', error);
  }
}

fetchPosts();