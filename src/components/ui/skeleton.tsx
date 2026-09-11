
import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced Shimmer Skeleton with GÜELL corporate colors
const ShimmerSkeleton = React.memo(function ShimmerSkeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        "shimmer-skeleton",
        className
      )}
      style={{
        background: 'linear-gradient(90deg, var(--color-surface-offset) 25%, var(--color-surface-dynamic) 50%, var(--color-surface-offset) 75%)',
      }}
      {...props}
    >
      {children}
    </div>
  )
});

// Food Card Skeleton
const FoodCardSkeleton = React.memo(function FoodCardSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <ShimmerSkeleton className="h-48 w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <ShimmerSkeleton className="h-6 w-3/4" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <ShimmerSkeleton className="h-4 w-full" />
          <ShimmerSkeleton className="h-4 w-5/6" />
        </div>
        
        {/* Price skeleton */}
        <div className="flex items-center justify-between">
          <ShimmerSkeleton className="h-6 w-20" />
          <ShimmerSkeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
});

// Restaurant Card Skeleton
const RestaurantCardSkeleton = React.memo(function RestaurantCardSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <ShimmerSkeleton className="h-32 w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Name skeleton */}
        <ShimmerSkeleton className="h-5 w-3/4" />
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="h-4 w-16" />
          <ShimmerSkeleton className="h-4 w-20" />
        </div>
        
        {/* Delivery info skeleton */}
        <div className="flex items-center gap-4">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
});

// Cart Item Skeleton
const CartItemSkeleton = React.memo(function CartItemSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-4">
        {/* Image skeleton */}
        <ShimmerSkeleton className="h-16 w-16 rounded-lg" />
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-5 w-3/4" />
          <ShimmerSkeleton className="h-4 w-1/2" />
        </div>
        
        {/* Price skeleton */}
        <ShimmerSkeleton className="h-6 w-16" />
      </div>
    </div>
  )
});

// Order Tracking Skeleton
function OrderTrackingSkeleton() {
  return (
    <div className="bg-card rounded-lg p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <ShimmerSkeleton className="h-6 w-32" />
        <ShimmerSkeleton className="h-4 w-24" />
      </div>
      
      {/* Progress skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <ShimmerSkeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <ShimmerSkeleton className="h-4 w-48 mb-2" />
              <ShimmerSkeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Hero Section Skeleton
function HeroSectionSkeleton() {
  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl p-8 text-white">
      <div className="max-w-2xl space-y-4">
        {/* Title skeleton */}
        <ShimmerSkeleton className="h-10 w-full" />
        
        {/* Subtitle skeleton */}
        <div className="space-y-2">
          <ShimmerSkeleton className="h-6 w-4/5" />
          <ShimmerSkeleton className="h-6 w-3/4" />
        </div>
        
        {/* CTA skeleton */}
        <ShimmerSkeleton className="h-12 w-40 rounded-full" />
      </div>
    </div>
  )
}

// Add shimmer styles
const ShimmerStyles = () => (
  <style>
    {`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      .shimmer-skeleton {
        background: linear-gradient(
          90deg,
          #f97316 0%,
          #ea580c 25%,
          #f97316 50%,
          #fb923c 75%,
          #f97316 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      
      .shimmer-skeleton-dark {
        background: linear-gradient(
          90deg,
          #ea580c 0%,
          #dc2626 25%,
          #ea580c 50%,
          #f97316 75%,
          #ea580c 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    `}
  </style>
)

export { 
  Skeleton, 
  ShimmerSkeleton, 
  FoodCardSkeleton, 
  RestaurantCardSkeleton, 
  CartItemSkeleton, 
  OrderTrackingSkeleton, 
  HeroSectionSkeleton,
  ShimmerStyles 
}
