import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    // If no clinic_id provided, get stats for the demo clinic
    const targetClinicId = clinicId || 'clinic-1';

    const stats = await databaseService.getStats(targetClinicId);

    return NextResponse.json({
      success: true,
      data: stats,
      message: clinicId ? `Stats for clinic ${clinicId}` : 'Stats for demo clinic (clinic-1)',
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
