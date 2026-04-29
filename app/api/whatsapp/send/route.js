import { NextResponse } from 'next/server';
import { prisma } from '../../../../utils/prisma';

export async function POST(request) {
  try {
    const { leadId, message } = await request.json();
    
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const notificationMessage = message || `Hi ${lead.name}, thanks for contacting us!`;

    // Create a message record to show it was "sent"
    const newMessage = await prisma.message.create({
      data: {
        leadId: lead.id,
        direction: 'OUTGOING',
        content: notificationMessage,
        status: 'SENT'
      }
    });

    // Also add to activity log
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'STATUS_CHANGE',
        content: `WhatsApp notification generated for ${lead.name}`
      }
    });

    // Send real WhatsApp notification via CallMeBot if API key is configured
    const apiKey = process.env.CALLMEBOT_API_KEY;
    const phone = process.env.NEXT_PUBLIC_AGENCY_PHONE;

    if (apiKey && phone) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(notificationMessage)}&apikey=${apiKey}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`CallMeBot API Error: ${response.statusText}`);
        } else {
          console.log(`✅ WhatsApp notification sent successfully to ${phone} via CallMeBot`);
        }
      } catch (err) {
        console.error('Failed to call CallMeBot API:', err);
      }
    } else {
      console.log('--- MOCK WHATSAPP SEND (CallMeBot not configured) ---');
      console.log(`To: ${phone || lead.phone}`);
      console.log(`Message: ${notificationMessage}`);
      console.log('----------------------------------------------------');
      console.log('To enable real notifications, configure CALLMEBOT_API_KEY in .env');
    }

    return NextResponse.json({ success: true, messageId: newMessage.id });
  } catch (error) {
    console.error('WhatsApp Mock Send Error:', error);
    return NextResponse.json({ error: 'Failed to simulate WhatsApp send' }, { status: 500 });
  }
}
