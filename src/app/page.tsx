'use client';

import { useFacebookData } from '@/hooks/useFacebookData';
import PostCard from '@/components/PostCard';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
  const {
    posts,
    pageInfo,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh
  } = useFacebookData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <LoadingSpinner />
          <p className="text-center text-gray-600 mt-4">
            Loading Facebook posts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Facebook Data
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
          
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Setup Instructions
            </h3>
            
            {error.includes('Page Access Token Required') ? (
              <div className="space-y-4">
                <p className="text-blue-700 text-sm">
                  You&apos;re using a User access token, but Facebook requires a Page access token to read posts. Follow these steps:
                </p>
                <ol className="text-blue-700 space-y-2 text-sm">
                  <li>1. Go to <code className="bg-blue-100 px-1 py-0.5 rounded">http://localhost:3000/api/facebook/page-token?user_token=YOUR_USER_ACCESS_TOKEN</code></li>
                  <li>2. Replace YOUR_USER_ACCESS_TOKEN with your current access token</li>
                  <li>3. Copy the page access token for your desired page</li>
                  <li>4. Update <code className="bg-blue-100 px-1 py-0.5 rounded">.env.local</code> with the page access token</li>
                  <li>5. Restart the development server</li>
                </ol>
              </div>
            ) : error.includes('Access Token Expired') ? (
              <div className="space-y-4">
                <p className="text-blue-700 text-sm">
                  Your Facebook access token has expired. Generate a new one:
                </p>
                <ol className="text-blue-700 space-y-2 text-sm">
                  <li>1. Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Facebook Graph API Explorer</a></li>
                  <li>2. Select your app and generate a new token with <code className="bg-blue-100 px-1 py-0.5 rounded">pages_read_engagement</code> and <code className="bg-blue-100 px-1 py-0.5 rounded">pages_read_user_content</code> permissions</li>
                  <li>3. Update <code className="bg-blue-100 px-1 py-0.5 rounded">FACEBOOK_ACCESS_TOKEN</code> in your <code className="bg-blue-100 px-1 py-0.5 rounded">.env.local</code> file</li>
                  <li>4. Restart the development server</li>
                </ol>
              </div>
            ) : (
              <ol className="text-blue-700 space-y-2 text-sm">
                <li>1. Get a Facebook access token with <code className="bg-blue-100 px-1 py-0.5 rounded">pages_read_engagement</code> and <code className="bg-blue-100 px-1 py-0.5 rounded">pages_read_user_content</code> permissions</li>
                <li>2. Get your Facebook Page ID</li>
                <li>3. Update the <code className="bg-blue-100 px-1 py-0.5 rounded">.env.local</code> file with your credentials</li>
                <li>4. Restart the development server</li>
              </ol>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Facebook Posts
          </h1>
          <button
            onClick={refresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Page Information */}
        <PageHeader pageInfo={pageInfo} loading={false} />

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No posts found.</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}

              {loadingMore && <LoadingSpinner />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
