import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userToken = searchParams.get('user_token') || process.env.FACEBOOK_ACCESS_TOKEN;
    const pageId = searchParams.get('page_id') || process.env.FACEBOOK_PAGE_ID;
    
    if (!userToken || !pageId) {
      return NextResponse.json(
        { error: 'Missing user_token or page_id' },
        { status: 400 }
      );
    }

    const solutions = [];

    // Method 1: Try to get page access token through /{page-id}?fields=access_token
    console.log('🔍 Method 1: Direct page access token request...');
    try {
      const pageTokenResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${userToken}`
      );
      const pageTokenData = await pageTokenResponse.json();
      
      if (pageTokenData.access_token) {
        solutions.push({
          method: 'Direct Page Token',
          success: true,
          pageAccessToken: pageTokenData.access_token,
          instructions: 'Use this Page Access Token in your .env file'
        });
      } else {
        solutions.push({
          method: 'Direct Page Token',
          success: false,
          error: pageTokenData.error || 'No access token returned',
          explanation: 'You may not have admin access to this page through your current app'
        });
      }
    } catch (fetchError: unknown) {
      console.error('Direct page token error:', fetchError);
      solutions.push({
        method: 'Direct Page Token',
        success: false,
        error: 'Network error'
      });
    }

    // Method 2: Check if page exists and is accessible
    console.log('🔍 Method 2: Page existence check...');
    try {
      const pageInfoResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,category&access_token=${userToken}`
      );
      const pageInfoData = await pageInfoResponse.json();
      
      solutions.push({
        method: 'Page Existence Check',
        success: !pageInfoData.error,
        data: pageInfoData.error ? null : pageInfoData,
        error: pageInfoData.error || null
      });
    } catch (fetchError: unknown) {
      console.error('Page existence check error:', fetchError);
      solutions.push({
        method: 'Page Existence Check',
        success: false,
        error: 'Network error'
      });
    }

    // Method 3: Check user's permissions
    console.log('🔍 Method 3: User permissions check...');
    try {
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/permissions?access_token=${userToken}`
      );
      const permissionsData = await permissionsResponse.json();
      
      const grantedPermissions = permissionsData.data?.filter((perm: { status: string; }) => perm.status === 'granted').map((perm: { permission: string }) => perm.permission) || [];
      
      solutions.push({
        method: 'User Permissions',
        success: !permissionsData.error,
        grantedPermissions,
        error: permissionsData.error || null
      });
    } catch (fetchError: unknown) {
      console.error('User permissions error:', fetchError);
      solutions.push({
        method: 'User Permissions',
        success: false,
        error: 'Network error'
      });
    }

    // Alternative solutions
    const alternatives = [
      {
        title: 'Facebook Graph API Explorer',
        steps: [
          '1. Go to https://developers.facebook.com/tools/explorer/',
          '2. Select your Facebook app from the dropdown',
          '3. Look for "Page Access Tokens" section on the right',
          '4. Find your page (DVB Peacock Film Festival)',
          '5. Copy the Page Access Token',
          '6. Update your .env file with the Page Access Token'
        ]
      },
      {
        title: 'Business Manager Method',
        steps: [
          '1. Go to Facebook Business Manager',
          '2. Add your page to Business Manager if not already added',
          '3. Connect your Facebook app to the page',
          '4. Generate Page Access Token through Business settings'
        ]
      },
      {
        title: 'App Dashboard Method',
        steps: [
          '1. Go to your Facebook App Dashboard',
          '2. Go to Tools > Graph API Explorer',
          '3. Select your app and get User token with pages_manage_posts permission',
          '4. Use /me/accounts endpoint to get Page tokens',
          '5. If still empty, connect your page to your app first'
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      pageId,
      userToken: userToken.substring(0, 20) + '...',
      solutions,
      alternatives,
      recommendation: solutions.find(s => s.success && s.pageAccessToken) 
        ? 'Use the Page Access Token found above'
        : 'Use Facebook Graph API Explorer method for guaranteed success',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get page token error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get page access token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
