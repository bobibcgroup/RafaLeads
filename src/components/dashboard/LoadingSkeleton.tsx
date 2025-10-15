'use client';

import { Card } from '@/components/ui/card';

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative z-10">
        {/* Header Skeleton */}
        <div className="glassmorphism-card border-b border-slate-700/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 shimmer" />
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-slate-700/50 rounded shimmer" />
                  <div className="h-4 w-24 bg-slate-700/50 rounded shimmer" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-20 bg-slate-700/50 rounded shimmer" />
                <div className="h-8 w-8 bg-slate-700/50 rounded shimmer" />
                <div className="h-8 w-8 bg-slate-700/50 rounded shimmer" />
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glassmorphism-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-lg shimmer" />
                  <div className="h-6 w-16 bg-slate-700/50 rounded shimmer" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-700/50 rounded shimmer" />
                  <div className="h-8 w-24 bg-slate-700/50 rounded shimmer" />
                  <div className="h-3 w-16 bg-slate-700/50 rounded shimmer" />
                </div>
              </Card>
            ))}
          </div>

          {/* Filter Bar Skeleton */}
          <Card className="glassmorphism-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-slate-700/50 rounded shimmer" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-20 bg-slate-700/50 rounded shimmer" />
                <div className="h-8 w-20 bg-slate-700/50 rounded shimmer" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-10 bg-slate-700/50 rounded shimmer" />
              <div className="h-10 w-32 bg-slate-700/50 rounded shimmer" />
            </div>
          </Card>

          {/* Table Skeleton */}
          <Card className="glassmorphism-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-slate-700/50 rounded shimmer" />
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-700/30">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6">
                  <div className="grid grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="h-4 bg-slate-700/50 rounded shimmer" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
