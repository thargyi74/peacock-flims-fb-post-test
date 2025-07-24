import PageHeader from '@/components/PageHeader';
import LoadMorePosts from '@/components/LoadMorePosts';
import ClientInteractions from '@/components/ClientInteractions';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AlertCircle, Sparkles } from 'lucide-react';
import { getInitialFacebookData, extractNextCursor } from '@/lib/server-data';

async function FacebookFeed() {
  let initialData;
  let error: string | null = null;

  try {
    initialData = await getInitialFacebookData();
  } catch (err) {
    console.error('Server-side error fetching Facebook data:', err);
    error = err instanceof Error ? err.message : 'Failed to load Facebook data';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to Load Posts
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ClientInteractions />
            </div>
          </div>
          
          <ErrorInstructions error={error} />
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Data Available
            </h2>
            <p className="text-gray-600 mb-6">Unable to load Facebook posts at this time.</p>
            <ClientInteractions />
          </div>
        </div>
      </div>
    );
  }

  const { pageInfo, posts, paging } = initialData;
  const nextCursor = extractNextCursor(paging?.next);
  const hasMore = !!nextCursor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              News
            </h1>
            <p className="text-gray-600 mt-2">Latest updates and content</p>
          </div>
          <ClientInteractions />
        </div>

        {/* Page Information */}
        <PageHeader pageInfo={pageInfo} loading={false} />

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600 font-medium">
                  {posts.length} post{posts.length !== 1 ? 's' : ''} loaded
                </span>
              </div>

              <LoadMorePosts 
                initialPosts={posts}
                initialNextCursor={nextCursor}
                initialHasMore={hasMore}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
      <p className="text-gray-500">Check back later for new content!</p>
    </div>
  );
}

function ErrorInstructions({ error }: { error: string }) {
  return (
    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Setup Instructions
      </h3>
      
      {error.includes('Page Access Token Required') ? (
        <div className="space-y-4">
          <p className="text-blue-700 text-sm">
            You&apos;re using a User access token, but Facebook requires a Page access token to read posts. Follow these steps:
          </p>
          <ol className="text-blue-700 space-y-2 text-sm list-decimal list-inside bg-white p-4 rounded-lg">
            <li>Go to <code className="bg-blue-100 px-2 py-1 rounded text-xs">http://localhost:3001/api/facebook/page-token?user_token=YOUR_USER_ACCESS_TOKEN</code></li>
            <li>Replace YOUR_USER_ACCESS_TOKEN with your current access token</li>
            <li>Copy the page access token for your desired page</li>
            <li>Update <code className="bg-blue-100 px-2 py-1 rounded text-xs">.env.local</code> with the page access token</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      ) : error.includes('Access Token Expired') ? (
        <div className="space-y-4">
          <p className="text-blue-700 text-sm">
            Your Facebook access token has expired. Generate a new one:
          </p>
          <ol className="text-blue-700 space-y-2 text-sm list-decimal list-inside bg-white p-4 rounded-lg">
            <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Facebook Graph API Explorer</a></li>
            <li>Select your app and generate a new token with required permissions</li>
            <li>Update <code className="bg-blue-100 px-2 py-1 rounded text-xs">FACEBOOK_ACCESS_TOKEN</code> in your <code className="bg-blue-100 px-2 py-1 rounded text-xs">.env.local</code> file</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      ) : (
        <ol className="text-blue-700 space-y-2 text-sm list-decimal list-inside bg-white p-4 rounded-lg">
          <li>Get a Facebook access token with proper permissions</li>
          <li>Get your Facebook Page ID</li>
          <li>Update the <code className="bg-blue-100 px-2 py-1 rounded text-xs">.env.local</code> file with your credentials</li>
          <li>Restart the development server</li>
        </ol>
      )}
    </div>
  );
}

export default async function Home() {
  return (
    <ErrorBoundary>
      <FacebookFeed />
    </ErrorBoundary>
  );
}
