'use client';

import { useState, useEffect } from 'react';
import { FacebookPost, FacebookPostsResponse, FacebookPageInfo, FacebookInitialDataResponse } from '@/types/facebook';

export function useFacebookData() {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [pageInfo, setPageInfo] = useState<FacebookPageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/initial-data');
      if (!response.ok) {
        throw new Error('Failed to fetch initial data');
      }
      const data: FacebookInitialDataResponse = await response.json();
      
      setPageInfo(data.pageInfo);
      setPosts(data.posts);
      
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
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data from Facebook Graph API. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (cursor: string) => {
    try {
      setLoadingMore(true);

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

      setError(null);
    } catch (err) {
      console.error('Error fetching more posts:', err);
      setError('Failed to load more posts from Facebook Graph API.');
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchPosts(nextCursor);
    }
  };

  const refresh = () => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    fetchInitialData();
  };

  useEffect(() => {
    fetchInitialData();
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
