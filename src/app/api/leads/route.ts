import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const treatment = searchParams.get('treatment');

    if (!clinicId) {
      return NextResponse.json(
        { success: false, error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      treatment: treatment ? treatment.split(',') : undefined,
    };

    const leads = await databaseService.getLeads(clinicId, filters);

    return NextResponse.json({
      success: true,
      data: {
        leads,
        total: leads.length,
        page: 1,
        limit: 1000,
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
