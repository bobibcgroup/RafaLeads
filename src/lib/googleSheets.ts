import { google } from 'googleapis';
import { Lead, Clinic, DashboardToken, LeadStatus } from './types';

class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async validateToken(token: string): Promise<{ valid: boolean; clinic_id?: string; clinic_name?: string }> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'dashboard_tokens!A:E',
      });

      const rows = response.data.values || [];
      const tokenRow = rows.find((row: any[]) => row[0] === token);

      if (!tokenRow) {
        return { valid: false };
      }

      const [, clinic_id, created_at, expires_at, active] = tokenRow;
      
      if (active !== 'TRUE') {
        return { valid: false };
      }

      if (new Date(expires_at) < new Date()) {
        return { valid: false };
      }

      // Get clinic name
      const clinic = await this.getClinicById(clinic_id);
      
      return {
        valid: true,
        clinic_id,
        clinic_name: clinic?.name || 'Unknown Clinic',
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return { valid: false };
    }
  }

  async getLeads(clinicId: string, filters?: {
    startDate?: string;
    endDate?: string;
    status?: LeadStatus[];
    treatment?: string[];
  }): Promise<Lead[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'leads!A:M',
      });

      const rows = response.data.values || [];
      const headers = rows[0];
      const dataRows = rows.slice(1);

      const leads: Lead[] = dataRows
        .filter((row: any[]) => row[2] === clinicId) // Filter by clinic_id
        .map((row: any[]) => {
          const lead: Lead = {
            timestamp: row[0] || '',
            session_id: row[1] || '',
            clinic_id: row[2] || '',
            source: row[3] || '',
            lang: (row[4] as 'AR' | 'EN') || 'EN',
            event: row[5] || '',
            name: row[6] || '',
            phone: row[7] || '',
            treatment_id: row[8] || '',
            message: row[9] || '',
            email: row[10] || '',
            status: (row[11] as LeadStatus) || 'New',
            notes: row[12] || '',
          };
          return lead;
        });

      // Apply filters
      let filteredLeads = leads;

      if (filters?.startDate) {
        filteredLeads = filteredLeads.filter(lead => 
          new Date(lead.timestamp) >= new Date(filters.startDate!)
        );
      }

      if (filters?.endDate) {
        filteredLeads = filteredLeads.filter(lead => 
          new Date(lead.timestamp) <= new Date(filters.endDate!)
        );
      }

      if (filters?.status && filters.status.length > 0) {
        filteredLeads = filteredLeads.filter(lead => 
          filters.status!.includes(lead.status)
        );
      }

      if (filters?.treatment && filters.treatment.length > 0) {
        filteredLeads = filteredLeads.filter(lead => 
          filters.treatment!.includes(lead.treatment_id)
        );
      }

      return filteredLeads;
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }

  async getClinicById(clinicId: string): Promise<Clinic | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'clinics!A:J',
      });

      const rows = response.data.values || [];
      const clinicRow = rows.find((row: any[]) => row[0] === clinicId);

      if (!clinicRow) {
        return null;
      }

      const [
        clinic_id,
        name,
        city,
        whatsapp,
        phone,
        email,
        website,
        address,
        hours,
        notes,
      ] = clinicRow;

      return {
        clinic_id,
        name,
        city,
        whatsapp,
        phone,
        email,
        website,
        address,
        hours,
        notes,
      };
    } catch (error) {
      console.error('Error fetching clinic:', error);
      return null;
    }
  }

  async updateLeadStatus(sessionId: string, status: LeadStatus, notes?: string): Promise<boolean> {
    try {
      // First, find the row with the session_id
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'leads!A:M',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row: any[]) => row[1] === sessionId);

      if (rowIndex === -1) {
        return false;
      }

      // Update the status and notes
      const updates = [
        {
          range: `leads!L${rowIndex + 1}`,
          values: [[status]],
        },
      ];

      if (notes) {
        updates.push({
          range: `leads!M${rowIndex + 1}`,
          values: [[notes]],
        });
      }

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates,
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating lead status:', error);
      return false;
    }
  }

  async getStats(clinicId: string): Promise<{
    totalLeads: number;
    todayLeads: number;
    weekLeads: number;
    conversionRate: number;
    trends: {
      totalLeads: number;
      todayLeads: number;
      weekLeads: number;
      conversionRate: number;
    };
  }> {
    const leads = await this.getLeads(clinicId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const totalLeads = leads.length;
    const todayLeads = leads.filter(lead => 
      new Date(lead.timestamp) >= today
    ).length;
    const weekLeads = leads.filter(lead => 
      new Date(lead.timestamp) >= weekAgo
    ).length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Calculate trends (simplified - in real app, you'd compare with previous periods)
    const trends = {
      totalLeads: Math.floor(totalLeads * 0.1), // 10% growth
      todayLeads: Math.floor(todayLeads * 0.2), // 20% growth
      weekLeads: Math.floor(weekLeads * 0.15), // 15% growth
      conversionRate: Math.floor(conversionRate * 0.05), // 5% growth
    };

    return {
      totalLeads,
      todayLeads,
      weekLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      trends,
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();
