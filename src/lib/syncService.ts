import { databaseService } from './databaseService';

interface ClinicData {
  row_number: number;
  clinic_id: string;
  name: string;
  city: string;
  whatsapp: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  hours: string;
  notes: string;
}

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly WEBHOOK_URL = 'https://primary-production-eb3d.up.railway.app/webhook/getClinics';

  async startSync() {
    console.log('🔄 Starting clinic sync service...');
    
    // Initial sync
    await this.syncClinics();
    
    // Set up interval
    this.syncInterval = setInterval(async () => {
      await this.syncClinics();
    }, this.SYNC_INTERVAL);
    
    console.log(`✅ Clinic sync service started (every ${this.SYNC_INTERVAL / 1000 / 60} minutes)`);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Clinic sync service stopped');
    }
  }

  private async syncClinics() {
    try {
      console.log('🔄 Syncing clinics from webhook...');
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const clinics: ClinicData[] = await response.json();
      
      if (!Array.isArray(clinics)) {
        throw new Error('Invalid response format: expected array');
      }

      console.log(`📊 Received ${clinics.length} clinics from webhook`);

      let successCount = 0;
      let errorCount = 0;

      for (const clinicData of clinics) {
        try {
          // Validate required fields
          if (!clinicData.clinic_id || !clinicData.name) {
            console.warn(`⚠️ Skipping clinic with missing required fields:`, clinicData);
            continue;
          }

          // Check if clinic exists
          const existingClinic = await databaseService.getClinicById(clinicData.clinic_id);
          
          if (existingClinic) {
            // Update existing clinic
            await this.updateClinic(clinicData);
            console.log(`✅ Updated clinic: ${clinicData.name} (${clinicData.clinic_id})`);
          } else {
            // Create new clinic
            await this.createClinic(clinicData);
            console.log(`✅ Created clinic: ${clinicData.name} (${clinicData.clinic_id})`);
          }
          
          successCount++;
        } catch (error) {
          console.error(`❌ Error processing clinic ${clinicData.clinic_id}:`, error);
          errorCount++;
        }
      }

      console.log(`🎉 Sync completed: ${successCount} successful, ${errorCount} errors`);
      
      // Log sync result
      await this.logSyncResult(successCount, errorCount, clinics.length);
      
    } catch (error) {
      console.error('❌ Clinic sync failed:', error);
      await this.logSyncError(error);
    }
  }

  private async createClinic(clinicData: ClinicData) {
    const clinic = await databaseService.createClinic({
      clinic_id: clinicData.clinic_id,
      name: clinicData.name,
      city: clinicData.city || 'Unknown',
      whatsapp: clinicData.whatsapp || clinicData.phone || '',
      phone: clinicData.phone || '',
      email: clinicData.email || '',
      website: clinicData.website || null,
      address: clinicData.address || '',
      hours: clinicData.hours || '',
      notes: clinicData.notes || null,
    });

    if (!clinic) {
      throw new Error('Failed to create clinic');
    }

    return clinic;
  }

  private async updateClinic(clinicData: ClinicData) {
    const { prisma } = await import('./database');
    
    const updatedClinic = await prisma.clinic.update({
      where: { clinicId: clinicData.clinic_id },
      data: {
        name: clinicData.name,
        city: clinicData.city || 'Unknown',
        whatsapp: clinicData.whatsapp || clinicData.phone || '',
        phone: clinicData.phone || '',
        email: clinicData.email || '',
        website: clinicData.website || null,
        address: clinicData.address || '',
        hours: clinicData.hours || '',
        notes: clinicData.notes || null,
        updatedAt: new Date(),
      },
    });

    return updatedClinic;
  }

  private async logSyncResult(successCount: number, errorCount: number, totalCount: number) {
    try {
      const { prisma } = await import('./database');
      
      await prisma.webhookLog.create({
        data: {
          source: 'clinic_sync',
          event: 'sync_completed',
          data: JSON.stringify({
            successCount,
            errorCount,
            totalCount,
            timestamp: new Date().toISOString(),
          }),
          status: errorCount === 0 ? 'success' : 'error',
          error: errorCount > 0 ? `${errorCount} clinics failed to sync` : null,
        },
      });
    } catch (error) {
      console.error('Failed to log sync result:', error);
    }
  }

  private async logSyncError(error: any) {
    try {
      const { prisma } = await import('./database');
      
      await prisma.webhookLog.create({
        data: {
          source: 'clinic_sync',
          event: 'sync_failed',
          data: JSON.stringify({
            error: error.message,
            timestamp: new Date().toISOString(),
          }),
          status: 'error',
          error: error.message,
        },
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }
  }

  // Manual sync method for testing
  async manualSync() {
    console.log('🔄 Manual clinic sync triggered...');
    await this.syncClinics();
  }
}

export const syncService = new SyncService();
