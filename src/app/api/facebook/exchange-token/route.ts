import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shortLivedToken } = await request.json();
    
    if (!shortLivedToken) {
      return NextResponse.json(
        { success: false, error: 'Short-lived token is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
      `fb_exchange_token=${shortLivedToken}`
    );
    
    const data = await response.json();
    
    if (data.access_token) {
      // Calculate expiration date
      const expiresIn = data.expires_in; // seconds
      const expirationDate = new Date(Date.now() + (expiresIn * 1000));
      
      return NextResponse.json({
        success: true,
        longLivedToken: data.access_token,
        expiresIn: expiresIn,
        expirationDate: expirationDate.toISOString(),
        daysUntilExpiry: Math.ceil(expiresIn / (24 * 60 * 60)),
        message: 'Successfully exchanged for long-lived token'
      });
    } else {
      throw new Error(data.error?.message || 'Failed to exchange token');
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
