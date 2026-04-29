import { NextResponse } from 'next/server';
import { prisma } from '../../../../utils/prisma';

// This is a simplified webhook endpoint simulating incoming WhatsApp messages
export async function POST(request) {
  try {
    const body = await request.json();
    
    // In a real webhook from Twilio/360dialog, you'd extract these fields from the payload structure
    const senderPhone = body.from;
    const messageContent = body.body;
    
    if (!senderPhone || !messageContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if a lead with this phone number exists
    let lead = await prisma.lead.findUnique({
      where: { phone: senderPhone }
    });

    let isNewLead = false;

    // 2. If not, auto-create the lead
    if (!lead) {
      isNewLead = true;
      lead = await prisma.lead.create({
        data: {
          name: `WhatsApp Lead (${senderPhone})`,
          phone: senderPhone,
          source: 'WhatsApp',
          status: 'New',
        }
      });
      
      // Log creation activity
      await prisma.activity.create({
        data: {
          leadId: lead.id,
          type: 'NOTE',
          content: 'Lead auto-created from incoming WhatsApp message.'
        }
      });
    }

    // 3. Save the incoming message
    const message = await prisma.message.create({
      data: {
        leadId: lead.id,
        direction: 'INCOMING',
        content: messageContent,
      }
    });

    // 4. If existing lead, maybe update status or log activity
    if (!isNewLead) {
      // For instance, if status was "Lost", maybe set to "Contacted"
      if (lead.status === 'Lost') {
         await prisma.lead.update({
           where: { id: lead.id },
           data: { status: 'Contacted' }
         });
         await prisma.activity.create({
            data: {
              leadId: lead.id,
              type: 'STATUS_CHANGE',
              content: 'Status changed from Lost to Contacted due to new incoming message.'
            }
         });
      }
    }

    return NextResponse.json({ success: true, messageId: message.id, leadId: lead.id });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
