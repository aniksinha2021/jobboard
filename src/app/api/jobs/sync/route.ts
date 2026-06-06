import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchFromJSearch } from '@/lib/jsearch';

const JOB_QUERIES = [
  'full stack engineer',
  'forward deployment engineer',
  'product manager',
  'backend engineer',
  'frontend engineer',
  'devops engineer',
  'data scientist',
  'UX designer',
];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const query of JOB_QUERIES) {
    try {
      const jobs = await fetchFromJSearch(query);
      for (const job of jobs) {
        try {
          await prisma.job.upsert({
            where: { externalId: job.externalId },
            update: { isActive: true },
            create: job,
          });
          created++;
        } catch {
          skipped++;
        }
      }
      await prisma.searchCache.upsert({
        where: { query },
        update: { fetchedAt: new Date() },
        create: { query, fetchedAt: new Date() },
      });
    } catch (err) {
      errors.push(`Query "${query}" error: ${String(err)}`);
    }
  }

  return NextResponse.json({ created, skipped, errors });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
