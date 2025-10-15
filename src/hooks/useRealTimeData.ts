'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Lead, StatsData } from '@/lib/types';
import { APP_CONFIG } from '@/lib/constants';

interface UseRealTimeDataProps {
  clinicId: string;
  onNewLead?: (lead: Lead) => void;
  onStatsUpdate?: (stats: StatsData) => void;
}

export function useRealTimeData({ clinicId, onNewLead, onStatsUpdate }: UseRealTimeDataProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousLeadsRef = useRef<Lead[]>([]);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', {
        description: 'Real-time updates are now active',
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost', {
        description: 'Real-time updates are paused',
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial data load only - NO AUTO-REFRESH to prevent flickering
  useEffect(() => {
    if (!clinicId || !isOnline) return;
    
    const refreshData = async () => {
      // Prevent multiple simultaneous calls
      if (isRefreshing) return;
      
      try {
        setIsRefreshing(true);
        
        const [leadsResponse, statsResponse] = await Promise.all([
          fetch(`/api/leads?clinic_id=${clinicId}`),
          fetch(`/api/stats?clinic_id=${clinicId}`),
        ]);
        
        const [leadsData, statsData] = await Promise.all([
          leadsResponse.json(),
          statsResponse.json(),
        ]);
        
        if (leadsData.success) {
          const newLeads = leadsData.data.leads;
          const previousLeads = previousLeadsRef.current;
          
          // Check for new leads
          if (previousLeads.length > 0) {
            const newLeadIds = new Set(previousLeads.map(lead => lead.session_id));
            const actualNewLeads = newLeads.filter(lead => !newLeadIds.has(lead.session_id));
            
            if (actualNewLeads.length > 0) {
              actualNewLeads.forEach(lead => {
                onNewLead?.(lead);
                toast.success('New lead received!', {
                  description: `${lead.name} - ${lead.phone}`,
                  action: {
                    label: 'View',
                    onClick: () => {
                      // This would open the lead detail modal
                      console.log('Open lead:', lead);
                    },
                  },
                });
              });
            }
          }
          
          previousLeadsRef.current = newLeads;
        }
        
        if (statsData.success) {
          onStatsUpdate?.(statsData.data);
        }
        
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error refreshing data:', error);
        toast.error('Failed to refresh data', {
          description: 'Please check your connection',
        });
      } finally {
        setIsRefreshing(false);
      }
    };
    
    // Initial load only - NO AUTO-REFRESH
    refreshData();
    
    // DISABLED: No auto-refresh interval to prevent flickering
    // intervalRef.current = setInterval(refreshData, APP_CONFIG.refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [clinicId, isOnline, onNewLead, onStatsUpdate]);

  // Manual refresh
  const refresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      
      const [leadsResponse, statsResponse] = await Promise.all([
        fetch(`/api/leads?clinic_id=${clinicId}`),
        fetch(`/api/stats?clinic_id=${clinicId}`),
      ]);
      
      const [leadsData, statsData] = await Promise.all([
        leadsResponse.json(),
        statsResponse.json(),
      ]);
      
      if (leadsData.success) {
        const newLeads = leadsData.data.leads;
        const previousLeads = previousLeadsRef.current;
        
        // Check for new leads
        if (previousLeads.length > 0) {
          const newLeadIds = new Set(previousLeads.map(lead => lead.session_id));
          const actualNewLeads = newLeads.filter(lead => !newLeadIds.has(lead.session_id));
          
          if (actualNewLeads.length > 0) {
            actualNewLeads.forEach(lead => {
              onNewLead?.(lead);
            });
          }
        }
        
        previousLeadsRef.current = newLeads;
      }
      
      if (statsData.success) {
        onStatsUpdate?.(statsData.data);
      }
      
      setLastUpdate(new Date());
      toast.success('Data refreshed', {
        description: 'All data has been updated',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data', {
        description: 'Please try again',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isOnline,
    lastUpdate,
    isRefreshing,
    refresh,
  };
}
