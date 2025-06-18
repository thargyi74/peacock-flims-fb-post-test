import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  perms: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAccessToken = searchParams.get('user_token');
    
    if (!userAccessToken) {
      return NextResponse.json(
        { 
          error: 'Missing user_token parameter',
          instructions: 'Add ?user_token=YOUR_USER_ACCESS_TOKEN to this URL'
        },
        { status: 400 }
      );
    }

    // Get user's pages and their access tokens
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`;
    
    try {
      const response = await axios.get<{ data: FacebookPage[] }>(pagesUrl);
      const pages = response.data.data;
      
      if (!pages || pages.length === 0) {
        return NextResponse.json({
          error: 'No pages found',
          message: 'You need to be an admin/editor of a Facebook page to get page access tokens'
        });
      }

      const pageTokens = pages.map((page: FacebookPage) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        permissions: page.perms
      }));

      return NextResponse.json({
        message: 'Page access tokens retrieved successfully',
        pages: pageTokens,
        instructions: {
          step1: 'Choose the page you want to use from the list above',
          step2: 'Copy the access_token for your chosen page',
          step3: 'Replace FACEBOOK_ACCESS_TOKEN in your .env.local file with the page access token',
          step4: 'Make sure FACEBOOK_PAGE_ID matches the page id',
          step5: 'Restart your development server'
        }
      });
      
    } catch (error) {
      console.error('Error fetching pages:', error);
      
      if (axios.isAxiosError(error) && error.response?.data) {
        return NextResponse.json(
          { 
            error: 'Failed to fetch pages',
            details: error.response.data
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch pages' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Page token API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get page access tokens' },
      { status: 500 }
    );
  }
}
