import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Test 1: Debug the token
    console.log('🔍 Testing System User Token...');
    
    const debugResponse = await fetch(
      `https://graph.facebook.com/v19.0/debug_token?input_token=${token}&access_token=${token}`
    );
    const debugData = await debugResponse.json();
    
    if (!debugData.data || !debugData.data.is_valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        details: debugData.error?.message || 'Token validation failed'
      }, { status: 400 });
    }

    const tokenInfo = debugData.data;
    const isNeverExpiring = !tokenInfo.expires_at;
    const isSystemUser = tokenInfo.type === 'USER';

    // Test 2: Check page access
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`
    );
    const pagesData = await pagesResponse.json();
    
    if (!pagesData.data) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch pages',
        details: pagesData.error?.message || 'Pages access failed'
      }, { status: 400 });
    }

    const targetPage = pagesData.data.find(
      (page: { id: string; name: string; perms?: string[] }) => page.id === process.env.FACEBOOK_PAGE_ID
    );

    // Test 3: Try to fetch posts
    let postsTest = null;
    if (targetPage) {
      try {
        const postsResponse = await fetch(
          `https://graph.facebook.com/v19.0/${process.env.FACEBOOK_PAGE_ID}/posts?fields=id,message,created_time&limit=1&access_token=${token}`
        );
        const postsData = await postsResponse.json();
        
        if (postsData.data && Array.isArray(postsData.data)) {
          postsTest = {
            success: true,
            postsFound: postsData.data.length,
            message: 'Posts access successful'
          };
        } else {
          postsTest = {
            success: false,
            error: postsData.error?.message || 'Failed to fetch posts'
          };
        }
      } catch (error) {
        postsTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Posts fetch failed'
        };
      }
    }

    return NextResponse.json({
      success: true,
      tokenValidation: {
        isValid: true,
        isNeverExpiring,
        isSystemUser,
        appId: tokenInfo.app_id,
        userId: tokenInfo.user_id,
        scopes: tokenInfo.scopes || [],
        expiresAt: tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toISOString() : null
      },
      pageAccess: {
        totalPages: pagesData.data.length,
        targetPageFound: !!targetPage,
        targetPageName: targetPage?.name || null,
        targetPagePermissions: targetPage?.perms || []
      },
      postsAccess: postsTest,
      recommendations: generateRecommendations(isNeverExpiring, isSystemUser, !!targetPage, postsTest?.success)
    });

  } catch (error) {
    console.error('System User token validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  isNeverExpiring: boolean,
  isSystemUser: boolean,
  targetPageFound: boolean,
  postsAccessSuccessful: boolean | undefined
): string[] {
  const recommendations: string[] = [];

  if (isNeverExpiring) {
    recommendations.push('✅ Token never expires - perfect for production use');
  } else {
    recommendations.push('⚠️ Token has expiration - consider creating a never-expiring system user token');
  }

  if (isSystemUser) {
    recommendations.push('✅ System user token detected - good for automated applications');
  } else {
    recommendations.push('⚠️ Not a system user token - consider using system user for production');
  }

  if (targetPageFound) {
    recommendations.push('✅ Target page is accessible with this token');
  } else {
    recommendations.push('❌ Target page not accessible - ensure page is assigned to system user');
  }

  if (postsAccessSuccessful === true) {
    recommendations.push('✅ Posts can be fetched successfully');
    recommendations.push('🚀 Token is ready for production use - update your .env file');
  } else if (postsAccessSuccessful === false) {
    recommendations.push('❌ Posts access failed - check page permissions');
  }

  return recommendations;
}
