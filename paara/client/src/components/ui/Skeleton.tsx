import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// Base skeleton with animate-pulse and brand cream gradient
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#F5EDD8]", className)}
      {...props}
    />
  );
}

// Matches the product card shape: square image + 2 text lines + price
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[rgba(28,58,42,0.08)]">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full mt-1" />
      </div>
    </div>
  );
}

// Matches a dashboard stat card
export function DashboardStatSkeleton() {
  return (
    <div className="bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.08)] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28 rounded-full mb-2" />
      <Skeleton className="h-3 w-36 rounded-full" />
    </div>
  );
}

// Matches a table row — cols determines number of cell skeletons
export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full rounded-full" />
        </td>
      ))}
    </tr>
  );
}
