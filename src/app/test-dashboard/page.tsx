'use client';

import { useState } from 'react';

export default function TestDashboard() {
  const [token, setToken] = useState('demo-token-123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testToken = async () => {
    setLoading(true);
    try {
      console.log('Testing token:', token);
      
      const response = await fetch('/api/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      console.log('Token validation result:', data);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testClinic = async (clinicId: string) => {
    setLoading(true);
    try {
      console.log('Testing clinic:', clinicId);
      
      const response = await fetch(`/api/clinic?clinic_id=${clinicId}`);
      const data = await response.json();
      console.log('Clinic result:', data);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testLeads = async (clinicId: string) => {
    setLoading(true);
    try {
      console.log('Testing leads:', clinicId);
      
      const response = await fetch(`/api/leads?clinic_id=${clinicId}`);
      const data = await response.json();
      console.log('Leads result:', data);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard API Test</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Token:</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testToken}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Test Token Validation
          </button>
          
          <button
            onClick={() => testClinic('clinic-001')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Test Clinic API
          </button>
          
          <button
            onClick={() => testLeads('clinic-001')}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
          >
            Test Leads API
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p>Loading...</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Dashboard URLs:</h2>
        <div className="space-y-2">
          <a 
            href="/dashboard/demo-token-123" 
            target="_blank"
            className="block p-2 bg-blue-100 rounded hover:bg-blue-200"
          >
            /dashboard/demo-token-123
          </a>
          <a 
            href="/dashboard/test-token" 
            target="_blank"
            className="block p-2 bg-green-100 rounded hover:bg-green-200"
          >
            /dashboard/test-token
          </a>
        </div>
      </div>
    </div>
  );
}
