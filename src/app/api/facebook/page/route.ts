import { NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'Facebook API Error', details: pageInfo.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(pageInfo);
  } catch (error) {
    console.error('Page API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page info from Facebook Graph API' },
      { status: 500 }
    );
  }
}
