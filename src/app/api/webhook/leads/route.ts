import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';
import { Lead } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional but recommended)
    const secret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET;
    
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

        const body: any = await request.json();
    
        // Validate required fields
        const requiredFields = ['session_id', 'clinic_id', 'name', 'phone', 'treatment_id', 'message'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { success: false, error: `Missing required field: ${field}` },
              { status: 400 }
            );
          }
        }

        // Create lead data
        const leadData: Omit<Lead, 'timestamp'> = {
          session_id: body.session_id,
          clinic_id: body.clinic_id,
          lang: body.lang || 'EN',
          name: body.name,
          phone: body.phone,
          treatment_id: body.treatment_id,
          message: body.message,
          notes: body.notes,
        };

    const lead = await databaseService.createLead(leadData);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Log webhook event
    await logWebhookEvent('n8n', 'lead_created', body, 'success');

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead created successfully',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Log webhook error
    await logWebhookEvent('n8n', 'lead_created', await request.json(), 'error', error.message);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function logWebhookEvent(
  source: string,
  event: string,
  data: any,
  status: 'success' | 'error' | 'pending',
  error?: string
) {
  try {
    const { prisma } = await import('@/lib/database');
    await prisma.webhookLog.create({
      data: {
        source,
        event,
        data: JSON.stringify(data),
        status,
        error,
      },
    });
  } catch (err) {
    console.error('Failed to log webhook event:', err);
  }
}
