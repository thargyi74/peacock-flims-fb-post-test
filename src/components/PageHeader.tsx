'use client';

import { FacebookPageInfo } from '@/types/facebook';
import { Users, MapPin, Globe, Calendar, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  pageInfo: FacebookPageInfo | null;
  loading: boolean;
}

export default function PageHeader({ pageInfo, loading }: PageHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  if (loading) {
    return <PageHeaderSkeleton />;
  }

  if (!pageInfo) {
    return null;
  }

  const formatFollowerCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Cover Photo */}
      <div className="relative h-32 sm:h-48">
        {pageInfo.cover?.source && !coverError ? (
          <>
            <Image
              src={pageInfo.cover.source}
              alt={`${pageInfo.name} cover photo`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => {
                console.log('Cover photo failed to load:', pageInfo.cover?.source);
                setCoverError(true);
              }}
              onLoad={() => {
                console.log('Cover photo loaded successfully:', pageInfo.cover?.source);
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-20" />
          </>
        ) : (
          // Fallback - try local cover photo first, then gradient
          <>
            <Image
              src="/fb_cover.jpg"
              alt={`${pageInfo.name} cover photo`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => {
                // If local fallback also fails, show gradient
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
          </>
        )}
      </div>

      <div className="p-6 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Profile Picture */}
          <div className="relative">
            {pageInfo.picture?.data?.url && !imageError ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                <Image
                  src={pageInfo.picture.data.url}
                  alt={`${pageInfo.name} profile picture`}
                  fill
                  className="object-cover rounded-xl border-4 border-white shadow-lg"
                  sizes="96px"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {pageInfo.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Page Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {pageInfo.name}
              </h1>
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" aria-label="Verified page" />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {pageInfo.fan_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">
                    {formatFollowerCount(pageInfo.fan_count)} followers
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Public Page</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Entertainment</span>
              </div>
            </div>

            {/* Page Description */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-200">
              <p className="text-sm text-gray-700">
                Welcome to {pageInfo.name}! Follow us for the latest updates and exciting content.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <StatCard
            label="Total Followers"
            value={formatFollowerCount(pageInfo.fan_count)}
            icon={Users}
            color="text-blue-500"
          />
          <StatCard
            label="Page Type"
            value="Public"
            icon={Globe}
            color="text-green-500"
          />
          <StatCard
            label="Category"
            value="Entertainment"
            icon={MapPin}
            color="text-purple-500"
          />
          <StatCard
            label="Status"
            value="Active"
            icon={CheckCircle}
            color="text-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <Icon className={cn("w-5 h-5 mx-auto mb-2", color)} />
      <div className="text-lg font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 animate-pulse">
      <div className="h-32 sm:h-48 bg-gray-300"></div>
      <div className="p-6 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-xl border-4 border-white"></div>
          <div className="flex-1 min-w-0">
            <div className="h-6 bg-gray-300 rounded mb-2 w-48"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mb-3"></div>
            <div className="h-16 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-gray-50">
              <div className="w-5 h-5 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
