'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clinicsRes, tokensRes] = await Promise.all([
        fetch('/api/clinics'),
        fetch('/api/tokens'),
      ]);

      const clinicsData = await clinicsRes.json();
      const tokensData = await tokensRes.json();

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
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, days: 365 }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
        // Copy token to clipboard
        await navigator.clipboard.writeText(data.data.token);
        alert(`Token created and copied to clipboard!\nDashboard URL: ${data.data.dashboard_url}`);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Failed to create token');
    } finally {
      setCreatingToken(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getTokenForClinic = (clinicId: string) => {
    return tokens.find(token => token.clinic_id === clinicId);
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Access Management</h1>
        <p className="text-gray-600">Manage dashboard access tokens for each clinic</p>
      </div>

      {/* Clinics and Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Clinics & Dashboard Access ({clinics.length})</CardTitle>
          <CardDescription>
            Clinics are automatically synced from your Google Sheet. Generate dashboard tokens to give access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {clinics.map((clinic) => {
              const token = getTokenForClinic(clinic.clinicId);
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

                      <div className="text-sm text-gray-500">
                        <p>Created: {new Date(token.created_at).toLocaleDateString()}</p>
                        <p>Expires: {new Date(token.expires_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">No dashboard access token generated yet</p>
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

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button 
              onClick={() => window.open('/api/sync/clinics', '_blank')} 
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Check Sync Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
