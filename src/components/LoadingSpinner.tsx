'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const variantClasses = {
  primary: 'border-blue-600',
  secondary: 'border-gray-600',
  white: 'border-white',
};

export default function LoadingSpinner({ 
  size = 'lg', 
  variant = 'primary', 
  text,
  className 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <div className={cn(
        "animate-spin rounded-full border-b-2 border-t-2",
        sizeClasses[size],
        variantClasses[variant]
      )} />
      {text && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton loading components
export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-4 w-4 bg-gray-300 rounded"></div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
      
      <div className="w-full h-64 bg-gray-300 rounded-md mb-4"></div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 w-8 bg-gray-300 rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 w-8 bg-gray-300 rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 w-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded mb-2 w-48"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
