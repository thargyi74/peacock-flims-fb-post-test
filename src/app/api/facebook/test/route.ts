import { NextResponse } from 'next/server';
import axios from 'axios';

// Cache for 1 minute - test route for debugging, short cache to see real-time issues
export const revalidate = 60;

export async function GET() {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!accessToken || !pageId) {
      return NextResponse.json(
        { error: 'Missing Facebook credentials in environment variables' },
        { status: 500 }
      );
    }

    // Test the access token by making a simple request
    const testUrl = `https://graph.facebook.com/v19.0/me?access_token=${accessToken}`;
    
    try {
      const testResponse = await axios.get(testUrl);
      console.log('Access token test response:', testResponse.data);
    } catch (tokenError) {
      console.error('Access token test failed:', tokenError);
      if (axios.isAxiosError(tokenError) && tokenError.response?.data) {
        return NextResponse.json(
          { 
            error: 'Invalid access token',
            details: tokenError.response.data
          },
          { status: 400 }
        );
      }
    }

    // Test page access
    const pageUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=id,name&access_token=${accessToken}`;
    
    try {
      const pageResponse = await axios.get(pageUrl);
      return NextResponse.json({
        message: 'Facebook API connection successful',
        tokenInfo: 'Valid',
        pageInfo: pageResponse.data
      });
    } catch (pageError) {
      console.error('Page access test failed:', pageError);
      if (axios.isAxiosError(pageError) && pageError.response?.data) {
        return NextResponse.json(
          { 
            error: 'Cannot access page',
            details: pageError.response.data
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json(
      { error: 'Failed to test Facebook API connection' },
      { status: 500 }
    );
  }
}
