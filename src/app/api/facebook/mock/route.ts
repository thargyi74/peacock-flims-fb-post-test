import { NextResponse } from 'next/server';
import { FacebookPostsResponse, FacebookPageInfo } from '@/types/facebook';

// Mock data for testing when Facebook token is expired
const mockPageInfo: FacebookPageInfo = {
  id: "396720486865677",
  name: "Sample Facebook Page",
  picture: {
    data: {
      url: "https://scontent.xx.fbcdn.net/v/t1.6435-1/123456789_sample_picture.jpg"
    }
  },
  cover: {
    source: "https://scontent.xx.fbcdn.net/v/t31.18172-8/123456789_sample_cover.jpg"
  },
  fan_count: 1250
};

const mockPosts: FacebookPostsResponse = {
  data: [
    {
      id: "123456789_1",
      message: "Check out this amazing single image post! 🌟 #photography #nature",
      created_time: "2025-06-18T08:00:00+0000",
      permalink_url: "https://facebook.com/sample/posts/1",
      full_picture: "https://picsum.photos/800/600?random=1",
      reactions: {
        data: [],
        summary: { total_count: 25 }
      },
      comments: {
        summary: { total_count: 8 }
      },
      shares: { count: 3 }
    },
    {
      id: "123456789_2", 
      message: "Here's a post with multiple images in a photo album! 📸 Perfect for testing our grid layout.",
      created_time: "2025-06-18T06:00:00+0000",
      permalink_url: "https://facebook.com/sample/posts/2",
      attachments: {
        data: [
          {
            type: "album",
            media_type: "photo",
            subattachments: {
              data: [
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=2",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/1" }
                },
                {
                  type: "photo", 
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=3",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/2" }
                },
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=4",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/3" }
                }
              ]
            }
          }
        ]
      },
      reactions: {
        data: [],
        summary: { total_count: 42 }
      },
      comments: {
        summary: { total_count: 15 }
      },
      shares: { count: 7 }
    },
    {
      id: "123456789_3",
      message: "This post has 4+ images to test the grid layout with overflow! 🖼️ #design #gallery",
      created_time: "2025-06-18T04:00:00+0000",
      permalink_url: "https://facebook.com/sample/posts/3",
      attachments: {
        data: [
          {
            type: "album",
            media_type: "photo",
            subattachments: {
              data: [
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=5",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/grid1" }
                },
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=6",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/grid2" }
                },
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=7",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/grid3" }
                },
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=8",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/grid4" }
                },
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=9",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/grid5" }
                },
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=10",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/grid6" }
                }
              ]
            }
          }
        ]
      },
      reactions: {
        data: [],
        summary: { total_count: 89 }
      },
      comments: {
        summary: { total_count: 23 }
      },
      shares: { count: 12 }
    },
    {
      id: "123456789_4",
      message: "Two beautiful images side by side! Perfect for showcasing our responsive design. 🎨",
      created_time: "2025-06-18T02:00:00+0000", 
      permalink_url: "https://facebook.com/sample/posts/4",
      attachments: {
        data: [
          {
            type: "album",
            media_type: "photo",
            subattachments: {
              data: [
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=11",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/pair1" }
                },
                {
                  type: "photo",
                  media: {
                    image: {
                      src: "https://picsum.photos/800/600?random=12",
                      width: 800,
                      height: 600
                    }
                  },
                  target: { url: "https://facebook.com/photo/pair2" }
                }
              ]
            }
          }
        ]
      },
      reactions: {
        data: [],
        summary: { total_count: 34 }
      },
      comments: {
        summary: { total_count: 12 }
      },
      shares: { count: 5 }
    },
    {
      id: "123456789_5",
      message: "Another single image post with a beautiful landscape! 🏔️ #travel #mountains",
      created_time: "2025-06-17T22:00:00+0000",
      permalink_url: "https://facebook.com/sample/posts/5",
      full_picture: "https://picsum.photos/800/600?random=13",
      reactions: {
        data: [],
        summary: { total_count: 56 }
      },
      comments: {
        summary: { total_count: 18 }
      },
      shares: { count: 9 }
    }
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'posts';

  try {
    if (type === 'page') {
      return NextResponse.json(mockPageInfo);
    } else {
      return NextResponse.json(mockPosts);
    }
  } catch (error) {
    console.error('Mock API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mock data' },
      { status: 500 }
    );
  }
}
