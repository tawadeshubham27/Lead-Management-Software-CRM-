import { NextResponse } from 'next/server';
import { prisma } from '../../../utils/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate phone number to avoid duplicates
    if (body.phone) {
      const existingLead = await prisma.lead.findUnique({
        where: { phone: body.phone }
      });
      if (existingLead) {
        return NextResponse.json(
          { error: 'A lead with this phone number already exists' }, 
          { 
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }
    }

    const newLead = await prisma.lead.create({
      data: {
        name: body.name || 'Unknown',
        email: body.email || null,
        phone: body.phone || null,
        source: body.source || 'Website',
        status: body.status || 'New',
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      }
    });

    if (body.notes) {
      await prisma.activity.create({
        data: {
          leadId: newLead.id,
          type: 'NOTE',
          content: body.notes
        }
      });
    }

    // Automatically trigger WhatsApp notification to the agency
    try {
      const apiKey = process.env.CALLMEBOT_API_KEY;
      const phone = process.env.NEXT_PUBLIC_AGENCY_PHONE;
      const notificationMessage = `🚀 New lead captured!\nName: ${newLead.name}\nPhone: ${newLead.phone}\nSource: ${newLead.source}`;

      if (apiKey && phone) {
        // Ensure phone has + prefix for CallMeBot
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(formattedPhone)}&text=${encodeURIComponent(notificationMessage)}&apikey=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
           console.log(`✅ Automated WhatsApp notification sent successfully to ${formattedPhone} via CallMeBot`);
        } else {
           console.error('CallMeBot API Error:', await response.text());
        }
      } else {
        console.log('CallMeBot API Key is missing. Notification not sent.');
      }
    } catch (notifErr) {
       console.error('Failed to trigger internal WhatsApp notification:', notifErr);
    }
    

    return NextResponse.json(newLead, { 
      status: 201,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create lead' }, 
      { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
