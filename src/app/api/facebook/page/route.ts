import { NextResponse } from 'next/server';

// Cache for 1 hour - page info changes rarely
export const revalidate = 3600;

export async function GET() {
  try {
    const pageToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    if (!pageToken || !pageId) {
      return NextResponse.json(
        { error: 'Missing Facebook configuration. Please check FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID.' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,picture{url},cover{source},fan_count&access_token=${pageToken}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page info: ${response.status}`);
    }
    
    const pageInfo = await response.json();
    
    if (pageInfo.error) {
      const errorResponse = NextResponse.json(
        { error: 'Facebook API Error', details: pageInfo.error },
        { status: 400 }
      );
      // Don't cache error responses
      errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return errorResponse;
    }
    
    const successResponse = NextResponse.json(pageInfo);
    
    // Set cache headers for page info (longer cache since it changes rarely)
    successResponse.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return successResponse;
  } catch (error) {
    console.error('Page API Error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch page info from Facebook Graph API' },
      { status: 500 }
    );
    
    // Don't cache error responses
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return errorResponse;
  }
}
