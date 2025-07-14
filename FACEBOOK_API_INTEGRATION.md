# Facebook API Integration Documentation

## Overview

This document provides a complete guide for setting up and managing Facebook API integration for the DVB Peacock Film Festival Next.js application. The application fetches and displays Facebook posts from a specific Facebook page.

## Problem Resolution Summary

### Initial Issue

- **Problem**: Facebook API was returning empty results and permission errors
- **Root Cause**: Using User Access Token instead of required Page Access Token
- **Impact**: Posts could not be fetched from the Facebook page

### Solution Implemented

- **Action**: Created token conversion system to obtain proper Page Access Token
- **Result**: Successfully fetching Facebook posts with complete data including images, reactions, and engagement metrics

## Configuration

### Environment Variables

The `.env` file contains the following Facebook API credentials:

```properties
# Facebook Page API credentials
FACEBOOK_ACCESS_TOKEN=EAAKZAmSAAO3oBPOEnDTTYcn86p5o51ChKjehhHXCR2SHo1BZCb5l5NDYBfmrPZCP6D6Pn6jQZBFbfZBHJ4ZBpzzbZB1QTpgfJ72vwnrZBeW53q5cRBYSLc2SycFOzlCCa3BAUzK5QHwrKsqBrvIbw1Mh7zZBliji32WbhJCqWE3SK860uPWk98ZBhKC3O8U01akHFdgzrWmkMUBelXRBVBWCFng8pHfAyT9I2fvSjPygo3JUKllOEpsh2aX8b12hYZD
FACEBOOK_PAGE_ID=396720486865677
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Facebook App Configuration

- **App ID**: `731832899353466`
- **Target Page**: DVB Peacock Film Festival
- **Page ID**: `396720486865677`
- **Graph API Version**: v19.0

### Required Permissions

The following Facebook permissions are required:

- `pages_show_list` - List pages the user manages
- `pages_read_engagement` - Read page engagement metrics
- `pages_read_user_content` - Read posts and content from pages
- `pages_manage_posts` - Manage posts (optional)

## API Endpoints

### 1. Token Conversion Endpoint

**File**: `/src/app/api/facebook/get-page-token/route.ts`

**Purpose**: Converts User Access Token to Page Access Token

**Usage**:

```bash
curl -s 'http://localhost:3000/api/facebook/get-page-token'
```

**Response**:

```json
{
  "success": true,
  "pageAccessToken": "EAAKZAmSAAO3oBP...",
  "pageInfo": {
    "id": "396720486865677",
    "name": "DVB Peacock Film Festival"
  }
}
```

### 2. Connection Testing Endpoint

**File**: `/src/app/api/facebook/test-connection/route.ts`

**Purpose**: Comprehensive testing of Facebook API connectivity

**Usage**:

```bash
curl -s 'http://localhost:3000/api/facebook/test-connection'
```

**Features**:

- Token validation
- Admin access verification
- Page information retrieval
- Posts fetching test
- Detailed error reporting

### 3. Posts Fetching Endpoint

**File**: `/src/app/api/facebook/posts/route.ts`

**Purpose**: Fetch Facebook posts with pagination

**Usage**:

```bash
curl -s 'http://localhost:3000/api/facebook/posts?limit=5'
```

**Response**: Returns posts with complete metadata including images, reactions, comments, and shares.

### 4. Diagnostic Endpoint

**File**: `/src/app/api/facebook/diagnose-page-access/route.ts`

**Purpose**: Diagnose page access issues and permissions

## Token Types Explained

### User Access Token

- **Purpose**: Authenticates individual users
- **Limitations**: Cannot access page management features
- **Usage**: Initial authentication and token conversion

### Page Access Token

- **Purpose**: Authenticates applications to manage specific pages
- **Capabilities**: Full access to page posts, analytics, and management
- **Requirement**: User must be admin/editor of the target page

## Token Conversion Process

1. **Obtain User Access Token**: Through Facebook Login or Graph API Explorer
2. **Verify Permissions**: Ensure user has required permissions
3. **Convert to Page Token**: Use `/me/accounts` endpoint to get page token
4. **Validate Page Token**: Test page access and functionality
5. **Update Configuration**: Store page token in environment variables

## Token Expiration Management

### Understanding Token Lifetimes

Facebook provides different types of tokens with varying lifespans:

#### Short-lived User Access Tokens

- **Lifespan**: 1-2 hours
- **Use**: Initial authentication
- **Source**: Facebook Login, Graph API Explorer

#### Long-lived User Access Tokens

- **Lifespan**: 60 days
- **Use**: Extended application access
- **Obtained**: By exchanging short-lived tokens

#### Page Access Tokens

- **Lifespan**: Inherits from User Access Token that created it
- **Use**: Page management and content access
- **Behavior**: If created from long-lived user token, it's also long-lived

### Getting Long-lived Tokens

#### Method 1: Exchange Short-lived for Long-lived User Token

Create an API endpoint to exchange tokens:

```typescript
// /src/app/api/facebook/exchange-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shortLivedToken } = await request.json();
    
    const response = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
      `fb_exchange_token=${shortLivedToken}`
    );
    
    const data = await response.json();
    
    if (data.access_token) {
      return NextResponse.json({
        success: true,
        longLivedToken: data.access_token,
        expiresIn: data.expires_in, // seconds until expiration
      });
    } else {
      throw new Error('Failed to exchange token');
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

#### Method 2: Direct API Call

Exchange tokens using curl:

```bash
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

#### Method 3: Facebook Business Manager

For production applications:

1. Go to Facebook Business Settings
2. Navigate to System Users
3. Create a system user with appropriate permissions
4. Generate a long-lived token (can be set to never expire)

### Automatic Token Refresh

#### Strategy 1: Token Refresh Endpoint

Create an endpoint to refresh tokens before expiration:

```typescript
// /src/app/api/facebook/refresh-tokens/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Get current long-lived user token
    const userToken = process.env.FACEBOOK_LONG_LIVED_USER_TOKEN;
    
    // 2. Exchange for new long-lived token
    const refreshResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
      `fb_exchange_token=${userToken}`
    );
    
    const refreshData = await refreshResponse.json();
    
    if (!refreshData.access_token) {
      throw new Error('Failed to refresh user token');
    }
    
    // 3. Get new page token
    const pageResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${refreshData.access_token}`
    );
    
    const pageData = await pageResponse.json();
    const targetPage = pageData.data.find(page => page.id === process.env.FACEBOOK_PAGE_ID);
    
    if (!targetPage) {
      throw new Error('Page not found in accounts');
    }
    
    return NextResponse.json({
      success: true,
      newUserToken: refreshData.access_token,
      newPageToken: targetPage.access_token,
      expiresIn: refreshData.expires_in,
      message: 'Tokens refreshed successfully'
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

#### Strategy 2: Scheduled Token Refresh

Set up a cron job or scheduled function:

```typescript
// /src/lib/token-refresh.ts
export async function scheduleTokenRefresh() {
  // Run every 45 days (before 60-day expiration)
  const refreshInterval = 45 * 24 * 60 * 60 * 1000; // 45 days in milliseconds
  
  setInterval(async () => {
    try {
      const response = await fetch('/api/facebook/refresh-tokens', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Tokens refreshed successfully');
        // Update environment variables or database
        await updateStoredTokens(result.newUserToken, result.newPageToken);
      } else {
        console.error('Token refresh failed:', result.error);
        // Send alert to administrators
        await sendTokenExpirationAlert();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }, refreshInterval);
}
```

### Token Monitoring

#### Check Token Validity

Create an endpoint to check token status:

```typescript
// /src/app/api/facebook/token-info/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = process.env.FACEBOOK_ACCESS_TOKEN;
    
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
      
      return NextResponse.json({
        success: true,
        tokenInfo: {
          isValid,
          expiresAt: expiresAt?.toISOString(),
          daysUntilExpiry,
          appId: tokenInfo.app_id,
          userId: tokenInfo.user_id,
          scopes: tokenInfo.scopes,
        }
      });
    }
    
    throw new Error('Invalid token response');
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Production Token Management

#### Environment Variables for Production

Update your `.env` file to include additional token management variables:

```properties
# Facebook API Configuration
FACEBOOK_APP_ID=731832899353466
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_ACCESS_TOKEN=current_page_access_token
FACEBOOK_PAGE_ID=396720486865677

# Long-lived User Token (for refresh operations)
FACEBOOK_LONG_LIVED_USER_TOKEN=long_lived_user_token_here

# Token Management
TOKEN_REFRESH_WEBHOOK_URL=https://yourdomain.com/api/facebook/refresh-tokens
ADMIN_EMAIL=admin@yourdomain.com
```

#### Database Storage for Token Management

For production applications, consider storing tokens in a database:

```sql
CREATE TABLE facebook_tokens (
  id SERIAL PRIMARY KEY,
  token_type VARCHAR(50) NOT NULL, -- 'user' or 'page'
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### Best Practices for Token Management

#### 1. Never Expire Tokens (Business Use Case)

For business applications, use System User tokens:

- Go to Facebook Business Manager
- Create a System User
- Assign necessary permissions
- Generate token with "Never Expire" option
- Store securely and use for production

#### 2. Token Rotation Strategy

Implement a rotation strategy:

- Refresh tokens every 30-45 days
- Keep backup tokens in case of failure
- Monitor token health regularly
- Set up alerts for expiration warnings

#### 3. Error Handling

Always handle token expiration gracefully:

```typescript
export async function fetchWithTokenRetry(url: string, token: string) {
  try {
    const response = await fetch(url);
    
    if (response.status === 401 || response.status === 403) {
      // Token might be expired, try to refresh
      const newToken = await refreshToken();
      if (newToken) {
        // Retry with new token
        return await fetch(url.replace(token, newToken));
      }
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

## Troubleshooting Guide

### Common Issues

#### Empty /me/accounts Response

- **Cause**: User is not admin/editor of any pages
- **Solution**: Ensure user has proper page roles

#### Permission Errors

- **Cause**: Missing required permissions
- **Solution**: Re-authenticate with proper scopes

#### Token Expiration

- **Cause**: Tokens have limited lifetime (1-2 hours for short-lived, 60 days for long-lived)
- **Solution**: Exchange for long-lived tokens and implement refresh mechanism

### Debugging Commands

Test API connectivity:

```bash
curl -s 'http://localhost:3000/api/facebook/test-connection' | python3 -m json.tool
```

Check page token:

```bash
curl -s 'http://localhost:3000/api/facebook/get-page-token' | python3 -m json.tool
```

Fetch posts:

```bash
curl -s 'http://localhost:3000/api/facebook/posts?limit=3' | python3 -m json.tool
```

## Security Considerations

### Token Management

- Store tokens securely in environment variables
- Never expose tokens in client-side code
- Implement token rotation for production use
- Use HTTPS for all API communications

### Access Control

- Validate user permissions before token conversion
- Implement rate limiting on API endpoints
- Log and monitor API usage

## Production Deployment

### Environment Setup

1. Update `NEXT_PUBLIC_APP_URL` to production domain
2. Configure Facebook app with production domain
3. Set up token refresh mechanism
4. Implement proper error handling and logging

### Monitoring

- Set up alerts for API failures
- Monitor token expiration
- Track API usage limits

## API Response Examples

### Successful Post Fetch

```json
{
  "data": [
    {
      "id": "396720486865677_122162861840523564",
      "message": "DVB Short Docs Contest 2025...",
      "created_time": "2025-07-10T08:50:16+0000",
      "permalink_url": "https://www.facebook.com/122159451386523564/posts/122162861840523564",
      "main_picture": "https://scontent.fbkk10-1.fna.fbcdn.net/...",
      "reactions_count": { "summary": { "total_count": 21 } },
      "comments_count": { "summary": { "total_count": 0 } },
      "shares": { "count": 5 }
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIUlN5VTF2a1ZA...",
      "after": "QVFIUkdjdTlGVlNpdEQ2..."
    }
  }
}
```

## File Structure

```text
src/
├── app/
│   ├── api/
│   │   └── facebook/
│   │       ├── get-page-token/route.ts
│   │       ├── test-connection/route.ts
│   │       ├── posts/route.ts
│   │       └── diagnose-page-access/route.ts
│   └── page.tsx
├── components/
│   ├── PostCard.tsx
│   └── PageHeader.tsx
└── lib/
    └── facebook-service.ts
```

## Performance Optimization

### Caching Strategy

- Implement server-side caching for posts
- Use Next.js revalidation for fresh content
- Cache images through Next.js Image optimization

### Rate Limiting

- Respect Facebook API rate limits
- Implement exponential backoff for retries
- Use pagination efficiently

## Maintenance

### Regular Tasks

- Monitor token expiration dates
- Update Facebook Graph API version
- Review and update permissions
- Test API endpoints regularly

### Updates Required

- Update Graph API version annually
- Refresh long-lived tokens periodically
- Update dependencies and security patches

## Contact Information

- **Project**: DVB Peacock Film Festival
- **Page ID**: 396720486865677
- **Created**: July 14, 2025
- **Last Updated**: July 14, 2025

---

*This documentation was created during the successful resolution of Facebook API integration issues and should be updated as the system evolves.*
