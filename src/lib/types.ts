export interface Lead {
  timestamp: string;
  session_id: string;
  clinic_id: string;
  lang: 'AR' | 'EN';
  name: string;
  phone: string;
  treatment_id: string;
  message: string;
  notes?: string;
}

export interface Clinic {
  clinic_id: string;
  name: string;
  city: string;
  whatsapp: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  hours: string;
  notes?: string;
}

export interface DashboardToken {
  token: string;
  clinic_id: string;
  created_at: string;
  expires_at: string;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  clinic_id?: string;
  clinic_name?: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsData {
  totalLeads: number;
  todayLeads: number;
  weeklyLeads: number;
}

export interface FilterOptions {
  search?: string;
  treatment?: string[];
  language?: 'AR' | 'EN' | 'ALL';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface Treatment {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface NotificationData {
  id: string;
  type: 'new_lead' | 'status_update' | 'error';
  title: string;
  message: string;
  lead?: Lead;
  timestamp: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  filename?: string;
  filters?: FilterOptions;
}
