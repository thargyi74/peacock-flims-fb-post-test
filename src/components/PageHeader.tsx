'use client';

import { FacebookPageInfo } from '@/types/facebook';
import { Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface PageHeaderProps {
  pageInfo: FacebookPageInfo | null;
  loading: boolean;
}

export default function PageHeader({ pageInfo, loading }: PageHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-4">
        {pageInfo.picture?.data?.url && !imageError && (
          <div className="relative w-16 h-16">
            <Image
              src={pageInfo.picture.data.url}
              alt={`${pageInfo.name} profile picture`}
              fill
              className="object-cover rounded-full"
              sizes="64px"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        
        {(!pageInfo.picture?.data?.url || imageError) && (
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <Users size={24} className="text-gray-500" />
          </div>
        )}
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {pageInfo.name}
          </h1>
          
          {pageInfo.fan_count && (
            <div className="flex items-center space-x-1 text-gray-600">
              <Users size={16} />
              <span className="text-sm">
                {pageInfo.fan_count.toLocaleString()} followers
              </span>
            </div>
          )}
        </div>
      </div>
      
      {pageInfo.cover?.source && !coverError && (
        <div className="relative w-full h-32 mt-4">
          <Image
            src={pageInfo.cover.source}
            alt={`${pageInfo.name} cover photo`}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setCoverError(true)}
          />
        </div>
      )}
      
      {pageInfo.cover?.source && coverError && (
        <div className="w-full h-32 mt-4 bg-gray-200 rounded-md flex items-center justify-center">
          <span className="text-gray-500">Cover photo unavailable</span>
        </div>
      )}
    </div>
  );
}
