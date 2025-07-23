import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testPageId = searchParams.get('page_id') || process.env.FACEBOOK_PAGE_ID;
    const accessToken = searchParams.get('access_token') || process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing access token. Set FACEBOOK_ACCESS_TOKEN in .env or pass as parameter.' },
        { status: 400 }
      );
    }

    const results = {
      tokenCheck: null as any,
      adminCheck: null as any,
      pageInfo: null as any,
      postsCheck: null as any,
      errors: [] as string[]
    };

    // Step 1: Check token validity
    console.log('🔍 Step 1: Checking token validity...');
    try {
      const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        results.errors.push(`Token validation failed: ${tokenData.error.message}`);
        results.tokenCheck = { valid: false, error: tokenData.error };
      } else {
        results.tokenCheck = {
          valid: true,
          user: {
            name: tokenData.name,
            id: tokenData.id
          }
        };
        console.log(`✅ Token valid for user: ${tokenData.name} (${tokenData.id})`);
      }
    } catch (error) {
      results.errors.push('Failed to validate token');
      results.tokenCheck = { valid: false, error: 'Network error' };
    }

    // Step 2: Check admin access and get administered pages
    console.log('🔍 Step 2: Checking admin access...');
    try {
      const pagesResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesResponse.json();
      
      if (pagesData.error) {
        results.errors.push(`Admin check failed: ${pagesData.error.message}`);
        results.adminCheck = { hasAccess: false, error: pagesData.error };
      } else {
        const administeredPages = pagesData.data || [];
        const targetPage = administeredPages.find((page: FacebookPage) => page.id === testPageId);
        
        results.adminCheck = {
          hasAccess: true,
          totalPages: administeredPages.length,
          administeredPages: administeredPages.map((page: FacebookPage) => ({
            id: page.id,
            name: page.name,
            category: page.category,
            tasks: page.tasks
          })),
          isAdminOfTargetPage: !!targetPage,
          targetPageInfo: targetPage || null
        };
        
        console.log(`✅ Found ${administeredPages.length} administered pages`);
        if (targetPage) {
          console.log(`✅ User is admin of target page: ${targetPage.name}`);
        } else {
          console.log(`⚠️ User is NOT admin of page ${testPageId}`);
        }
      }
    } catch (error) {
      results.errors.push('Failed to check admin access');
      results.adminCheck = { hasAccess: false, error: 'Network error' };
    }

    // Step 3: Get page information
    console.log('🔍 Step 3: Getting page information...');
    if (testPageId) {
      try {
        const pageResponse = await fetch(
          `https://graph.facebook.com/v19.0/${testPageId}?fields=id,name,about,category,picture,cover,fan_count&access_token=${accessToken}`
        );
        const pageData = await pageResponse.json();
        
        if (pageData.error) {
          results.errors.push(`Page info failed: ${pageData.error.message}`);
          results.pageInfo = { accessible: false, error: pageData.error };
        } else {
          results.pageInfo = {
            accessible: true,
            page: {
              id: pageData.id,
              name: pageData.name,
              about: pageData.about,
              category: pageData.category,
              fanCount: pageData.fan_count,
              picture: pageData.picture?.data?.url,
              cover: pageData.cover?.source
            }
          };
          console.log(`✅ Page info retrieved: ${pageData.name}`);
        }
      } catch (error) {
        results.errors.push('Failed to get page information');
        results.pageInfo = { accessible: false, error: 'Network error' };
      }
    }

    // Step 4: Try to fetch posts
    console.log('🔍 Step 4: Attempting to fetch posts...');
    if (testPageId) {
      const postEndpoints = [
        `/posts?fields=id,message,story,created_time,full_picture,permalink_url,attachments{type,media,target,title,description}`,
        `/feed?fields=id,message,story,created_time,full_picture,permalink_url`,
        `/published_posts?fields=id,message,created_time,permalink_url`
      ];

      let postsSuccess = false;
      let postsData = null;
      let lastError = null;

      for (const endpoint of postEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const postsResponse = await fetch(
            `https://graph.facebook.com/v19.0/${testPageId}${endpoint}&limit=5&access_token=${accessToken}`
          );
          const data = await postsResponse.json();
          
          if (data.error) {
            lastError = data.error;
            console.log(`❌ ${endpoint} failed: ${data.error.message}`);
            continue;
          } else {
            postsSuccess = true;
            postsData = data;
            console.log(`✅ ${endpoint} succeeded! Found ${data.data?.length || 0} posts`);
            break;
          }
        } catch (fetchError) {
          lastError = { message: 'Network error', code: 'NETWORK_ERROR' };
          continue;
        }
      }

      if (postsSuccess && postsData) {
        results.postsCheck = {
          accessible: true,
          totalPosts: postsData.data?.length || 0,
          posts: postsData.data?.slice(0, 3).map((post: FacebookPost) => ({
            id: post.id,
            message: post.message?.substring(0, 100) + (post.message?.length > 100 ? '...' : ''),
            story: post.story,
            createdTime: post.created_time,
            hasImage: !!post.full_picture,
            permalinkUrl: post.permalink_url,
            attachmentsCount: post.attachments?.data?.length || 0
          })) || [],
          paging: postsData.paging
        };
      } else {
        results.postsCheck = {
          accessible: false,
          error: lastError,
          recommendations: [
            'Ensure you have a Page Access Token (not User Access Token)',
            'Check that your app has pages_read_engagement permission',
            'Verify you are an admin/editor of the target page',
            'Make sure the page has published posts'
          ]
        };
        results.errors.push(`Posts fetch failed: ${lastError?.message || 'Unknown error'}`);
      }
    }

    // Summary
    const summary = {
      overallStatus: results.errors.length === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
      checksCompleted: {
        tokenValid: results.tokenCheck?.valid || false,
        hasAdminAccess: results.adminCheck?.hasAccess || false,
        isAdminOfTargetPage: results.adminCheck?.isAdminOfTargetPage || false,
        pageAccessible: results.pageInfo?.accessible || false,
        postsAccessible: results.postsCheck?.accessible || false
      },
      recommendations: []
    };

    // Add recommendations based on results
    if (!summary.checksCompleted.tokenValid) {
      summary.recommendations.push('Generate a new access token from Facebook Graph API Explorer');
    }
    if (!summary.checksCompleted.hasAdminAccess) {
      summary.recommendations.push('Ensure you have proper permissions: pages_show_list, pages_read_engagement');
    }
    if (!summary.checksCompleted.isAdminOfTargetPage) {
      summary.recommendations.push('Make sure you are an admin/editor of the target Facebook page');
    }
    if (!summary.checksCompleted.postsAccessible) {
      summary.recommendations.push('Use a Page Access Token instead of User Access Token for reading posts');
    }

    return NextResponse.json({
      success: true,
      summary,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test Facebook connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
