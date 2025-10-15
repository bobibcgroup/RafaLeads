import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.clinic_id) {
      return NextResponse.json(
        { success: false, error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    // Check if clinic exists
    const clinic = await databaseService.getClinicById(body.clinic_id);
    if (!clinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (body.days || 365)); // Default 1 year

    const tokenData = await databaseService.createToken({
      token,
      clinic_id: body.clinic_id,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      active: true,
    });

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Failed to create token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        token,
        clinic_id: body.clinic_id,
        clinic_name: clinic.name,
        expires_at: tokenData.expires_at,
        dashboard_url: `${process.env.NEXTAUTH_URL || 'https://rafaleads-production.up.railway.app'}/dashboard/${token}`,
      },
      message: 'Token created successfully',
    });
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    const { prisma } = await import('@/lib/database');
    
    const where = clinicId ? { clinicId } : {};
    
    const tokens = await prisma.dashboardToken.findMany({
      where,
      include: {
        clinic: {
          select: {
            name: true,
            clinicId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const tokenData = tokens.map(token => ({
      token: token.token,
      clinic_id: token.clinicId,
      clinic_name: token.clinic.name,
      created_at: token.createdAt.toISOString(),
      expires_at: token.expiresAt.toISOString(),
      active: token.active,
      dashboard_url: `${process.env.NEXTAUTH_URL || 'https://rafaleads-production.up.railway.app'}/dashboard/${token.token}`,
    }));

    return NextResponse.json({
      success: true,
      data: tokenData,
      count: tokenData.length,
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
