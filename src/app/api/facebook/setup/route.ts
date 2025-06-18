import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Facebook Token Setup Helper",
    instructions: [
      "1. Go to Facebook Graph API Explorer: https://developers.facebook.com/tools/explorer/",
      "2. Select your app and generate a User Access Token with these permissions:",
      "   - pages_read_engagement",
      "   - pages_read_user_content", 
      "   - pages_show_list",
      "3. Copy your User Access Token",
      "4. Visit: /api/facebook/page-token?user_token=YOUR_USER_ACCESS_TOKEN",
      "5. Copy the Page Access Token from the response",
      "6. Update FACEBOOK_ACCESS_TOKEN in your .env.local file",
      "7. Restart the development server"
    ],
    currentPageId: process.env.FACEBOOK_PAGE_ID || "Not configured",
    links: {
      graphApiExplorer: "https://developers.facebook.com/tools/explorer/",
      pageTokenHelper: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/facebook/page-token?user_token=YOUR_USER_ACCESS_TOKEN`
    }
  });
}
