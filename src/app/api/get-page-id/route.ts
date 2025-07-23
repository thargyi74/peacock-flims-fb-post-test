import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    if (!pageId) {
      return NextResponse.json(
        { error: 'Facebook page ID not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pageId,
      success: true
    });

  } catch (error) {
    console.error('Get page ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
