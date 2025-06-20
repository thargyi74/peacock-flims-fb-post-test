import { unstable_cache } from 'next/cache';
import axios from 'axios';
import { FacebookPostsResponse, FacebookPageInfo } from '@/types/facebook';

const FACEBOOK_API_BASE_URL = 'https://graph.facebook.com/v19.0';

class FacebookService {
  private accessToken: string;
  private pageId: string;

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || process.env.FACEBOOK_USER_TOKEN || '';
    this.pageId = process.env.FACEBOOK_PAGE_ID || '';
  }

  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const url = new URL(`${FACEBOOK_API_BASE_URL}${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  async getPageInfo(): Promise<FacebookPageInfo> {
    // Wrap the page info fetching in unstable_cache
    return unstable_cache(
      async () => {
        try {
          const url = this.buildUrl(`/${this.pageId}`, {
            // Optimize page info fields with specific image sizes
            fields: 'id,name,picture.width(200).height(200){url},cover{source},fan_count'
          });

          const response = await axios.get<FacebookPageInfo>(url);
          return response.data;
        } catch (error: unknown) {
          console.error('Error fetching page info:', error);
          
          if (axios.isAxiosError(error) && error.response?.data) {
            console.error('Facebook API Error:', error.response.data);
          }
          
          let errorMessage = 'Failed to fetch page information';
          if (axios.isAxiosError(error) && error.response?.data?.error) {
            const fbError = error.response.data.error;
            if (fbError.code === 190 && fbError.error_subcode === 463) {
              errorMessage = 'Access Token Expired: Your Facebook access token has expired. Please generate a new token and update your .env.local file.';
            } else if (fbError.code === 190) {
              errorMessage = 'Invalid Access Token: Please check your Facebook access token in the .env.local file.';
            } else {
              errorMessage = `Facebook API Error: ${fbError.message} (Code: ${fbError.code})`;
            }
          }
          
          throw new Error(errorMessage);
        }
      },
      // Cache key: unique for this page
      ['facebook-page-info', this.pageId],
      // Options: revalidate every 1 hour since page info changes rarely
      { revalidate: 3600, tags: ['facebook', 'page-info'] }
    )();
  }

  async getPosts(limit: number = 10, after?: string): Promise<FacebookPostsResponse> {
    // Wrap the posts fetching in unstable_cache with unique cache keys
    return unstable_cache(
      async () => {
        try {
          // Optimize the fields using GraphQL aliases and specific image sizes
          const params: Record<string, string> = {
            fields: [
              'id',
              'message',
              'story', 
              'created_time',
              'permalink_url',
              // Request a specific optimized image size for the main picture
              'picture.width(800).height(800).as(main_picture)',
              // Keep full_picture as fallback for compatibility
              'full_picture',
              // Optimize attachments - only get essential image data
              'attachments{type,media_type,media{image{src,width,height}},target{url},title,description,subattachments.limit(3){type,media{image{src,width,height}},target{url}}}',
              // Use aliases for engagement metrics
              'reactions.summary(total_count).as(likes)',
              'comments.summary(total_count).as(comments_count)', 
              'shares'
            ].join(','),
            limit: limit.toString()
          };

          if (after) {
            params.after = after;
          }

          const url = this.buildUrl(`/${this.pageId}/posts`, params);
          console.log('Making request to:', url);
          
          const response = await axios.get<FacebookPostsResponse>(url);
          
          return response.data;
        } catch (error: unknown) {
          console.error('Error fetching posts:', error);
          
          // Log Facebook API error details
          if (axios.isAxiosError(error) && error.response?.data) {
            console.error('Facebook API Error:', error.response.data);
          }
          
          // Create more specific error message
          let errorMessage = 'Failed to fetch posts';
          if (axios.isAxiosError(error) && error.response?.data?.error) {
            const fbError = error.response.data.error;
            if (fbError.code === 190 && fbError.error_subcode === 2069032) {
              errorMessage = 'Page Access Token Required: You need a Page access token, not a User access token. Please check the setup instructions.';
            } else if (fbError.code === 190 && fbError.error_subcode === 463) {
              errorMessage = 'Access Token Expired: Your Facebook access token has expired. Please generate a new token and update your .env.local file.';
            } else if (fbError.code === 190) {
              errorMessage = 'Invalid Access Token: Please check your Facebook access token in the .env.local file.';
            } else {
              errorMessage = `Facebook API Error: ${fbError.message} (Code: ${fbError.code})`;
            }
          } else if (axios.isAxiosError(error) && error.response?.status === 400) {
            errorMessage = 'Bad request - check your access token and page ID';
          } else if (axios.isAxiosError(error) && error.response?.status === 403) {
            errorMessage = 'Access denied - check your permissions and access token';
          }
          
          throw new Error(errorMessage);
        }
      },
      // Cache key: unique for each combination of pageId, limit, and after
      ['facebook-posts', this.pageId, limit.toString(), after || 'no-cursor'],
      // Options: revalidate every 5 minutes since posts are dynamic content
      { revalidate: 300, tags: ['facebook', 'posts'] }
    )();
  }

  async getPostEngagement(postId: string) {
    // Wrap post engagement fetching in unstable_cache
    return unstable_cache(
      async () => {
        try {
          const url = this.buildUrl(`/${postId}`, {
            // Use aliases for optimized engagement data
            fields: 'reactions.summary(total_count).as(likes),comments.summary(total_count).as(comments_count),shares'
          });

          const response = await axios.get(url);
          return response.data;
        } catch (error) {
          console.error('Error fetching post engagement:', error);
          throw new Error('Failed to fetch post engagement');
        }
      },
      // Cache key: unique for each post
      ['facebook-post-engagement', postId],
      // Options: revalidate every 10 minutes for engagement data
      { revalidate: 600, tags: ['facebook', 'engagement'] }
    )();
  }

  // Cache management methods
  
  /**
   * Get cache tags for revalidation
   */
  getCacheTags() {
    return {
      all: ['facebook'],
      posts: ['facebook', 'posts'],
      pageInfo: ['facebook', 'page-info'],
      engagement: ['facebook', 'engagement']
    };
  }

  /**
   * Generate cache key for posts with specific parameters
   */
  getPostsCacheKey(limit: number = 10, after?: string) {
    return ['facebook-posts', this.pageId, limit.toString(), after || 'no-cursor'];
  }

  /**
   * Generate cache key for page info
   */
  getPageInfoCacheKey() {
    return ['facebook-page-info', this.pageId];
  }
}

export const facebookService = new FacebookService();
