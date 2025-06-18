import { NextRequest, NextResponse } from 'next/server';
import { facebookService } from '@/lib/facebook-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const after = searchParams.get('after') || undefined;

    const posts = await facebookService.getPosts(limit, after);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
