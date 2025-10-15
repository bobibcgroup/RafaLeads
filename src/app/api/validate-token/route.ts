import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate token using database service
    const validation = await databaseService.validateToken(body.token);
    
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        clinic_id: validation.clinic_id,
        clinic_name: validation.clinic_name,
        valid: true,
      },
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}