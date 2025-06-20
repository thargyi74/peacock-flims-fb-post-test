'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ClientInteractionsProps {
  loading?: boolean;
}

export default function ClientInteractions({ loading = false }: ClientInteractionsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Force revalidation by calling the revalidate API
    try {
      await fetch('/api/facebook/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: ['facebook-posts', 'facebook-page-info']
        })
      });
    } catch (error) {
      console.error('Error revalidating cache:', error);
    }
    
    // Refresh the page to get fresh server-rendered data
    router.refresh();
    
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <>
      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={loading || refreshing}
        className={cn(
          "bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5",
          (loading || refreshing) && "opacity-50 cursor-not-allowed"
        )}
      >
        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        Refresh
      </button>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
