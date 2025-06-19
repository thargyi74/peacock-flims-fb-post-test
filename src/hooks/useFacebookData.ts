'use client';

import { useState, useEffect } from 'react';
import { FacebookPost, FacebookPostsResponse, FacebookPageInfo } from '@/types/facebook';

export function useFacebookData() {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [pageInfo, setPageInfo] = useState<FacebookPageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPageInfo = async () => {
    try {
      const response = await fetch('/api/facebook/page');
      if (!response.ok) {
        throw new Error('Failed to fetch page info');
      }
      const data: FacebookPageInfo = await response.json();
      setPageInfo(data);
    } catch (err) {
      console.error('Error fetching page info:', err);
      setError('Failed to load page information');
    }
  };

  const fetchPosts = async (cursor?: string, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      params.append('limit', '10');
      if (cursor) {
        params.append('after', cursor);
      }

      const response = await fetch(`/api/facebook/posts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: FacebookPostsResponse = await response.json();
      
      if (append) {
        setPosts(prev => [...prev, ...data.data]);
      } else {
        setPosts(data.data);
      }

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

      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts from Facebook Graph API. Please check your configuration.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchPosts(nextCursor, true);
    }
  };

  const refresh = () => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPosts();
    fetchPageInfo();
  };

  useEffect(() => {
    fetchPosts();
    fetchPageInfo();
  }, []);

  return {
    posts,
    pageInfo,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
