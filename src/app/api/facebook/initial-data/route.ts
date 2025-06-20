import { NextResponse } from "next/server";
import { facebookService } from "@/lib/facebook-service";

// Cache for 5 minutes - contains posts which are dynamic content
export const revalidate = 300;

export async function GET() {
  try {
    // Fetch page info and posts concurrently
    const [pageInfo, postsResponse] = await Promise.all([
      facebookService.getPageInfo(),
      facebookService.getPosts(10), // Initial limit
    ]);

    const response = NextResponse.json({
      pageInfo,
      posts: postsResponse.data,
      paging: postsResponse.paging,
    });
    
    // Set cache headers for initial data (same as posts since it contains posts)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("API Error fetching initial data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const errorResponse = NextResponse.json(
      {
        error: "Failed to fetch initial data from Facebook",
        details: errorMessage,
      },
      { status: 500 }
    );
    
    // Don't cache error responses
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return errorResponse;
  }
}
