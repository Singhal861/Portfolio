import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import {
  readUserVerbs,
  SHEET_HEADERS,
} from '../../../../lib/googleSheets';
import { sendCsvEmail } from '../../../../lib/mail';

// Global in-memory store for export counts
// Key: `${email}:${dateString}`
// Value: number (count of actions)
const exportCounts = new Map<string, number>();

function getExportCount(email: string): number {
  const dateString = new Date().toISOString().split('T')[0];
  const key = `${email}:${dateString}`;
  return exportCounts.get(key) || 0;
}

function incrementExportCount(email: string) {
  const dateString = new Date().toISOString().split('T')[0];
  const key = `${email}:${dateString}`;
  const current = exportCounts.get(key) || 0;
  exportCounts.set(key, current + 1);
}

function escapeCsv(value: unknown) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

function toCsv(rows: Record<string, string>[]) {
  const headerLine = SHEET_HEADERS.join(',');
  const dataLines = rows.map((row) =>
    SHEET_HEADERS.map((header) => escapeCsv(row[header] || '')).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

async function userCsv() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  const userRows = await readUserVerbs(email);
  return { email, csv: toCsv(userRows) };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentCount = getExportCount(email);
    if (currentCount >= 5) {
      return NextResponse.json(
        { error: "You have reached today's data export limit of 5. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const result = await userCsv();
    if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    incrementExportCount(email);

    return new NextResponse(`﻿${result.csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="my-japanese-verbs-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Verb export error', error);
    return NextResponse.json({ error: 'Unable to export verbs right now.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentCount = getExportCount(email);
    if (currentCount >= 5) {
      return NextResponse.json(
        { error: "You have reached today's data export limit of 5. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const result = await userCsv();
    if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let targetEmail = result.email;
    try {
      const body = await request.json();
      if (body?.email && typeof body.email === 'string' && body.email.includes('@')) {
        targetEmail = body.email.trim().toLowerCase();
      }
    } catch {
      // Body is optional, default to authenticated user's email
    }

    await sendCsvEmail(targetEmail, 'Your Japanese Verbs Sheet', result.csv);
    incrementExportCount(email);

    return NextResponse.json({ success: true, emailedTo: targetEmail });
  } catch (error) {
    console.error('Verb email error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to email verbs right now.' },
      { status: 500 }
    );
  }
}