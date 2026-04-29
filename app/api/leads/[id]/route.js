import { NextResponse } from 'next/server';
import { prisma } from '../../../../utils/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { timestamp: 'desc' } },
        messages: { orderBy: { timestamp: 'desc' } }
      }
    });
    
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json(lead);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if status changed to log it
    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        status: body.status,
        source: body.source,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      }
    });

    if (existingLead.status !== body.status && body.status) {
      await prisma.activity.create({
        data: {
          leadId: id,
          type: 'STATUS_CHANGE',
          content: `Status changed from ${existingLead.status} to ${body.status}`
        }
      });
    }
    
    if (body.notes) {
      await prisma.activity.create({
        data: {
          leadId: id,
          type: 'NOTE',
          content: body.notes
        }
      });
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.lead.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
