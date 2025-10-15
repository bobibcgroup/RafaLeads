'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
  const [newClinic, setNewClinic] = useState({
    clinic_id: '',
    name: '',
    city: '',
    whatsapp: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    hours: '',
    notes: '',
  });

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

  const createClinic = async () => {
    try {
      const response = await fetch('/api/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClinic),
      });

      const data = await response.json();
      if (data.success) {
        setNewClinic({
          clinic_id: '',
          name: '',
          city: '',
          whatsapp: '',
          phone: '',
          email: '',
          website: '',
          address: '',
          hours: '',
          notes: '',
        });
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating clinic:', error);
      alert('Failed to create clinic');
    }
  };

  const createToken = async (clinicId: string) => {
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, days: 365 }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
        alert(`Token created: ${data.data.token}\nDashboard URL: ${data.data.dashboard_url}`);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Failed to create token');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">RafaLeads Admin Panel</h1>

      {/* Create New Clinic */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Clinic</CardTitle>
          <CardDescription>Add a new clinic to the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clinic_id">Clinic ID</Label>
              <Input
                id="clinic_id"
                value={newClinic.clinic_id}
                onChange={(e) => setNewClinic({ ...newClinic, clinic_id: e.target.value })}
                placeholder="e.g., atos"
              />
            </div>
            <div>
              <Label htmlFor="name">Clinic Name</Label>
              <Input
                id="name"
                value={newClinic.name}
                onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
                placeholder="e.g., Atos Aesthetic Clinic"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newClinic.city}
                onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
                placeholder="e.g., Dubai"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClinic.email}
                onChange={(e) => setNewClinic({ ...newClinic, email: e.target.value })}
                placeholder="e.g., info@atosclinic.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newClinic.phone}
                onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                placeholder="e.g., +971501234567"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={newClinic.whatsapp}
                onChange={(e) => setNewClinic({ ...newClinic, whatsapp: e.target.value })}
                placeholder="e.g., +971501234567"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={newClinic.address}
              onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
              placeholder="e.g., Dubai Marina, UAE"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                value={newClinic.hours}
                onChange={(e) => setNewClinic({ ...newClinic, hours: e.target.value })}
                placeholder="e.g., Sun-Thu 9AM-9PM"
              />
            </div>
            <div>
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                value={newClinic.website}
                onChange={(e) => setNewClinic({ ...newClinic, website: e.target.value })}
                placeholder="e.g., https://atosclinic.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={newClinic.notes}
              onChange={(e) => setNewClinic({ ...newClinic, notes: e.target.value })}
              placeholder="Additional notes about the clinic"
            />
          </div>
          <Button onClick={createClinic} className="w-full">
            Create Clinic
          </Button>
        </CardContent>
      </Card>

      {/* Clinics List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Clinics ({clinics.length})</CardTitle>
          <CardDescription>Manage existing clinics and create dashboard tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clinics.map((clinic) => (
              <div key={clinic.clinicId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{clinic.name}</h3>
                  <p className="text-sm text-gray-600">{clinic.city} • {clinic.email}</p>
                  <p className="text-xs text-gray-500">ID: {clinic.clinicId}</p>
                </div>
                <Button onClick={() => createToken(clinic.clinicId)}>
                  Create Token
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tokens List */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Tokens ({tokens.length})</CardTitle>
          <CardDescription>Active dashboard access tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tokens.map((token) => (
              <div key={token.token} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{token.clinic_name}</h3>
                  <Badge variant={token.active ? "default" : "secondary"}>
                    {token.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">Token: {token.token}</p>
                <p className="text-sm text-gray-500 mb-2">
                  Expires: {new Date(token.expires_at).toLocaleDateString()}
                </p>
                <a
                  href={token.dashboard_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Open Dashboard →
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
