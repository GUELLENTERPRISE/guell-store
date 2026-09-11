
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'products' | 'categories' | 'page' | 'button';
  count?: number;
  message?: string;
}

const LoadingState = ({ type = 'page', count = 4, message }: LoadingStateProps) => {
  if (type === 'button') {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{message || 'Loading...'}</span>
      </div>
    );
  }

  if (type === 'products') {
    return (
      <div className="grid grid-cols-2 gap-4 px-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="w-full h-48 rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'categories') {
    return (
      <div className="px-4">
        <Skeleton className="h-6 w-48 mb-3" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-12 h-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-muted-foreground">{message || 'Loading...'}</p>
      </div>
    </div>
  );
};

export default LoadingState;
