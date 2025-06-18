# Facebook Page Posts Setup Guide

This guide will help you set up the Facebook Graph API integration to display posts from your Facebook page.

## Prerequisites

1. **Facebook Developer Account**: You need a Facebook developer account
2. **Facebook Page**: You need to be an admin or editor of a Facebook page
3. **Facebook App**: You need to create a Facebook app with appropriate permissions

## Step-by-Step Setup

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Business" as the app type
4. Fill in the app details and create the app

### 2. Add Required Products

In your Facebook app dashboard:

1. **Add Facebook Login Product**:
   - Go to "Products" in the left sidebar
   - Click "+" next to Facebook Login
   - Add Facebook Login to your app

2. **Configure Facebook Login**:
   - Go to Facebook Login > Settings
   - Add your website URL to "Valid OAuth Redirect URIs"
   - For development: `http://localhost:3001`

### 3. Get Required Permissions

Your app needs these permissions:
- `pages_read_engagement` - To read engagement data (likes, comments, shares)
- `pages_read_user_content` - To read posts from pages you manage

### 4. Generate Access Tokens

#### Option A: Using Graph API Explorer (Recommended for Testing)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Select the required permissions:
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `pages_show_list` (to list your pages)
5. Generate the token

#### Option B: Using Access Token Tool

1. Go to [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
2. Find your app and click "Generate Token"
3. This gives you a User Access Token

### 5. Convert User Token to Page Token

If you have a User Access Token, you need to convert it to a Page Access Token:

1. Use our helper endpoint:
   ```
   http://localhost:3001/api/facebook/page-token?user_token=YOUR_USER_ACCESS_TOKEN
   ```
2. Copy the `access_token` for your desired page
3. Also copy the `id` of your page

### 6. Configure Environment Variables

Update your `.env.local` file:

```bash
# Use the Page Access Token (not User Access Token)
FACEBOOK_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_PAGE_ID=your_facebook_page_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 7. Restart and Test

1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3001` to see your Facebook posts

## Testing Your Setup

### Test API Connection
Visit: `http://localhost:3001/api/facebook/test`

This should return:
```json
{
  "message": "Facebook API connection successful",
  "tokenInfo": "Valid",
  "pageInfo": {
    "id": "your_page_id",
    "name": "Your Page Name"
  }
}
```

### Test Posts Endpoint
Visit: `http://localhost:3001/api/facebook/posts`

This should return your page posts.

## Common Issues

### "Page Access Token Required"
- **Problem**: You're using a User Access Token instead of a Page Access Token
- **Solution**: Use the page token helper endpoint to get the correct token

### "Invalid OAuth 2.0 Access Token"
- **Problem**: Your access token is invalid or expired
- **Solution**: Generate a new access token with proper permissions

### "No pages found"
- **Problem**: Your User Access Token doesn't have access to any pages
- **Solution**: Make sure you're an admin/editor of the page and have proper permissions

### "Access denied"
- **Problem**: Missing required permissions
- **Solution**: Regenerate token with `pages_read_engagement` and `pages_read_user_content` permissions

## App Review (For Production)

For production use, you'll need to submit your app for review:

1. Go to your Facebook app dashboard
2. Navigate to "App Review"
3. Submit the required permissions for review
4. Provide detailed information about how you'll use the permissions

## Token Security

⚠️ **Important Security Notes**:
- Never expose access tokens in client-side code
- Store tokens securely in environment variables
- Use HTTPS in production
- Regularly rotate access tokens
- Consider using long-lived tokens for production

## Getting Help

If you encounter issues:

1. Check the browser console for detailed error messages
2. Visit the test endpoints to debug step by step
3. Verify your Facebook app settings and permissions
4. Check Facebook's API documentation for any changes

## Useful Links

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Facebook Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
- [Facebook App Dashboard](https://developers.facebook.com/apps/)
