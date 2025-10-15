import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const { session_id } = params;
    const { notes } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const success = await databaseService.updateLeadNotes(session_id, notes);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Lead not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Lead updated successfully' },
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
