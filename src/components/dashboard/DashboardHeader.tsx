'use client';

import { useState } from 'react';
import { RefreshCw, Wifi, WifiOff, Settings, Bell } from 'lucide-react';
import { Clinic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  clinic: Clinic;
  lastRefresh: Date;
  onRefresh: () => void;
  isLoading: boolean;
  isOnline?: boolean;
}

export function DashboardHeader({ clinic, lastRefresh, onRefresh, isLoading, isOnline: propIsOnline }: DashboardHeaderProps) {
  const [isOnline, setIsOnline] = useState(propIsOnline ?? true);

  // Monitor online status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <header className="glassmorphism-card border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-effect">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">
                  AiRafa Leads
                </h1>
                <p className="text-slate-400 text-xs">
                  {clinic.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} ${isOnline ? 'pulse-glow' : ''}`} />
              <span className="text-xs text-slate-300">
                {isOnline ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Updated: {formatLastRefresh(lastRefresh)}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="glassmorphism-button hover-glow h-8 px-3"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="glassmorphism-button hover-glow h-8 px-3"
              >
                <Bell className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Left side - Logo and Clinic Name */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-effect">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  AiRafa Leads
                </h1>
                <p className="text-slate-400 text-sm">
                  {clinic.name} • {clinic.city}
                </p>
              </div>
            </div>
          </div>

          {/* Center - Live Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} ${isOnline ? 'pulse-glow' : ''}`} />
              <span className="text-sm text-slate-300">
                {isOnline ? 'Live' : 'Offline'}
              </span>
            </div>
            
            <div className="text-sm text-slate-400">
              Last updated: {formatLastRefresh(lastRefresh)}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="glassmorphism-button hover-glow"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="glassmorphism-button hover-glow"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="glassmorphism-button hover-glow"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Connection Status Badge */}
            <Badge 
              variant="outline" 
              className={`${isOnline 
                ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                : 'border-red-500/50 text-red-400 bg-red-500/10'
              }`}
            >
              <Wifi className="w-3 h-3 mr-1" />
              {isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
