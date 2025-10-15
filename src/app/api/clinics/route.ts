import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (clinicId) {
      // Get specific clinic
      const clinic = await databaseService.getClinicById(clinicId);
      if (!clinic) {
        return NextResponse.json(
          { success: false, error: 'Clinic not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: clinic,
      });
    } else {
      // Get all clinics
      const { prisma } = await import('@/lib/database');
      const clinics = await prisma.clinic.findMany({
        select: {
          clinicId: true,
          name: true,
          city: true,
          whatsapp: true,
          phone: true,
          email: true,
          website: true,
          address: true,
          hours: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({
        success: true,
        data: clinics,
        count: clinics.length,
      });
    }
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['clinic_id', 'name', 'city', 'whatsapp', 'phone', 'email', 'address', 'hours'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const clinic = await databaseService.createClinic({
      clinic_id: body.clinic_id,
      name: body.name,
      city: body.city,
      whatsapp: body.whatsapp,
      phone: body.phone,
      email: body.email,
      website: body.website || null,
      address: body.address,
      hours: body.hours,
      notes: body.notes || null,
    });

    if (!clinic) {
      return NextResponse.json(
        { success: false, error: 'Failed to create clinic' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: clinic,
      message: 'Clinic created successfully',
    });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
