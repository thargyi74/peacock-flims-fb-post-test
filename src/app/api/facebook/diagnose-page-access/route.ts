import { NextRequest, NextResponse } from 'next/server';

interface CheckResult {
  success: boolean;
  data?: unknown;
  error?: unknown;
  pageFound?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('page_id') || process.env.FACEBOOK_PAGE_ID;
    const accessToken = searchParams.get('access_token') || process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (!accessToken || !pageId) {
      return NextResponse.json(
        { error: 'Missing access token or page ID' },
        { status: 400 }
      );
    }

    const results = {
      pageId,
      checks: {} as Record<string, CheckResult>,
      recommendations: [] as string[]
    };

    // Test 1: Check if we can access the page directly
    console.log('🔍 Test 1: Direct page access...');
    try {
      const pageResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,category,access_restrictions&access_token=${accessToken}`
      );
      const pageData = await pageResponse.json();
      
      results.checks.directPageAccess = {
        success: !pageData.error,
        data: pageData.error ? null : pageData,
        error: pageData.error || null
      };
    } catch (fetchError) {
      results.checks.directPageAccess = {
        success: false,
        error: 'Network error'
      };
    }

    // Test 2: Check page roles (admin-only endpoint)
    console.log('🔍 Test 2: Page roles access...');
    try {
      const rolesResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/roles?access_token=${accessToken}`
      );
      const rolesData = await rolesResponse.json();
      
      results.checks.pageRoles = {
        success: !rolesData.error,
        data: rolesData.error ? null : rolesData,
        error: rolesData.error || null
      };
    } catch (fetchError) {
      results.checks.pageRoles = {
        success: false,
        error: 'Network error'
      };
    }

    // Test 3: Try to get page insights (admin-only)
    console.log('🔍 Test 3: Page insights access...');
    try {
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_views_total&access_token=${accessToken}`
      );
      const insightsData = await insightsResponse.json();
      
      results.checks.pageInsights = {
        success: !insightsData.error,
        data: insightsData.error ? null : insightsData,
        error: insightsData.error || null
      };
    } catch (fetchError) {
      results.checks.pageInsights = {
        success: false,
        error: 'Network error'
      };
    }

    // Test 4: Check what pages are actually returned by /me/accounts
    console.log('🔍 Test 4: Listed pages from /me/accounts...');
    try {
      const accountsResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token,tasks&access_token=${accessToken}`
      );
      const accountsData = await accountsResponse.json();
      
      results.checks.listedPages = {
        success: !accountsData.error,
        data: accountsData.error ? null : accountsData,
        error: accountsData.error || null,
        pageFound: !accountsData.error && accountsData.data?.some((page: { id: string }) => page.id === pageId)
      };
    } catch (fetchError) {
      results.checks.listedPages = {
        success: false,
        error: 'Network error'
      };
    }

    // Test 5: Check current user info
    console.log('🔍 Test 5: Current user info...');
    try {
      const userResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`
      );
      const userData = await userResponse.json();
      
      results.checks.userInfo = {
        success: !userData.error,
        data: userData.error ? null : userData,
        error: userData.error || null
      };
    } catch (fetchError) {
      results.checks.userInfo = {
        success: false,
        error: 'Network error'
      };
    }

    // Test 6: Check token permissions
    console.log('🔍 Test 6: Token permissions...');
    try {
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/permissions?access_token=${accessToken}`
      );
      const permissionsData = await permissionsResponse.json();
      
      const grantedPermissions = permissionsData.data?.filter((perm: { status: string }) => perm.status === 'granted').map((perm: { permission: string }) => perm.permission) || [];
      
      results.checks.permissions = {
        success: !permissionsData.error,
        data: permissionsData.error ? null : { granted: grantedPermissions, all: permissionsData.data },
        error: permissionsData.error || null
      };
    } catch (fetchError) {
      results.checks.permissions = {
        success: false,
        error: 'Network error'
      };
    }

    // Generate recommendations based on results
    if (!results.checks.directPageAccess?.success) {
      results.recommendations.push('Cannot access page directly - check if page exists and is public');
    }

    if (!results.checks.listedPages?.pageFound && results.checks.listedPages?.success) {
      results.recommendations.push('Page not listed in /me/accounts - you may need to connect this page to your Facebook app');
    }

    if (!results.checks.pageRoles?.success) {
      results.recommendations.push('Cannot access page roles - you may not have admin privileges via this token');
    }

    if (!results.checks.pageInsights?.success) {
      results.recommendations.push('Cannot access page insights - admin access may be limited');
    }

    const requiredPermissions = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];
    const grantedPermissions = (results.checks.permissions?.data as { granted: string[] })?.granted || [];
    const missingPermissions = requiredPermissions.filter(perm => !grantedPermissions.includes(perm));
    
    if (missingPermissions.length > 0) {
      results.recommendations.push(`Missing permissions: ${missingPermissions.join(', ')}`);
    }

    // Specific solutions
    if (!results.checks.listedPages?.pageFound) {
      results.recommendations.push('SOLUTION: Go to Facebook App Settings > Products > Facebook Login > Settings and add your page to "Valid OAuth Redirect URIs"');
      results.recommendations.push('ALTERNATIVE: Use Facebook Business Manager to properly connect your page to your app');
      results.recommendations.push('OR: Generate a Page Access Token directly from Graph API Explorer by selecting your page');
    }

    return NextResponse.json({
      success: true,
      pageId,
      summary: {
        directAccess: results.checks.directPageAccess?.success || false,
        roleAccess: results.checks.pageRoles?.success || false,
        insightsAccess: results.checks.pageInsights?.success || false,
        listedInAccounts: results.checks.listedPages?.pageFound || false,
        hasRequiredPermissions: missingPermissions.length === 0
      },
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Page access diagnostic error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run page access diagnostic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
