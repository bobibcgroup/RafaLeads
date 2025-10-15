'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';

interface Clinic {
  clinicId: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Token {
  token: string;
  clinic_id: string;
  clinic_name: string;
  created_at: string;
  expires_at: string;
  active: boolean;
  dashboard_url: string;
}

export default function AdminPanel() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingToken, setCreatingToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching data...');
      
      const [clinicsRes, tokensRes] = await Promise.all([
        fetch('/api/clinics'),
        fetch('/api/tokens'),
      ]);

      const clinicsData = await clinicsRes.json();
      const tokensData = await tokensRes.json();

      console.log('📊 Clinics data:', clinicsData);
      console.log('🔑 Tokens data:', tokensData);

      if (clinicsData.success) setClinics(clinicsData.data);
      if (tokensData.success) setTokens(tokensData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createToken = async (clinicId: string) => {
    setCreatingToken(clinicId);
    try {
      console.log('🔑 Creating token for clinic:', clinicId);
      
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, days: 365 }),
      });

      const data = await response.json();
      console.log('🔑 Token creation response:', data);
      
      if (data.success) {
        await fetchData();
        
        try {
          await navigator.clipboard.writeText(data.data.token);
          alert(`✅ Token created!\n\nToken: ${data.data.token}\nDashboard: ${data.data.dashboard_url}\n\nCopied to clipboard!`);
        } catch (clipboardError) {
          alert(`✅ Token created!\n\nToken: ${data.data.token}\nDashboard: ${data.data.dashboard_url}`);
        }
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingToken(null);
    }
  };

  const deleteToken = async (token: string) => {
    if (!confirm('Delete this token? This will revoke dashboard access.')) return;

    try {
      const response = await fetch('/api/tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Token deleted!');
        fetchData();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting token:', error);
      alert('❌ Failed to delete token');
    }
  };

  const syncClinics = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Clinics synced!');
        fetchData();
      } else {
        alert(`❌ Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('❌ Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('✅ Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RafaLeads Admin Panel</h1>
        <p className="text-gray-600">Manage clinics and dashboard access tokens</p>
      </div>

      {/* Sync Button */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Database Sync</CardTitle>
          <CardDescription>Sync clinics from your webhook</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={syncClinics} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Clinics from Webhook
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Clinics and Tokens */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clinics & Tokens ({clinics.length} clinics, {tokens.length} tokens)</CardTitle>
              <CardDescription>Manage dashboard access for each clinic</CardDescription>
            </div>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {clinics.map((clinic) => {
              const token = tokens.find(t => t.clinic_id === clinic.clinicId);
              return (
                <div key={clinic.clinicId} className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{clinic.name}</h3>
                      <p className="text-gray-600 mb-2">{clinic.city} • {clinic.email}</p>
                      <p className="text-sm text-gray-500">ID: {clinic.clinicId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {token ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Token Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No Token</Badge>
                      )}
                    </div>
                  </div>

                  {token ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Dashboard Token:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(token.token)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Token
                          </Button>
                        </div>
                        <code className="text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded block break-all">
                          {token.token}
                        </code>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Dashboard URL:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(token.dashboard_url)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy URL
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded flex-1 break-all">
                            {token.dashboard_url}
                          </code>
                          <Button
                            size="sm"
                            onClick={() => window.open(token.dashboard_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <p>Created: {new Date(token.created_at).toLocaleDateString()}</p>
                          <p>Expires: {new Date(token.expires_at).toLocaleDateString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteToken(token.token)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Token
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">No dashboard token generated yet</p>
                      <Button
                        onClick={() => createToken(clinic.clinicId)}
                        disabled={creatingToken === clinic.clinicId}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {creatingToken === clinic.clinicId ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Generate Dashboard Token'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}