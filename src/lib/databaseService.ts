import { prisma } from './database';
import { Lead, Clinic, DashboardToken } from './types';

class DatabaseService {
  async validateToken(token: string): Promise<{ valid: boolean; clinic_id?: string; clinic_name?: string }> {
    try {
      const tokenRecord = await prisma.dashboardToken.findUnique({
        where: { token },
        include: { clinic: true },
      });

      if (!tokenRecord) {
        return { valid: false };
      }

      if (!tokenRecord.active) {
        return { valid: false };
      }

      if (new Date(tokenRecord.expiresAt) < new Date()) {
        return { valid: false };
      }

      return {
        valid: true,
        clinic_id: tokenRecord.clinicId,
        clinic_name: tokenRecord.clinic.name,
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return { valid: false };
    }
  }

  async getLeads(clinicId: string, filters?: {
    startDate?: string;
    endDate?: string;
    treatment?: string[];
  }): Promise<Lead[]> {
    try {
      const where: any = {
        clinicId,
      };

      if (filters?.startDate) {
        where.timestamp = {
          ...where.timestamp,
          gte: new Date(filters.startDate),
        };
      }

      if (filters?.endDate) {
        where.timestamp = {
          ...where.timestamp,
          lte: new Date(filters.endDate),
        };
      }

      if (filters?.treatment && filters.treatment.length > 0) {
        where.treatmentId = {
          in: filters.treatment,
        };
      }

      const leads = await prisma.lead.findMany({
        where,
        orderBy: { timestamp: 'desc' },
      });

      return leads.map(lead => ({
        timestamp: lead.timestamp.toISOString(),
        session_id: lead.sessionId,
        clinic_id: lead.clinicId,
        lang: lead.lang as 'AR' | 'EN',
        name: lead.name,
        phone: lead.phone,
        treatment_id: lead.treatmentId,
        message: lead.message,
        notes: lead.notes,
      }));
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }

  async getClinicById(clinicId: string): Promise<Clinic | null> {
    try {
      const clinic = await prisma.clinic.findUnique({
        where: { clinicId },
      });

      if (!clinic) {
        return null;
      }

      return {
        clinic_id: clinic.clinicId,
        name: clinic.name,
        city: clinic.city,
        whatsapp: clinic.whatsapp,
        phone: clinic.phone,
        email: clinic.email,
        website: clinic.website,
        address: clinic.address,
        hours: clinic.hours,
        notes: clinic.notes,
      };
    } catch (error) {
      console.error('Error fetching clinic:', error);
      return null;
    }
  }

  async updateLeadNotes(sessionId: string, notes?: string): Promise<boolean> {
    try {
      await prisma.lead.update({
        where: { sessionId },
        data: {
          notes: notes || undefined,
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating lead notes:', error);
      return false;
    }
  }

  async getStats(clinicId: string): Promise<{
    totalLeads: number;
    todayLeads: number;
    weeklyLeads: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [totalLeads, todayLeads, weeklyLeads] = await Promise.all([
        prisma.lead.count({ where: { clinicId } }),
        prisma.lead.count({ 
          where: { 
            clinicId,
            timestamp: { gte: today }
          } 
        }),
        prisma.lead.count({ 
          where: { 
            clinicId,
            timestamp: { gte: weekAgo }
          } 
        }),
      ]);

      return {
        totalLeads,
        todayLeads,
        weeklyLeads,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalLeads: 0,
        todayLeads: 0,
        weeklyLeads: 0,
      };
    }
  }

  // Webhook methods for N8N integration
  async createLead(leadData: Omit<Lead, 'timestamp'>): Promise<Lead | null> {
    try {
      const lead = await prisma.lead.create({
        data: {
          sessionId: leadData.session_id,
          clinicId: leadData.clinic_id,
          lang: leadData.lang,
          name: leadData.name,
          phone: leadData.phone,
          treatmentId: leadData.treatment_id,
          message: leadData.message,
          notes: leadData.notes,
          timestamp: new Date(),
        },
      });

      return {
        timestamp: lead.timestamp.toISOString(),
        session_id: lead.sessionId,
        clinic_id: lead.clinicId,
        lang: lead.lang as 'AR' | 'EN',
        name: lead.name,
        phone: lead.phone,
        treatment_id: lead.treatmentId,
        message: lead.message,
        notes: lead.notes,
      };
    } catch (error) {
      console.error('Error creating lead:', error);
      return null;
    }
  }

  async createClinic(clinicData: Omit<Clinic, 'clinic_id'> & { clinic_id: string }): Promise<Clinic | null> {
    try {
      const clinic = await prisma.clinic.create({
        data: {
          clinicId: clinicData.clinic_id,
          name: clinicData.name,
          city: clinicData.city,
          whatsapp: clinicData.whatsapp,
          phone: clinicData.phone,
          email: clinicData.email,
          website: clinicData.website,
          address: clinicData.address,
          hours: clinicData.hours,
          notes: clinicData.notes,
        },
      });

      return {
        clinic_id: clinic.clinicId,
        name: clinic.name,
        city: clinic.city,
        whatsapp: clinic.whatsapp,
        phone: clinic.phone,
        email: clinic.email,
        website: clinic.website,
        address: clinic.address,
        hours: clinic.hours,
        notes: clinic.notes,
      };
    } catch (error) {
      console.error('Error creating clinic:', error);
      return null;
    }
  }

  async createToken(tokenData: Omit<DashboardToken, 'created_at' | 'expires_at' | 'active'> & { 
    created_at: string; 
    expires_at: string; 
    active: boolean; 
  }): Promise<DashboardToken | null> {
    try {
      const token = await prisma.dashboardToken.create({
        data: {
          token: tokenData.token,
          clinicId: tokenData.clinic_id,
          createdAt: new Date(tokenData.created_at),
          expiresAt: new Date(tokenData.expires_at),
          active: tokenData.active,
        },
      });

      return {
        token: token.token,
        clinic_id: token.clinicId,
        created_at: token.createdAt.toISOString(),
        expires_at: token.expiresAt.toISOString(),
        active: token.active,
      };
    } catch (error) {
      console.error('Error creating token:', error);
      return null;
    }
  }
}

export const databaseService = new DatabaseService();