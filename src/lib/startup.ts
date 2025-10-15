import { syncService } from './syncService';

let syncStarted = false;

export async function startServices() {
  if (syncStarted) {
    console.log('⚠️ Services already started');
    return;
  }

  try {
    console.log('🚀 Starting RafaLeads services...');
    
    // Start clinic sync service
    await syncService.startSync();
    
    syncStarted = true;
    console.log('✅ All services started successfully');
  } catch (error) {
    console.error('❌ Failed to start services:', error);
  }
}

// Start services when this module is imported
if (typeof window === 'undefined') { // Only in server environment
  startServices().catch(console.error);
}
