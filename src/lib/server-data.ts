import { facebookService } from '@/lib/facebook-service';
import { FacebookInitialDataResponse } from '@/types/facebook';

/**
 * Server-side function to fetch initial Facebook data
 * This leverages the advanced caching in facebook-service.ts
 */
export async function getInitialFacebookData(): Promise<FacebookInitialDataResponse> {
  try {
    // Fetch page info and posts concurrently using the cached service methods
    const [pageInfo, postsResponse] = await Promise.all([
      facebookService.getPageInfo(),
      facebookService.getPosts(20), // Initial limit
    ]);

    return {
      pageInfo,
      posts: postsResponse.data,
      paging: postsResponse.paging,
    };
  } catch (error) {
    console.error('Server-side error fetching initial data:', error);
    throw error;
  }
}

/**
 * Extract next cursor from Facebook paging data
 */
export function extractNextCursor(pagingUrl?: string): string | null {
  if (!pagingUrl) return null;
  
  try {
    const url = new URL(pagingUrl);
    return url.searchParams.get('after');
  } catch {
    return null;
  }
}
