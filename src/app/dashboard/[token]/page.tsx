'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Clinic {
  clinicId: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
}

interface Lead {
  session_id: string;
  name: string;
  phone: string;
  treatment_id: string;
  message: string;
  timestamp: string;
  notes?: string;
}

interface Stats {
  totalLeads: number;
  todayLeads: number;
  weeklyLeads: number;
}

export default function DashboardPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !token) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Dashboard useEffect triggered');
        console.log('🔍 Token from params:', token);
        console.log('🔍 Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

        // Step 1: Validate token
        console.log('🔑 Validating token...');
        const tokenResponse = await fetch('/api/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`Token validation failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('🔑 Token validation result:', tokenData);

        if (!tokenData.success) {
          setError(`Invalid token: ${tokenData.error || 'Unknown error'}`);
          return;
        }

        const { clinic_id, clinic_name } = tokenData.data;
        console.log('✅ Token valid for clinic:', clinic_id, clinic_name);

        // Step 2: Fetch clinic data
        console.log('🏥 Fetching clinic data...');
        const clinicResponse = await fetch(`/api/clinic?clinic_id=${clinic_id}`);
        
        if (!clinicResponse.ok) {
          throw new Error(`Clinic fetch failed: ${clinicResponse.status} ${clinicResponse.statusText}`);
        }

        const clinicData = await clinicResponse.json();
        console.log('🏥 Clinic data:', clinicData);

        if (clinicData.success) {
          setClinic(clinicData.data);
        } else {
          setError(`Clinic not found: ${clinicData.error || 'Unknown error'}`);
          return;
        }

        // Step 3: Fetch leads
        console.log('📋 Fetching leads...');
        const leadsResponse = await fetch(`/api/leads?clinic_id=${clinic_id}`);
        
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          console.log('📋 Leads data:', leadsData);
          if (leadsData.success) {
            setLeads(leadsData.data.leads || []);
          }
        } else {
          console.warn('Failed to fetch leads:', leadsResponse.status);
        }

        // Step 4: Fetch stats
        console.log('📊 Fetching stats...');
        const statsResponse = await fetch(`/api/stats?clinic_id=${clinic_id}`);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('📊 Stats data:', statsData);
          if (statsData.success) {
            setStats(statsData.data);
          }
        } else {
          console.warn('Failed to fetch stats:', statsResponse.status);
        }

      } catch (err) {
        console.error('❌ Dashboard error:', err);
        setError(`Failed to load dashboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mounted, token]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Initializing Dashboard</h2>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-gray-400">Validating token and fetching data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Dashboard Error</h1>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Token: {token}</p>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Clinic Not Found</h2>
          <p className="text-gray-400">Unable to load clinic information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold">{clinic.name}</h1>
              <p className="text-gray-400">{clinic.city} • {clinic.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Dashboard</p>
              <p className="text-xs text-gray-500">Token: {token.substring(0, 8)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Leads</h3>
              <p className="text-3xl font-bold text-blue-400">{stats.totalLeads}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Today</h3>
              <p className="text-3xl font-bold text-green-400">{stats.todayLeads}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">This Week</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.weeklyLeads}</p>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Recent Leads ({leads.length})</h2>
          </div>
          
          {leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-4">No leads found for this clinic</p>
              <p className="text-sm text-gray-500">Leads will appear here when they are captured via webhook</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Treatment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {leads.map((lead) => (
                    <tr key={lead.session_id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {lead.treatment_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                        {lead.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Clinic ID: {clinic.clinicId}</p>
            <p>Token: {token}</p>
            <p>Leads Count: {leads.length}</p>
            <p>Last Updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}