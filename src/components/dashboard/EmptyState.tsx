'use client';

import { User, Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onRefresh?: () => void;
  onClearFilters?: () => void;
}

export function EmptyState({ onRefresh, onClearFilters }: EmptyStateProps) {
  return (
    <div className="glassmorphism-card p-12 rounded-xl text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
        <User className="w-12 h-12 text-indigo-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">No leads found</h3>
      
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        It looks like there are no leads matching your current filters. 
        Try adjusting your search criteria or check back later for new leads.
      </p>
      
      <div className="flex items-center justify-center space-x-4">
        {onRefresh && (
          <Button
            onClick={onRefresh}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover-glow"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
        
        {onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="glassmorphism-button hover-glow"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="mt-8 text-sm text-slate-500">
        <p>Need help? Check your filters or contact support.</p>
      </div>
    </div>
  );
}
