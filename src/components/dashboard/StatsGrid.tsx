'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar, TrendingUp, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { StatsData } from '@/lib/types';
import { StatCard } from './StatCard';

interface StatsGridProps {
  stats: StatsData | null;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const [animatedStats, setAnimatedStats] = useState<StatsData | null>(null);

  useEffect(() => {
    if (stats) {
      // Animate numbers counting up
      const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
        const startTime = performance.now();
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = start + (end - start) * progress;
          callback(Math.floor(current));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      };

      // Animate each stat
      const duration = 1000;
      const newStats = { ...stats };
      
      animateValue(0, stats.totalLeads, duration, (value) => {
        setAnimatedStats(prev => prev ? { ...prev, totalLeads: value } : { ...stats, totalLeads: value });
      });
      
      setTimeout(() => {
        animateValue(0, stats.todayLeads, duration, (value) => {
          setAnimatedStats(prev => prev ? { ...prev, todayLeads: value } : { ...stats, todayLeads: value });
        });
      }, 200);
      
      setTimeout(() => {
        animateValue(0, stats.weekLeads, duration, (value) => {
          setAnimatedStats(prev => prev ? { ...prev, weekLeads: value } : { ...stats, weekLeads: value });
        });
      }, 400);
      
      setTimeout(() => {
        animateValue(0, stats.conversionRate, duration, (value) => {
          setAnimatedStats(prev => prev ? { ...prev, conversionRate: value } : { ...stats, conversionRate: value });
        });
      }, 600);
    }
  }, [stats]);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glassmorphism-card p-6 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  const currentStats = animatedStats || stats;

  const statCards = [
    {
      title: 'Total Leads',
      value: currentStats.totalLeads,
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
      trend: currentStats.trends.totalLeads,
      trendLabel: 'vs last period',
    },
    {
      title: 'Today',
      value: currentStats.todayLeads,
      icon: Calendar,
      color: 'from-cyan-500 to-blue-500',
      trend: currentStats.trends.todayLeads,
      trendLabel: 'vs yesterday',
    },
    {
      title: 'This Week',
      value: currentStats.weekLeads,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      trend: currentStats.trends.weekLeads,
      trendLabel: 'vs last week',
    },
    {
      title: 'Conversion Rate',
      value: `${currentStats.conversionRate}%`,
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
      trend: currentStats.trends.conversionRate,
      trendLabel: 'improvement',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          trendLabel={stat.trendLabel}
          delay={index * 100}
        />
      ))}
    </div>
  );
}
