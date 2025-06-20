import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// API route for manual cache revalidation
// Usage: POST /api/facebook/revalidate with { tags: ['posts'] } or { tags: ['all'] }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags, secret } = body;

    // Simple authentication - you should use a more secure method in production
    const revalidationSecret = process.env.REVALIDATION_SECRET || 'your-secret-key';
    
    if (secret !== revalidationSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags array is required' },
        { status: 400 }
      );
    }

    // Available cache tags
    const availableTags = {
      all: ['facebook'],
      posts: ['facebook', 'posts'],
      'page-info': ['facebook', 'page-info'],
      engagement: ['facebook', 'engagement']
    };

    const revalidatedTags: string[] = [];

    // Revalidate requested tags
    for (const tag of tags) {
      if (tag === 'all') {
        // Revalidate all Facebook-related caches
        revalidateTag('facebook');
        revalidatedTags.push('facebook');
      } else if (availableTags[tag as keyof typeof availableTags]) {
        const tagsToRevalidate = availableTags[tag as keyof typeof availableTags];
        for (const cacheTag of tagsToRevalidate) {
          revalidateTag(cacheTag);
          if (!revalidatedTags.includes(cacheTag)) {
            revalidatedTags.push(cacheTag);
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Cache revalidated successfully',
      revalidatedTags,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Facebook Cache Revalidation API',
    usage: {
      method: 'POST',
      body: {
        secret: 'your-revalidation-secret',
        tags: ['posts', 'page-info', 'engagement', 'all']
      }
    },
    availableTags: {
      posts: 'Revalidate posts cache',
      'page-info': 'Revalidate page info cache',
      engagement: 'Revalidate engagement data cache',
      all: 'Revalidate all Facebook caches'
    },
    examples: {
      revalidatePosts: {
        method: 'POST',
        body: { secret: process.env.REVALIDATION_SECRET, tags: ['posts'] }
      },
      revalidateAll: {
        method: 'POST',
        body: { secret: process.env.REVALIDATION_SECRET, tags: ['all'] }
      }
    }
  });
}
