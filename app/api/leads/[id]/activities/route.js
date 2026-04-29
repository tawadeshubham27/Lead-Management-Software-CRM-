import { NextResponse } from 'next/server';
import { prisma } from '../../../../../utils/prisma';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // verify lead exists
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const newActivity = await prisma.activity.create({
      data: {
        leadId: id,
        type: body.type || 'NOTE',
        content: body.content
      }
    });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
