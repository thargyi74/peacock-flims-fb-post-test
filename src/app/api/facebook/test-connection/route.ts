import { NextResponse } from 'next/server';

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  tasks: string[];
  access_token: string;
}

interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
  attachments?: {
    data: Array<{
      type: string;
      media?: {
        image?: {
          src: string;
          width?: number;
          height?: number;
        };
      };
      media_type?: string;
      target?: {
        url: string;
      };
      title?: string;
      description?: string;
    }>;
  };
}

export async function GET() {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Facebook access token not configured' },
        { status: 500 }
      );
    }

    if (!pageId) {
      return NextResponse.json(
        { error: 'Facebook page ID not configured' },
        { status: 500 }
      );
    }

    const results = {
      tokenCheck: { success: false, error: '', data: null },
      adminCheck: { success: false, error: '', data: null },
      pageInfo: { success: false, error: '', data: null },
      postsCheck: { success: false, error: '', data: null },
      errors: [] as string[]
    };

    // Step 1: Check token validity
    console.log('🔍 Step 1: Checking token validity...');
    try {
      const tokenResponse = await fetch(
        `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name`
      );
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        results.tokenCheck = { success: false, error: tokenData.error.message, data: null };
        results.errors.push(`Token validation failed: ${tokenData.error.message}`);
      } else {
        results.tokenCheck = {
          success: true,
          error: '',
          data: {
            id: tokenData.id,
            name: tokenData.name
          }
        };
      }
    } catch (error: unknown) {
      console.error('Token check error:', error);
      results.tokenCheck = { success: false, error: 'Network error', data: null };
      results.errors.push('Token validation network error');
    }

    // Step 2: Check admin access
    console.log('🔍 Step 2: Checking admin access...');
    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name,access_token`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        results.adminCheck = { success: false, error: pagesData.error.message, data: null };
        results.errors.push(`Admin check failed: ${pagesData.error.message}`);
      } else {
        const administeredPages = pagesData.data || [];
        const targetPage = administeredPages.find((page: any) => page.id === pageId);
        
        results.adminCheck = {
          success: true,
          error: '',
          data: {
            hasAccess: administeredPages.length > 0,
            isAdminOfTargetPage: !!targetPage,
            totalPages: administeredPages.length,
            pages: administeredPages.map((page: any) => ({
              id: page.id,
              name: page.name
            }))
          }
        };
      }
    } catch (error: unknown) {
      console.error('Admin check error:', error);
      results.adminCheck = { success: false, error: 'Network error', data: null };
      results.errors.push('Admin access check network error');
    }

    // Step 3: Check page info access
    console.log('🔍 Step 3: Checking page info access...');
    try {
      const pageResponse = await fetch(
        `https://graph.facebook.com/${pageId}?access_token=${accessToken}&fields=id,name,fan_count,about,category`
      );
      const pageData = await pageResponse.json();

      if (pageData.error) {
        results.pageInfo = { success: false, error: pageData.error.message, data: null };
        results.errors.push(`Page info access failed: ${pageData.error.message}`);
      } else {
        results.pageInfo = {
          success: true,
          error: '',
          data: {
            id: pageData.id,
            name: pageData.name,
            fan_count: pageData.fan_count,
            about: pageData.about,
            category: pageData.category
          }
        };
      }
    } catch (error: unknown) {
      console.error('Page info error:', error);
      results.pageInfo = { success: false, error: 'Network error', data: null };
      results.errors.push('Page info access network error');
    }

    // Step 4: Check posts access
    console.log('🔍 Step 4: Checking posts access...');
    try {
      const postsResponse = await fetch(
        `https://graph.facebook.com/${pageId}/posts?access_token=${accessToken}&fields=id,message,created_time,permalink_url&limit=5`
      );
      const postsData = await postsResponse.json();

      if (postsData.error) {
        results.postsCheck = { success: false, error: postsData.error.message, data: null };
        results.errors.push(`Posts access failed: ${postsData.error.message}`);
      } else {
        try {
          const posts = postsData.data || [];
          results.postsCheck = {
            success: true,
            error: '',
            data: {
              accessible: true,
              totalPosts: posts.length,
              samplePosts: posts.slice(0, 3).map((post: any) => ({
                id: post.id,
                message: post.message ? post.message.substring(0, 100) + (post.message.length > 100 ? '...' : '') : 'No message',
                created_time: post.created_time,
                permalink_url: post.permalink_url
              }))
            }
          };
        } catch (processError: unknown) {
          console.error('Posts processing error:', processError);
          results.postsCheck = {
            success: false,
            error: 'Error processing posts data',
            data: null
          };
        }
      }
    } catch (error: unknown) {
      console.error('Posts check error:', error);
      results.postsCheck = { success: false, error: 'Network error', data: null };
      results.errors.push('Posts access network error');
    }

    // Generate summary
    const summary = {
      overall: results.errors.length === 0,
      tokenValid: results.tokenCheck.success,
      hasAdminAccess: results.adminCheck.success && results.adminCheck.data?.hasAccess,
      isAdminOfTargetPage: results.adminCheck.success && results.adminCheck.data?.isAdminOfTargetPage,
      canAccessPageInfo: results.pageInfo.success,
      canAccessPosts: results.postsCheck.success,
      totalErrors: results.errors.length,
      recommendations: [] as string[]
    };

    if (!summary.tokenValid) {
      summary.recommendations.push('Generate a new access token from Facebook Graph API Explorer');
    }
    if (!summary.hasAdminAccess) {
      summary.recommendations.push('Ensure you have proper permissions: pages_show_list, pages_read_engagement');
    }
    if (!summary.isAdminOfTargetPage) {
      summary.recommendations.push('Make sure you are an admin of the target page');
    }
    if (!summary.canAccessPosts) {
      summary.recommendations.push('Request pages_read_user_content permission for post access');
    }

    return NextResponse.json({
      success: summary.overall,
      summary,
      details: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { error: 'Internal server error during connection test' },
      { status: 500 }
    );
  }
}
