import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shortLivedToken } = await request.json();

    if (!shortLivedToken) {
      return NextResponse.json(
        { error: 'Short-lived token is required' },
        { status: 400 }
      );
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: 'Facebook app credentials not configured' },
        { status: 500 }
      );
    }

    // Step 1: Exchange short-lived user token for long-lived user token
    const userTokenResponse = await fetch(
      `https://graph.facebook.com/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortLivedToken}`
    );

    if (!userTokenResponse.ok) {
      const error = await userTokenResponse.text();
      return NextResponse.json(
        { error: 'Failed to exchange user token', details: error },
        { status: 400 }
      );
    }

    const userTokenData = await userTokenResponse.json();
    const longLivedUserToken = userTokenData.access_token;

    // Step 2: Get page access tokens using the long-lived user token
    const pageTokenResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${longLivedUserToken}`
    );

    if (!pageTokenResponse.ok) {
      const error = await pageTokenResponse.text();
      return NextResponse.json(
        { error: 'Failed to get page tokens', details: error },
        { status: 400 }
      );
    }

    const pageTokenData = await pageTokenResponse.json();

    // Step 3: Find the specific page token (if PAGE_ID is provided)
    const pageId = process.env.FACEBOOK_PAGE_ID;
    let targetPageToken = null;

    if (pageId && pageTokenData.data) {
      const targetPage = pageTokenData.data.find((page: { id: string; access_token: string }) => page.id === pageId);
      if (targetPage) {
        targetPageToken = targetPage.access_token;
      }
    }

    return NextResponse.json({
      success: true,
      longLivedUserToken,
      userTokenExpiresIn: userTokenData.expires_in,
      pages: pageTokenData.data,
      targetPageToken,
      message: targetPageToken 
        ? 'Page access token obtained (may never expire if you are page admin)'
        : 'Long-lived user token obtained (60 days)'
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current token info
export async function GET() {
  try {
    const currentToken = process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (!currentToken) {
      return NextResponse.json(
        { error: 'No access token configured' },
        { status: 400 }
      );
    }

    // Check token info
    const response = await fetch(
      `https://graph.facebook.com/me?access_token=${currentToken}&fields=id,name`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Token is invalid or expired' },
        { status: 400 }
      );
    }

    const tokenInfo = await response.json();

    // Get detailed token info
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${currentToken}&access_token=${currentToken}`
    );

    let debugInfo = null;
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      debugInfo = debugData.data;
    }

    return NextResponse.json({
      tokenValid: true,
      userInfo: tokenInfo,
      debugInfo,
      recommendations: [
        'If this is a short-lived token, exchange it for a long-lived one',
        'For page tokens, get a never-expiring token by using a long-lived user token',
        'Store the long-lived/never-expiring token in your .env file'
      ]
    });

  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json(
      { error: 'Failed to check token' },
      { status: 500 }
    );
  }
}
