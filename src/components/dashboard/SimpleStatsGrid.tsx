'use client';

import { StatsData } from '@/lib/types';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface SimpleStatsGridProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function SimpleStatsGrid({ stats, isLoading }: SimpleStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glassmorphism p-6 rounded-2xl border border-white/10 animate-pulse"
          >
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-8 bg-white/20 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Today',
      value: stats.todayLeads,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'This Week',
      value: stats.weeklyLeads,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="glassmorphism p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-white/70 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                <span className="text-xs text-white/60">Active</span>
              </div>
              <div className="text-xs text-white/60">
                {stat.title === 'Total Leads' && 'All time'}
                {stat.title === 'Today' && 'Last 24h'}
                {stat.title === 'This Week' && 'Last 7 days'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
