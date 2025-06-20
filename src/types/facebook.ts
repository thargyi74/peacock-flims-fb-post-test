export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  full_picture?: string;
  main_picture?: string; // Alias for optimized picture
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
      subattachments?: {
        data: Array<{
          type: string;
          media?: {
            image?: {
              src: string;
              width?: number;
              height?: number;
            };
          };
          target?: {
            url: string;
          };
        }>;
      };
    }>;
  };
  reactions?: {
    data: Array<{
      type: string;
    }>;
    summary: {
      total_count: number;
    };
  };
  likes?: {
    summary: {
      total_count: number;
    };
  }; // Alias for reactions
  comments?: {
    summary: {
      total_count: number;
    };
  };
  comments_count?: {
    summary: {
      total_count: number;
    };
  }; // Alias for comments
  shares?: {
    count: number;
  };
}

export interface FacebookPostsResponse {
  data: FacebookPost[];
  paging?: {
    previous?: string;
    next?: string;
  };
}

export interface FacebookPageInfo {
  id: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
  cover?: {
    source: string;
  };
  fan_count?: number;
}

export interface FacebookInitialDataResponse {
  pageInfo: FacebookPageInfo;
  posts: FacebookPost[];
  paging?: {
    previous?: string;
    next?: string;
  };
}
