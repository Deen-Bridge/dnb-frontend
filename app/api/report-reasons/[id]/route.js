// app/api/report-reasons/[id]/route.js
import { NextResponse } from 'next/server';
import { getReasonById, updateReason, mergeReason } from '@/lib/report-reasons-store';
import { REPORT_REASON_GROUPS } from '@/lib/reportReasons';

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const existing = getReasonById(id);

  if (!existing) {
    return NextResponse.json({ error: 'Reason not found.' }, { status: 404 });
  }

  const updates = {};

  if (body.label !== undefined) updates.label = body.label;
  if (body.description !== undefined) updates.description = body.description;
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

  if (body.group !== undefined) {
    if (!REPORT_REASON_GROUPS[body.group]) {
      return NextResponse.json({ error: `Unknown group: ${body.group}` }, { status: 400 });
    }
    updates.group = body.group;
  }

  const updated = updateReason(id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const { mergeInto } = body;

  if (!mergeInto) {
    return NextResponse.json(
      { error: 'mergeInto is required to preserve historical data. Merging is the supported way to remove a reason.' },
      { status: 400 }
    );
  }

  const result = mergeReason(id, mergeInto);

  if (!result) {
    return NextResponse.json({ error: 'Reason not found.' }, { status: 404 });
  }

  return NextResponse.json(result);
}
