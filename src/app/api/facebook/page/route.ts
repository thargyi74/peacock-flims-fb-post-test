import { NextResponse } from 'next/server';
import { facebookService } from '@/lib/facebook-service';

export async function GET() {
  try {
    const pageInfo = await facebookService.getPageInfo();
    
    return NextResponse.json(pageInfo);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page info' },
      { status: 500 }
    );
  }
}
