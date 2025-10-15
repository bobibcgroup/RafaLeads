'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SimpleStatsGrid } from '@/components/dashboard/SimpleStatsGrid';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { LeadDetailModal } from '@/components/dashboard/LeadDetailModal';
import { NewLeadNotification } from '@/components/dashboard/NewLeadNotification';
import { LoadingSkeleton } from '@/components/dashboard/LoadingSkeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Clinic, Lead, StatsData, FilterOptions } from '@/lib/types';
import { useRealTimeData } from '@/hooks/useRealTimeData';

export default function DashboardPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Real-time data hook
  const { isOnline, lastUpdate, isRefreshing, refresh } = useRealTimeData({
    clinicId: clinic?.clinic_id || '',
    onNewLead: (newLead) => {
      setLeads(prev => [newLead, ...prev]);
    },
    onStatsUpdate: (newStats) => {
      setStats(newStats);
    },
  });

  // Validate token and fetch initial data
  useEffect(() => {
    const validateAndFetch = async () => {
      try {
        setIsValidating(true);
        
        // Validate token
        const tokenResponse = await fetch('/api/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.success) {
          setError('Invalid or expired token');
          return;
        }
        
        const { clinic_id, clinic_name } = tokenData.data;
        
        // Fetch clinic data
        const clinicResponse = await fetch(`/api/clinic?clinic_id=${clinic_id}`);
        const clinicData = await clinicResponse.json();
        
        if (clinicData.success) {
          setClinic(clinicData.data);
        }
        
        // Fetch initial data
        await fetchData(clinic_id);
        
      } catch (err) {
        console.error('Error validating token:', err);
        setError('Failed to validate token');
      } finally {
        setIsValidating(false);
        setIsLoading(false);
      }
    };
    
    validateAndFetch();
  }, [token]);

  // Apply filters to leads
  const filteredLeads = leads.filter(lead => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm) ||
        lead.phone.includes(searchTerm) ||
        lead.message.toLowerCase().includes(searchTerm) ||
        lead.treatment_id.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }
    
    
    if (filters.treatment && filters.treatment.length > 0) {
      if (!filters.treatment.includes(lead.treatment_id)) return false;
    }
    
    if (filters.language && filters.language !== 'ALL' && lead.lang !== filters.language) {
      return false;
    }
    
    if (filters.dateRange) {
      const leadDate = new Date(lead.timestamp);
      if (filters.dateRange.start && leadDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && leadDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }
    
    return true;
  });

  const fetchData = async (clinicId: string) => {
    try {
      const [leadsResponse, statsResponse] = await Promise.all([
        fetch(`/api/leads?clinic_id=${clinicId}&${new URLSearchParams({
          ...(filters.startDate && { start_date: filters.startDate }),
          ...(filters.endDate && { end_date: filters.endDate }),
          ...(filters.status && { status: filters.status.join(',') }),
          ...(filters.treatment && { treatment: filters.treatment.join(',') }),
        })}`),
        fetch(`/api/stats?clinic_id=${clinicId}`),
      ]);
      
      const [leadsData, statsData] = await Promise.all([
        leadsResponse.json(),
        statsResponse.json(),
      ]);
      
      if (leadsData.success) {
        setLeads(leadsData.data.leads);
      }
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleRefresh = async () => {
    if (!clinic) return;
    await refresh();
  };

  const handleLeadUpdate = async (sessionId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/leads/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setLeads(prev => prev.map(lead => 
          lead.session_id === sessionId 
            ? { ...lead, status: status as any, notes: notes || lead.notes }
            : lead
        ));
        
        // Refresh stats
        if (clinic) {
          const statsResponse = await fetch(`/api/stats?clinic_id=${clinic.clinic_id}`);
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
        }
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  if (isValidating || isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="glassmorphism-card p-8 rounded-xl text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-slate-300">{error}</p>
          <p className="text-slate-400 text-sm mt-2">Token: {token}</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="glassmorphism-card p-8 rounded-xl text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Loading Clinic Data</h1>
          <p className="text-slate-300">Please wait while we load your clinic information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative z-10">
        <DashboardHeader
          clinic={clinic}
          lastRefresh={lastRefresh || lastUpdate}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
          isOnline={isOnline}
        />
        
        <main className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
          <SimpleStatsGrid stats={stats} />
          
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onExport={() => {
              // TODO: Implement CSV export
              console.log('Export CSV');
            }}
          />
          
          {filteredLeads.length === 0 ? (
            <EmptyState 
              onRefresh={handleRefresh}
              onClearFilters={() => setFilters({})}
            />
          ) : (
            <LeadsTable
              leads={filteredLeads}
              onLeadSelect={setSelectedLead}
              onLeadUpdate={handleLeadUpdate}
            />
          )}
        </main>
        
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            clinic={clinic}
            onClose={() => setSelectedLead(null)}
            onUpdate={handleLeadUpdate}
          />
        )}
        
        <NewLeadNotification />
      </div>
    </div>
  );
}
