'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle, RefreshCw, Download, Phone, Mail, Calendar, Filter, Search, Zap, Activity, TrendingUp, Users, Clock } from 'lucide-react';

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter leads based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredLeads(leads);
    } else {
      const filtered = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.treatment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLeads(filtered);
    }
  }, [leads, searchTerm]);

  // WhatsApp action
  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Hi ${name}! Thank you for your interest in our services. How can we help you today?`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Phone call action
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  // Email action
  const handleEmail = (email: string, name: string) => {
    const subject = `Follow up - ${name}`;
    const body = `Hi ${name},\n\nThank you for your interest in our services. We'd love to discuss your needs further.\n\nBest regards,\n${clinic?.name}`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Phone', 'Treatment', 'Message', 'Date', 'Notes'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.phone,
        lead.treatment_id,
        lead.message,
        new Date(lead.timestamp).toLocaleDateString(),
        lead.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${clinic?.clinicId}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Refresh data
  const handleRefresh = async () => {
    if (!clinic) return;
    
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRkYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 animate-pulse"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s'}}></div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {clinic.name}
                </h1>
                <p className="text-gray-300 flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>{clinic.city} • {clinic.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-300 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  AI Dashboard
                </p>
                <p className="text-xs text-gray-500">ID: {token.substring(0, 8)}...</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Leads</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {stats.totalLeads}
                </p>
              </div>
            </div>
            
            <div className="group relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Today</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {stats.todayLeads}
                </p>
              </div>
            </div>
            
            <div className="group relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">This Week</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.weeklyLeads}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Actions Bar */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-300">
                {filteredLeads.length} of {leads.length} leads
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
              >
                <Download className="h-5 w-5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl overflow-hidden border border-white/20">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Recent Leads ({filteredLeads.length})</span>
            </h2>
          </div>
          
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl inline-block mb-4">
                <Users className="h-12 w-12 text-blue-400 mx-auto" />
              </div>
              <p className="text-xl text-gray-300 mb-2">No leads found</p>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Leads will appear here when captured via webhook'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Treatment</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.session_id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{lead.name}</div>
                            <div className="text-xs text-gray-400">ID: {lead.session_id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{lead.phone}</div>
                        <div className="text-xs text-gray-500">Phone</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                          {lead.treatment_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs truncate" title={lead.message}>
                          {lead.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{new Date(lead.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(lead.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleWhatsApp(lead.phone, lead.name)}
                            className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                            title="Send WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleCall(lead.phone)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200"
                            title="Call"
                          >
                            <Phone className="h-4 w-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleEmail(clinic?.email || '', lead.name)}
                            className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                            title="Email"
                          >
                            <Mail className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI-Powered Lead Management</p>
                <p className="text-xs text-gray-400">Real-time dashboard for {clinic.name}</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <p>Last updated: {new Date().toLocaleString()}</p>
              <p>Leads: {leads.length} • Filtered: {filteredLeads.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}