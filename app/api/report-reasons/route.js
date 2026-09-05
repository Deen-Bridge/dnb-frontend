// app/api/report-reasons/route.js
import { NextResponse } from 'next/server';
import { REPORT_REASON_GROUPS } from '@/lib/reportReasons';
import { getReasons, createReason } from '@/lib/report-reasons-store';

export async function GET() {
  const groups = Object.values(REPORT_REASON_GROUPS).map(({ id, label, description }) => ({
    id,
    label,
    description,
  }));

  return NextResponse.json({ groups, reasons: getReasons() });
}

export async function POST(request) {
  const body = await request.json();
  const { group, label, description } = body || {};

  if (!group || !label) {
    return NextResponse.json({ error: 'Group and label are required.' }, { status: 400 });
  }

  const groupExists = Object.values(REPORT_REASON_GROUPS).some((g) => g.id === group);
  if (!groupExists) {
    return NextResponse.json({ error: `Unknown group: ${group}` }, { status: 400 });
  }

  const newReason = createReason({ group, label, description });
  return NextResponse.json(newReason, { status: 201 });
}
