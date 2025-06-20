'use client';

import { useState } from 'react';
import { FacebookPost, FacebookPostsResponse } from '@/types/facebook';
import PostCard from '@/components/PostCard';
import LoadingSpinner, { PostCardSkeleton } from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadMorePostsProps {
  initialPosts: FacebookPost[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
}

export default function LoadMorePosts({ 
  initialPosts, 
  initialNextCursor, 
  initialHasMore 
}: LoadMorePostsProps) {
  const [posts, setPosts] = useState<FacebookPost[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMorePosts = async (cursor: string) => {
    try {
      setLoadingMore(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('limit', '10');
      params.append('after', cursor);

      const response = await fetch(`/api/facebook/posts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: FacebookPostsResponse = await response.json();
      
      setPosts(prev => [...prev, ...data.data]);

      // Extract cursor from paging
      if (data.paging?.next) {
        const url = new URL(data.paging.next);
        const afterParam = url.searchParams.get('after');
        setNextCursor(afterParam);
        setHasMore(true);
      } else {
        setNextCursor(null);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching more posts:', err);
      setError('Failed to load more posts from Facebook Graph API.');
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchMorePosts(nextCursor);
    }
  };

  return (
    <>
      {/* Render all posts (initial + loaded) */}
      {posts.map((post, index) => (
        <PostCard 
          key={post.id} 
          post={post} 
          priority={index < 2} // Prioritize first 2 images for loading
        />
      ))}

      {/* Error message for load more failures */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => nextCursor && fetchMorePosts(nextCursor)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className={cn(
              "bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
              loadingMore && "opacity-50 cursor-not-allowed"
            )}
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" variant="white" />
                Loading...
              </div>
            ) : (
              'Load More Posts'
            )}
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loadingMore && (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <PostCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}
    </>
  );
}
