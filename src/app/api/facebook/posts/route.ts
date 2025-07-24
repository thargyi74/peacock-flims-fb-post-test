import { NextRequest, NextResponse } from 'next/server';
import { facebookService } from '@/lib/facebook-service';

// Cache for 5 minutes - posts are dynamic content that changes frequently
export const revalidate = 300;

// Force dynamic rendering since we use search params
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const after = searchParams.get('after') || undefined;

    const posts = await facebookService.getPosts(limit, after);
    
    const response = NextResponse.json(posts);
    
    // Set cache headers explicitly
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('API Error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch posts from Facebook Graph API' },
      { status: 500 }
    );
    
    // Don't cache error responses
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return errorResponse;
  }
}