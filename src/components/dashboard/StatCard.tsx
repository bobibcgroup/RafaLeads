'use client';

import { useEffect, useState } from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend: number;
  trendLabel: string;
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  trendLabel, 
  delay = 0 
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const isPositiveTrend = trend > 0;
  const isNegativeTrend = trend < 0;

  return (
    <div
      className={cn(
        'glassmorphism-card p-6 rounded-xl transition-all duration-500 hover-glow group',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} glow-effect`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {trend !== 0 && (
          <div className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
            isPositiveTrend 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : isNegativeTrend 
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-500/20 text-slate-400'
          )}>
            {isPositiveTrend ? (
              <ArrowUp className="w-3 h-3" />
            ) : isNegativeTrend ? (
              <ArrowDown className="w-3 h-3" />
            ) : null}
            <span>{Math.abs(trend)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
          {title}
        </h3>
        
        <div className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
          {value}
        </div>
        
        <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
          {trendLabel}
        </p>
      </div>

      {/* Hover effect gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
