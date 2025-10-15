import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { success: false, error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching leads for clinic:', clinicId);

    const leads = await databaseService.getLeads(clinicId);

    console.log('📋 Found leads:', leads.length);

    return NextResponse.json({
      success: true,
      data: {
        leads,
        count: leads.length,
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}