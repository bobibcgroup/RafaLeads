import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '@/lib/syncService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual clinic sync triggered via API');
    await syncService.manualSync();
    
    return NextResponse.json({
      success: true,
      message: 'Clinic sync completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Manual sync failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Clinic sync service is running',
      webhook_url: 'https://primary-production-eb3d.up.railway.app/webhook/getClinics',
      sync_interval: '5 minutes',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync status check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Status check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
