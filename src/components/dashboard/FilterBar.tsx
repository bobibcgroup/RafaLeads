'use client';

import { useState } from 'react';
import { Search, Filter, Download, X, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterOptions, LeadStatus } from '@/lib/types';
import { TREATMENTS } from '@/lib/constants';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: () => void;
}

export function FilterBar({ filters, onFiltersChange, onExport }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleStatusToggle = (status: LeadStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ 
      ...filters, 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    });
  };

  const handleTreatmentToggle = (treatment: string) => {
    const currentTreatments = filters.treatment || [];
    const newTreatments = currentTreatments.includes(treatment)
      ? currentTreatments.filter(t => t !== treatment)
      : [...currentTreatments, treatment];
    
    onFiltersChange({ 
      ...filters, 
      treatment: newTreatments.length > 0 ? newTreatments : undefined 
    });
  };

  const handleLanguageChange = (language: 'AR' | 'EN' | 'ALL') => {
    onFiltersChange({ 
      ...filters, 
      language: language === 'ALL' ? undefined : language 
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.treatment && filters.treatment.length > 0) count++;
    if (filters.language) count++;
    if (filters.dateRange) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="glassmorphism-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-white">Filters & Search</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="glassmorphism-button hover-glow"
          >
            <Filter className="w-4 h-4 mr-2" />
            {isExpanded ? 'Less' : 'More'} Filters
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="glassmorphism-button hover-glow text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Main search bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search leads by name, phone, or message..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="glassmorphism-input pl-10 focus-ring"
          />
        </div>
        
        <Button
          onClick={onExport}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover-glow"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="space-y-6 pt-4 border-t border-slate-700/50">
          {/* Status filters */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {(['New', 'Contacted', 'Booked', 'Converted', 'Not Interested'] as LeadStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={filters.status?.includes(status) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusToggle(status)}
                  className={cn(
                    'transition-all duration-200',
                    filters.status?.includes(status)
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      : 'glassmorphism-button hover-glow'
                  )}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Treatment filters */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Treatment</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TREATMENTS).map(([key, treatment]) => (
                <Button
                  key={key}
                  variant={filters.treatment?.includes(key) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTreatmentToggle(key)}
                  className={cn(
                    'transition-all duration-200',
                    filters.treatment?.includes(key)
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'glassmorphism-button hover-glow'
                  )}
                >
                  {treatment.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Language filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Language</h3>
            <Select
              value={filters.language || 'ALL'}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="glassmorphism-input w-48">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glassmorphism-card border-slate-700/50">
                <SelectItem value="ALL">All Languages</SelectItem>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="AR">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Date Range</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  placeholder="Start date"
                  className="glassmorphism-input w-40"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value,
                    }
                  })}
                />
              </div>
              <span className="text-slate-400">to</span>
              <Input
                type="date"
                placeholder="End date"
                className="glassmorphism-input w-40"
                value={filters.dateRange?.end || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: {
                    ...filters.dateRange,
                    end: e.target.value,
                  }
                })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
