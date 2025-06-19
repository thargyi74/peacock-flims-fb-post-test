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
    try {
      const url = this.buildUrl(`/${this.pageId}`, {
        fields: 'id,name,picture{url},cover{source},fan_count'
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
  }

  async getPosts(limit: number = 10, after?: string): Promise<FacebookPostsResponse> {
    try {
      // Optimize the fields to only get what we need for posts with images
      const params: Record<string, string> = {
        fields: [
          'id',
          'message',
          'story', 
          'created_time',
          'permalink_url',
          'full_picture',
          'attachments{type,media_type,media{image{src,width,height}},target{url},title,description,subattachments{type,media{image{src,width,height}},target{url}}}',
          'reactions.summary(total_count)',
          'comments.summary(total_count)', 
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
  }

  async getPostEngagement(postId: string) {
    try {
      const url = this.buildUrl(`/${postId}`, {
        fields: 'reactions.summary(total_count),comments.summary(total_count),shares'
      });

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching post engagement:', error);
      throw new Error('Failed to fetch post engagement');
    }
  }
}

export const facebookService = new FacebookService();
