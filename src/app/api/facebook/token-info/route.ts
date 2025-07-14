import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No Facebook access token configured' },
        { status: 400 }
      );
    }
    
    const response = await fetch(
      `https://graph.facebook.com/v19.0/debug_token?` +
      `input_token=${token}&` +
      `access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
    );
    
    const data = await response.json();
    
    if (data.data) {
      const tokenInfo = data.data;
      const expiresAt = tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000) : null;
      const isValid = tokenInfo.is_valid;
      const daysUntilExpiry = expiresAt ? 
        Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
      
      // Determine token status
      let status = 'Unknown';
      if (isValid) {
        if (!expiresAt) {
          status = 'Never expires';
        } else if (daysUntilExpiry && daysUntilExpiry > 30) {
          status = 'Healthy';
        } else if (daysUntilExpiry && daysUntilExpiry > 7) {
          status = 'Needs refresh soon';
        } else {
          status = 'Expires soon - urgent refresh needed';
        }
      } else {
        status = 'Invalid or expired';
      }
      
      return NextResponse.json({
        success: true,
        status,
        tokenInfo: {
          isValid,
          expiresAt: expiresAt?.toISOString(),
          daysUntilExpiry,
          appId: tokenInfo.app_id,
          userId: tokenInfo.user_id,
          scopes: tokenInfo.scopes || [],
          type: tokenInfo.type,
        },
        recommendations: getRecommendations(status)
      });
    }
    
    throw new Error('Invalid token response');
  } catch (error) {
    console.error('Token info error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getRecommendations(status: string): string[] {
  const recommendations: string[] = [];
  
  if (status === 'Invalid or expired') {
    recommendations.push('Token is expired or invalid - get a new token immediately');
    recommendations.push('Use the /api/facebook/get-page-token endpoint to get a fresh token');
  } else if (status === 'Expires soon - urgent refresh needed') {
    recommendations.push('Token expires in less than 7 days - refresh immediately');
    recommendations.push('Use the /api/facebook/exchange-token endpoint to get a long-lived token');
  } else if (status === 'Needs refresh soon') {
    recommendations.push('Token expires in less than 30 days - plan for refresh');
    recommendations.push('Consider setting up automatic token refresh');
  } else if (status === 'Healthy') {
    recommendations.push('Token is healthy and valid');
    recommendations.push('Set up monitoring to track expiration');
  } else if (status === 'Never expires') {
    recommendations.push('Token never expires - excellent for production');
    recommendations.push('Monitor token validity regularly');
  }
  
  return recommendations;
}
